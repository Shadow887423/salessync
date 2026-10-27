<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\DataRecord;
use App\Services\ChartDataService;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Carbon;
use Throwable;

class ChartDataController extends Controller
{
    protected ChartDataService $chartDataService;

    public function __construct(ChartDataService $chartDataService)
    {
        $this->chartDataService = $chartDataService;
    }

    /**
     * Return all chart datasets and summary stats.
     *
     * @return JsonResponse
     */
    public function index(): JsonResponse
    {
        try {
            $chartData = $this->chartDataService->getAllChartData();
            return response()->json($chartData);
        } catch (Throwable $e) {
            report($e);
            return response()->json([
                'success' => false,
                'message' => 'Unable to retrieve chart analytics at this time.',
            ], 500);
        }
    }

    /**
     * Return chart data filtered by a specific category.
     * Hardening: Strict sanitization and regex validation on the category parameter.
     *
     * @param  string  $category
     * @return JsonResponse
     */
    public function byCategory(string $category): JsonResponse
    {
        // Sanitize category parameter
        $cleanCategory = trim(strip_tags(str_replace(chr(0), '', $category)));

        // Security check: length and character whitelist
        if (mb_strlen($cleanCategory) > 100 || !preg_match('/^[\pL\s\d\-&,\'()\/]+$/u', $cleanCategory)) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid category parameter provided.',
            ], 400);
        }

        try {
            $records = DataRecord::byCategory($cleanCategory)
                ->orderBy('record_date')
                ->get();

            if ($records->isEmpty()) {
                return response()->json([
                    'message' => 'No records found for category: ' . htmlspecialchars($cleanCategory, ENT_QUOTES, 'UTF-8'),
                    'barData' => ['labels' => [], 'values' => []],
                    'lineData' => ['labels' => [], 'values' => []],
                    'pieData' => ['labels' => [], 'values' => [], 'percentages' => []],
                    'stats' => [
                        'totalRecords' => 0,
                        'totalValue' => 0,
                        'averageValue' => 0,
                        'highestRecord' => null,
                        'monthlyGrowth' => 0,
                    ],
                ]);
            }

            $totalValue = round((float) $records->sum('value'), 2);

            // Bar data: single category
            $barData = [
                'labels' => [$cleanCategory],
                'values' => [$totalValue],
            ];

            // Line data: records over time by month
            $monthlyData = $records->groupBy(function ($record) {
                return $record->record_date->format('Y-m');
            })->sortKeys()->map(function ($group) {
                return round((float) $group->sum('value'), 2);
            });

            $lineData = [
                'labels' => $monthlyData->keys()->map(function ($key) {
                    return Carbon::createFromFormat('Y-m', $key)->format('M Y');
                })->values()->toArray(),
                'values' => $monthlyData->values()->toArray(),
            ];

            // Pie data: 100% for single category
            $pieData = [
                'labels' => [$cleanCategory],
                'values' => [$totalValue],
                'percentages' => [100.0],
            ];

            // Stats for this category
            $highestRecord = $records->sortByDesc('value')->first();
            $stats = [
                'totalRecords' => $records->count(),
                'totalValue' => $totalValue,
                'averageValue' => round((float) $records->avg('value'), 2),
                'highestRecord' => $highestRecord ? [
                    'id' => $highestRecord->id,
                    'value' => round((float) $highestRecord->value, 2),
                    'category' => $highestRecord->category,
                    'formatted_value' => $highestRecord->formatted_value,
                ] : null,
                'monthlyGrowth' => 0,
            ];

            return response()->json([
                'barData' => $barData,
                'lineData' => $lineData,
                'pieData' => $pieData,
                'stats' => $stats,
            ]);
        } catch (Throwable $e) {
            report($e);
            return response()->json([
                'success' => false,
                'message' => 'An error occurred while compiling category statistics.',
            ], 500);
        }
    }
}
