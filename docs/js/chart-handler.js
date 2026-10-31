/**
 * SalesSync — Chart Handler
 * Handles Chart.js initialization, rendering, switching types, and live animated updates.
 */

class ChartManager {
    constructor() {
        this.chartInstance = null;
        this.currentType = 'bar'; // 'bar', 'line', 'pie'
        this.cachedData = {
            barData: { labels: [], values: [] },
            lineData: { labels: [], values: [] },
            pieData: { labels: [], values: [], percentages: [] },
            stats: {}
        };

        // SaaS Color Palette
        this.palette = {
            primary: 'rgba(79, 70, 229, 0.85)',
            primaryBorder: '#4F46E5',
            secondary: 'rgba(16, 185, 129, 0.85)',
            secondaryBorder: '#10B981',
            accent: 'rgba(245, 158, 11, 0.85)',
            accentBorder: '#F59E0B',
            danger: 'rgba(239, 68, 68, 0.85)',
            dangerBorder: '#EF4444',
            info: 'rgba(14, 165, 233, 0.85)',
            infoBorder: '#0EA5E9',
            purple: 'rgba(168, 85, 247, 0.85)',
            purpleBorder: '#A855F7',
            pink: 'rgba(236, 72, 153, 0.85)',
            pinkBorder: '#EC4899',
            teal: 'rgba(20, 184, 166, 0.85)',
            tealBorder: '#14B8A6',
            orange: 'rgba(249, 115, 22, 0.85)',
            orangeBorder: '#F97316',
            slate: 'rgba(100, 116, 139, 0.85)',
            slateBorder: '#64748B'
        };

        this.colors = [
            { bg: 'rgba(79, 70, 229, 0.8)', border: '#4F46E5' },
            { bg: 'rgba(16, 185, 129, 0.8)', border: '#10B981' },
            { bg: 'rgba(245, 158, 11, 0.8)', border: '#F59E0B' },
            { bg: 'rgba(14, 165, 233, 0.8)', border: '#0EA5E9' },
            { bg: 'rgba(168, 85, 247, 0.8)', border: '#A855F7' },
            { bg: 'rgba(236, 72, 153, 0.8)', border: '#EC4899' },
            { bg: 'rgba(20, 184, 166, 0.8)', border: '#14B8A6' },
            { bg: 'rgba(249, 115, 22, 0.8)', border: '#F97316' },
            { bg: 'rgba(239, 68, 68, 0.8)', border: '#EF4444' },
            { bg: 'rgba(100, 116, 139, 0.8)', border: '#64748B' }
        ];

        this.canvas = document.getElementById('mainChart');
        this.emptyEl = document.getElementById('chartEmpty');
        this.loadingEl = document.getElementById('chartLoading');
    }

    /**
     * Initializer: binds elements and fetches chart data from server
     */
    async init() {
        if (!this.canvas) {
            this.canvas = document.getElementById('mainChart');
        }
        if (!this.emptyEl) {
            this.emptyEl = document.getElementById('chartEmpty');
        }
        if (!this.loadingEl) {
            this.loadingEl = document.getElementById('chartLoading');
        }

        this.showLoading();
        try {
            const response = await fetch('/api/chart-data', {
                headers: {
                    'Accept': 'application/json'
                }
            });

            if (response.ok) {
                const data = await response.json();
                this.updateChart(data);
                this.hideLoading();
                return;
            }
        } catch (error) {
            console.info('Backend API not reachable; compiling from initial table/local data.');
        }

        // Fallback: load from localStorage first, then from hardcoded table
        if (window.Dashboard && typeof window.Dashboard.loadFromLocalStorage === 'function') {
            window.Dashboard.loadFromLocalStorage();
        }

        if (window.Dashboard && typeof window.Dashboard.getRecordsFromTable === 'function') {
            const records = window.Dashboard.getRecordsFromTable();
            if (records.length > 0) {
                const metrics = window.Dashboard.calculateMetrics(records);
                this.updateChart(metrics);
                this.hideLoading();
                return;
            }
        }

        this.checkEmpty();
        this.hideLoading();
    }

    /**
     * Show or hide loading spinner
     */
    showLoading() {
        if (this.loadingEl) {
            this.loadingEl.style.display = 'flex';
            this.loadingEl.classList.add('show');
        }
    }

    hideLoading() {
        if (this.loadingEl) {
            this.loadingEl.style.display = 'none';
            this.loadingEl.classList.remove('show');
        }
    }

    /**
     * Show or hide empty state
     */
    showEmpty() {
        if (this.emptyEl) {
            this.emptyEl.style.display = 'flex';
            this.emptyEl.classList.add('show');
        }
        if (this.canvas) {
            this.canvas.style.display = 'none';
        }
        if (this.chartInstance) {
            this.chartInstance.destroy();
            this.chartInstance = null;
        }
    }

