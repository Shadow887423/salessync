<?php

namespace App\Services;

use App\Models\DataRecord;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;

class ChartDataService
{
    /**
     * Get bar chart data grouped by category.
     *
     * @return array{labels: array, values: array}
     */
    public function getBarChartData(): array
    {
        $data = DataRecord::select('category', DB::raw('SUM(value) as total'))
            ->groupBy('category')
            ->orderBy('category')
            ->get();

        return [
            'labels' => $data->pluck('category')->toArray(),
            'values' => $data->pluck('total')->map(fn ($v) => round((float) $v, 2))->toArray(),
        ];
    }

    /**
     * Get line chart data grouped by month.
     *
     * @return array{labels: array, values: array}
     */
    public function getLineChartData(): array
    {
        $driver = DB::connection()->getDriverName();
        $monthExpr = ($driver === 'sqlite')
            ? "strftime('%Y-%m', record_date)"
            : "DATE_FORMAT(record_date, '%Y-%m')";

        $data = DataRecord::select(
                DB::raw("{$monthExpr} as month_key"),
                DB::raw('SUM(value) as total')
            )
            ->groupBy('month_key')
            ->orderBy('month_key')
            ->get();

        $labels = $data->map(function ($item) {
            return Carbon::createFromFormat('Y-m', $item->month_key)->format('M Y');
        })->toArray();

        $values = $data->pluck('total')->map(fn ($v) => round((float) $v, 2))->toArray();

        return [
            'labels' => $labels,
            'values' => $values,
        ];
    }

    /**
     * Get pie chart data showing percentage distribution by category.
     *
     * @return array{labels: array, values: array, percentages: array}
     */
    public function getPieChartData(): array
    {
        $data = DataRecord::select('category', DB::raw('SUM(value) as total'))
            ->groupBy('category')
            ->orderBy('total', 'desc')
            ->get();

        $grandTotal = $data->sum('total');

        $percentages = $data->map(function ($item) use ($grandTotal) {
            return $grandTotal > 0 ? round(((float) $item->total / (float) $grandTotal) * 100, 1) : 0;
        })->toArray();

        return [
            'labels' => $data->pluck('category')->toArray(),
            'values' => $data->pluck('total')->map(fn ($v) => round((float) $v, 2))->toArray(),
            'percentages' => $percentages,
        ];
    }

    /**
     * Get summary statistics.
     *
     * @return array
     */
    public function getStats(): array
    {
        $totalRecords = DataRecord::count();
        $totalValue = round((float) DataRecord::sum('value'), 2);
        $averageValue = $totalRecords > 0 ? round((float) DataRecord::avg('value'), 2) : 0;

        $highestRecord = DataRecord::orderBy('value', 'desc')->first();

        // Calculate monthly growth
        $currentMonth = Carbon::now()->startOfMonth();
        $previousMonth = Carbon::now()->subMonth()->startOfMonth();

        $currentMonthTotal = (float) DataRecord::whereBetween('record_date', [
            $currentMonth->toDateString(),
            Carbon::now()->endOfMonth()->toDateString(),
        ])->sum('value');

        $previousMonthTotal = (float) DataRecord::whereBetween('record_date', [
            $previousMonth->toDateString(),
            $previousMonth->endOfMonth()->toDateString(),
        ])->sum('value');

        $monthlyGrowth = $previousMonthTotal > 0
            ? round((($currentMonthTotal - $previousMonthTotal) / $previousMonthTotal) * 100, 1)
            : 0;

        return [
            'totalRecords' => $totalRecords,
            'totalValue' => $totalValue,
            'averageValue' => $averageValue,
            'highestRecord' => $highestRecord ? [
                'id' => $highestRecord->id,
                'value' => round((float) $highestRecord->value, 2),
                'category' => $highestRecord->category,
                'formatted_value' => $highestRecord->formatted_value,
            ] : null,
            'monthlyGrowth' => $monthlyGrowth,
        ];
    }

    /**
     * Get all chart data combined.
     *
     * @return array
     */
    public function getAllChartData(): array
    {
        return [
            'barData' => $this->getBarChartData(),
            'lineData' => $this->getLineChartData(),
            'pieData' => $this->getPieChartData(),
            'stats' => $this->getStats(),
        ];
    }
}
