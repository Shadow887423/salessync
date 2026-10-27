<div class="card">
    <div class="card__header">
        <h2 class="card__title">
            <i class="fas fa-chart-bar"></i> Sales Overview
        </h2>
        <div class="chart-tabs" id="chartTabs">
            <button class="chart-tab active" data-type="bar">
                <i class="fas fa-chart-bar"></i> Bar
            </button>
            <button class="chart-tab" data-type="line">
                <i class="fas fa-chart-line"></i> Line
            </button>
            <button class="chart-tab" data-type="pie">
                <i class="fas fa-chart-pie"></i> Pie
            </button>
        </div>
    </div>
    <div class="card__body">
        <div class="chart-container">
            <!-- Loading Spinner -->
            <div id="chartLoading" class="chart-loading" style="display: none;">
                <div class="spinner"></div>
                <p>Loading chart data...</p>
            </div>

            <!-- Empty State -->
            <div id="chartEmpty" class="chart-empty" @if(isset($stats) && $stats['totalRecords'] > 0) style="display: none;" @endif>
                <i class="fas fa-chart-area"></i>
                <h3>No data yet</h3>
                <p>Add your first record to see beautiful charts!</p>
            </div>

            <!-- Chart Canvas -->
            <canvas id="mainChart" @if(isset($stats) && $stats['totalRecords'] == 0) style="display: none;" @endif></canvas>
        </div>
    </div>
</div>