    hideEmpty() {
        if (this.emptyEl) {
            this.emptyEl.style.display = 'none';
            this.emptyEl.classList.remove('show');
        }
        if (this.canvas) {
            this.canvas.style.display = 'block';
        }
    }

    /**
     * Helper to verify if data has any records
     */
    checkEmpty() {
        const hasRecords = (this.cachedData.barData && this.cachedData.barData.labels && this.cachedData.barData.labels.length > 0) ||
                          (this.cachedData.stats && this.cachedData.stats.totalRecords > 0);
        if (!hasRecords) {
            this.showEmpty();
            return true;
        } else {
            this.hideEmpty();
            return false;
        }
    }

    /**
     * Update the chart with fresh data received from API
     * @param {Object} chartData
     */
    updateChart(chartData) {
        if (!chartData) return;

        this.cachedData = {
            barData: chartData.barData || { labels: [], values: [] },
            lineData: chartData.lineData || { labels: [], values: [] },
            pieData: chartData.pieData || { labels: [], values: [], percentages: [] },
            stats: chartData.stats || {}
        };

        if (this.checkEmpty()) {
            return;
        }

        this.renderCurrentType();
    }

    /**
     * Switch chart type between 'bar', 'line', 'pie'
     * @param {string} type
     */
    switchType(type) {
        if (!['bar', 'line', 'pie'].includes(type)) return;
        this.currentType = type;

        // Update active tab buttons if present
        document.querySelectorAll('.chart-tab').forEach(tab => {
            if (tab.getAttribute('data-type') === type) {
                tab.classList.add('active');
            } else {
                tab.classList.remove('active');
            }
        });

        if (!this.checkEmpty()) {
            this.renderCurrentType();
        }
    }

    /**
     * Render the active chart type
     */
    renderCurrentType() {
        switch (this.currentType) {
            case 'line':
                this.renderLineChart(this.cachedData.lineData);
                break;
            case 'pie':
                this.renderPieChart(this.cachedData.pieData);
                break;
            case 'bar':
            default:
                this.renderBarChart(this.cachedData.barData);
                break;
        }
    }

