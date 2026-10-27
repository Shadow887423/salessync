<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreDataRequest;
use App\Models\DataRecord;
use App\Services\ChartDataService;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Throwable;

class DataController extends Controller
{
    protected ChartDataService $chartDataService;

    public function __construct(ChartDataService $chartDataService)
    {
        $this->chartDataService = $chartDataService;
    }

    /**
     * Store a newly created data record.
     * Hardening: Atomic database transaction prevents partial writes.
     *
     * @param  StoreDataRequest  $request
     * @return JsonResponse
     */
    public function store(StoreDataRequest $request): JsonResponse
    {
        try {
            $record = DB::transaction(function () use ($request) {
                return DataRecord::create($request->validated());
            });

            return response()->json([
                'success' => true,
                'message' => 'Record created successfully.',
                'record' => $record,
                'stats' => $this->chartDataService->getStats(),
                'chartData' => $this->chartDataService->getAllChartData(),
            ], 201);
        } catch (Throwable $e) {
            report($e);
            return response()->json([
                'success' => false,
                'message' => 'Unable to save record due to a database error. Please try again.',
            ], 500);
        }
    }

    /**
     * Update the specified data record.
     * Hardening: Atomic transaction and strict validated payload.
     *
     * @param  StoreDataRequest  $request
     * @param  DataRecord  $dataRecord
     * @return JsonResponse
     */
    public function update(StoreDataRequest $request, DataRecord $dataRecord): JsonResponse
    {
        try {
            DB::transaction(function () use ($request, $dataRecord) {
                $dataRecord->update($request->validated());
            });

            return response()->json([
                'success' => true,
                'message' => 'Record updated successfully.',
                'record' => $dataRecord->fresh(),
                'stats' => $this->chartDataService->getStats(),
                'chartData' => $this->chartDataService->getAllChartData(),
            ]);
        } catch (Throwable $e) {
            report($e);
            return response()->json([
                'success' => false,
                'message' => 'Unable to update record due to a database error.',
            ], 500);
        }
    }

    /**
     * Remove the specified data record.
     * Hardening: Atomic transaction and error shielding.
     *
     * @param  DataRecord  $dataRecord
     * @return JsonResponse
     */
    public function destroy(DataRecord $dataRecord): JsonResponse
    {
        try {
            DB::transaction(function () use ($dataRecord) {
                $dataRecord->delete();
            });

            return response()->json([
                'success' => true,
                'message' => 'Record deleted successfully.',
                'stats' => $this->chartDataService->getStats(),
                'chartData' => $this->chartDataService->getAllChartData(),
            ]);
        } catch (Throwable $e) {
            report($e);
            return response()->json([
                'success' => false,
                'message' => 'Unable to delete record due to a database error.',
            ], 500);
        }
    }
}
