<?php

namespace App\Http\Controllers;

use App\Models\DataRecord;
use App\Services\ChartDataService;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    /**
     * Display the main dashboard with records and summary statistics.
     *
     * @return \Illuminate\View\View
     */
    public function index()
    {
        $records = DataRecord::orderBy('record_date', 'desc')->get();

        $totalRecords = $records->count();
        $totalValue = round((float) $records->sum('value'), 2);
        $averageValue = $totalRecords > 0 ? round((float) $records->avg('value'), 2) : 0;
        $highestRecord = $records->sortByDesc('value')->first();

        $stats = [
            'totalRecords' => $totalRecords,
            'totalValue' => $totalValue,
            'averageValue' => $averageValue,
            'highestRecord' => $highestRecord,
        ];

        return view('dashboard.index', compact('records', 'stats'));
    }
}