    /**
     * Render Bar Chart (Sales by Category)
     */
    renderBarChart(data) {
        if (!this.canvas) return;
        const ctx = this.canvas.getContext('2d');

        const labels = data && data.labels ? data.labels : [];
        const values = data && data.values ? data.values : [];

        if (labels.length === 0) {
            this.showEmpty();
            return;
        }
        this.hideEmpty();

        const bgColors = labels.map((_, i) => this.colors[i % this.colors.length].bg);
        const borderColors = labels.map((_, i) => this.colors[i % this.colors.length].border);

        const chartConfig = {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Sales Revenue ($)',
                    data: values,
                    backgroundColor: bgColors,
                    borderColor: borderColors,
                    borderWidth: 2,
                    borderRadius: 8,
                    borderSkipped: false,
                    hoverBackgroundColor: borderColors,
                    maxBarThickness: 56
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                animation: {
                    duration: 750,
                    easing: 'easeOutQuart'
                },
                layout: {
                    padding: { top: 10, right: 15, bottom: 5, left: 10 }
                },
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        backgroundColor: '#1E293B',
                        titleColor: '#F8FAFC',
                        bodyColor: '#F8FAFC',
                        padding: 12,
                        cornerRadius: 8,
                        titleFont: { family: 'Inter', size: 13, weight: '600' },
                        bodyFont: { family: 'Inter', size: 12 },
                        callbacks: {
                            label: (context) => {
                                const val = Number(context.parsed.y || 0).toLocaleString('en-US', {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2
                                });
                                return ` Revenue: $${val}`;
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        grid: {
                            display: false
                        },
                        ticks: {
                            font: { family: 'Inter', size: 12, weight: '500' },
                            color: '#64748B'
                        }
                    },
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: 'rgba(226, 232, 240, 0.7)',
                            drawBorder: false
                        },
                        ticks: {
                            font: { family: 'Inter', size: 11 },
                            color: '#64748B',
                            callback: (value) => `$${Number(value).toLocaleString()}`
                        }
                    }
                }
            }
        };

        this.applyOrUpdateChart(chartConfig);
    }

    /**
     * Render Line Chart (Revenue Over Time)
     */
    renderLineChart(data) {
        if (!this.canvas) return;
        const ctx = this.canvas.getContext('2d');

        const labels = data && data.labels ? data.labels : [];
        const values = data && data.values ? data.values : [];

        if (labels.length === 0) {
            this.showEmpty();
            return;
        }
        this.hideEmpty();

        // Create gradient fill
        const gradient = ctx.createLinearGradient(0, 0, 0, 320);
        gradient.addColorStop(0, 'rgba(79, 70, 229, 0.35)');
        gradient.addColorStop(1, 'rgba(79, 70, 229, 0.01)');

        const chartConfig = {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Monthly Sales ($)',
                    data: values,
                    borderColor: '#4F46E5',
                    borderWidth: 3,
                    backgroundColor: gradient,
                    fill: true,
                    tension: 0.35,
                    pointBackgroundColor: '#FFFFFF',
                    pointBorderColor: '#4F46E5',
                    pointBorderWidth: 2.5,
                    pointRadius: 5,
                    pointHoverRadius: 7,
                    pointHoverBackgroundColor: '#4F46E5',
                    pointHoverBorderColor: '#FFFFFF',
                    pointHoverBorderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                animation: {
                    duration: 750,
                    easing: 'easeOutQuart'
                },
                layout: {
                    padding: { top: 10, right: 15, bottom: 5, left: 10 }
                },
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        backgroundColor: '#1E293B',
                        titleColor: '#F8FAFC',
                        bodyColor: '#F8FAFC',
                        padding: 12,
                        cornerRadius: 8,
                        titleFont: { family: 'Inter', size: 13, weight: '600' },
                        bodyFont: { family: 'Inter', size: 12 },
                        callbacks: {
                            label: (context) => {
                                const val = Number(context.parsed.y || 0).toLocaleString('en-US', {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2
                                });
                                return ` Sales: $${val}`;
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        grid: {
                            display: false
                        },
                        ticks: {
                            font: { family: 'Inter', size: 12, weight: '500' },
                            color: '#64748B'
                        }
                    },
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: 'rgba(226, 232, 240, 0.7)',
                            drawBorder: false
                        },
                        ticks: {
                            font: { family: 'Inter', size: 11 },
                            color: '#64748B',
                            callback: (value) => `$${Number(value).toLocaleString()}`
                        }
                    }
                }
            }
        };

        this.applyOrUpdateChart(chartConfig);
    }

    /**
     * Render Doughnut/Pie Chart (Category Distribution)
     */
    renderPieChart(data) {
        if (!this.canvas) return;

        const labels = data && data.labels ? data.labels : [];
        const values = data && data.values ? data.values : [];
        const percentages = data && data.percentages ? data.percentages : [];

        if (labels.length === 0) {
            this.showEmpty();
            return;
        }
        this.hideEmpty();

        const bgColors = labels.map((_, i) => this.colors[i % this.colors.length].bg);
        const borderColors = labels.map((_, i) => this.colors[i % this.colors.length].border);

        const chartConfig = {
            type: 'doughnut',
            data: {
                labels: labels,
                datasets: [{
                    data: values,
                    backgroundColor: bgColors,
                    borderColor: borderColors,
                    borderWidth: 2,
                    hoverOffset: 8
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                cutout: '60%',
                animation: {
                    duration: 750,
                    animateRotate: true,
                    animateScale: true
                },
                layout: {
                    padding: 15
                },
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            font: { family: 'Inter', size: 12, weight: '500' },
                            color: '#334155',
                            padding: 16,
                            usePointStyle: true,
                            pointStyle: 'circle'
                        }
                    },
                    tooltip: {
                        backgroundColor: '#1E293B',
                        titleColor: '#F8FAFC',
                        bodyColor: '#F8FAFC',
                        padding: 12,
                        cornerRadius: 8,
                        titleFont: { family: 'Inter', size: 13, weight: '600' },
                        bodyFont: { family: 'Inter', size: 12 },
                        callbacks: {
                            label: (context) => {
                                const index = context.dataIndex;
                                const val = Number(values[index] || 0).toLocaleString('en-US', {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2
                                });
                                const pct = percentages[index] !== undefined ? percentages[index] : '';
                                return ` $${val} (${pct}%)`;
                            }
                        }
                    }
                }
            }
        };

        this.applyOrUpdateChart(chartConfig);
    }

    /**
     * Efficiently update existing chart instance or create new
     */
    applyOrUpdateChart(config) {
        if (!this.canvas) return;

        // If chart type changed or no chart exists, recreate it
        if (!this.chartInstance || this.chartInstance.config.type !== config.type) {
            if (this.chartInstance) {
                this.chartInstance.destroy();
            }
            this.chartInstance = new Chart(this.canvas, config);
        } else {
            // Smoothly mutate labels and datasets for animated transitions
            this.chartInstance.data.labels = config.data.labels;
            this.chartInstance.data.datasets = config.data.datasets;
            if (config.options) {
                this.chartInstance.options = config.options;
            }
            this.chartInstance.update('active');
        }
    }

    /**
     * Destroy chart instance
     */
    destroy() {
        if (this.chartInstance) {
            this.chartInstance.destroy();
            this.chartInstance = null;
        }
    }
}

// Export singleton to window
window.ChartManager = new ChartManager();
