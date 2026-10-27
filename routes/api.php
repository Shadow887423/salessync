<?php

use App\Http\Controllers\Api\ChartDataController;
use App\Http\Controllers\DataController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application.
| Security Hardening:
| - Rate limiting throttles brute force and DoS attacks.
| - Strict regex/number where-constraints prevent URL-level injection and path traversal.
|
*/

// Read-only chart data routes (throttled at 60 req/min)
Route::middleware(['throttle:api'])->group(function () {
    Route::get('/chart-data', [ChartDataController::class, 'index']);
    Route::get('/chart-data/{category}', [ChartDataController::class, 'byCategory'])
        ->where('category', '[a-zA-Z0-9\s\-&,\'()\/]+');
});

// Write operations (Create, Update, Delete) (throttled at 30 req/min)
Route::middleware(['throttle:api-write'])->group(function () {
    Route::post('/records', [DataController::class, 'store']);
    Route::put('/records/{dataRecord}', [DataController::class, 'update'])
        ->whereNumber('dataRecord');
    Route::delete('/records/{dataRecord}', [DataController::class, 'destroy'])
        ->whereNumber('dataRecord');
});
