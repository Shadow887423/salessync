@extends('layouts.app')

@section('content')
<div class="dashboard-container">

    <!-- Row 1: Summary Cards -->
    <div class="stats-grid">
        <div class="stat-card stat-card--primary">
            <div class="stat-card__icon">
                <i class="fas fa-database"></i>
            </div>
            <div class="stat-card__content">
                <span class="stat-card__label">Total Records</span>
                <span class="stat-card__value" id="statTotalRecords" data-value="{{ $stats['totalRecords'] }}">{{ $stats['totalRecords'] }}</span>
            </div>
        </div>

        <div class="stat-card stat-card--success">
            <div class="stat-card__icon">
                <i class="fas fa-dollar-sign"></i>
            </div>
            <div class="stat-card__content">
                <span class="stat-card__label">Total Revenue</span>
                <span class="stat-card__value" id="statTotalValue" data-value="{{ $stats['totalValue'] }}">${{ number_format($stats['totalValue'], 2) }}</span>
            </div>
        </div>

        <div class="stat-card stat-card--warning">
            <div class="stat-card__icon">
                <i class="fas fa-chart-line"></i>
            </div>
            <div class="stat-card__content">
                <span class="stat-card__label">Average Sale</span>
                <span class="stat-card__value" id="statAverageValue" data-value="{{ $stats['averageValue'] }}">${{ number_format($stats['averageValue'], 2) }}</span>
            </div>
        </div>

        <div class="stat-card stat-card--danger">
            <div class="stat-card__icon">
                <i class="fas fa-trophy"></i>
            </div>
            <div class="stat-card__content">
                <span class="stat-card__label">Top Category</span>
                <span class="stat-card__value stat-card__value--small" id="statTopCategory">
                    @if($stats['highestRecord'])
                        {{ $stats['highestRecord']['category'] }}
                        <span class="stat-card__sub">${{ number_format($stats['highestRecord']['value'], 2) }}</span>
                    @else
                        N/A
                    @endif
                </span>
            </div>
        </div>
    </div>

    <!-- Row 2: Chart + Form -->
    <div class="content-grid">
        <!-- LEFT: Chart Area (60%) -->
        <div class="chart-section">
            @include('dashboard.chart', ['stats' => $stats])
        </div>

        <!-- RIGHT: Form Area (40%) -->
        <div class="form-section">
            @include('dashboard.form')
        </div>
    </div>

    <!-- Row 3: Records Table -->
    <div class="table-section">
        @include('dashboard.records', ['records' => $records, 'stats' => $stats])
    </div>

</div>
@endsection
