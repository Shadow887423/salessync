/**
 * SalesSync — Main Dashboard Orchestrator
 * Coordinates ChartManager, FormHandler, Table filtering, Delete Modal, and UI animations.
 */

class DashboardApp {
    constructor() {
        this.pendingDeleteId = null;

        // Elements
        this.recordsTable = document.getElementById('recordsTable');
        this.recordsTableBody = document.getElementById('recordsTableBody');
        this.recordCountBadge = document.getElementById('recordCountBadge');
        this.tableTotalEl = document.getElementById('tableTotal');
        this.toastContainer = document.getElementById('toastContainer');

        // Delete Modal
        this.deleteModal = document.getElementById('deleteModal');
        this.modalCategory = document.getElementById('modalCategory');
        this.modalClose = document.getElementById('modalClose');
        this.modalCancelBtn = document.getElementById('modalCancelBtn');
        this.modalConfirmBtn = document.getElementById('modalConfirmBtn');

        // Filters
        this.searchInput = document.getElementById('searchInput');
        this.filterCategory = document.getElementById('filterCategory');
        this.filterDateFrom = document.getElementById('filterDateFrom');
        this.filterDateTo = document.getElementById('filterDateTo');
    }

    /**
     * Initialize dashboard
     */
    init() {
        // Initialize child modules
        if (window.ChartManager && typeof window.ChartManager.init === 'function') {
            window.ChartManager.init();
        }
        if (window.FormHandler && typeof window.FormHandler.init === 'function') {
            window.FormHandler.init();
        }

        this.bindChartTabs();
        this.bindTableEvents();
        this.bindFilters();
        this.bindModalEvents();
    }

    /**
     * Bind Chart Tab Buttons (Bar, Line, Pie)
     */
    bindChartTabs() {
        const tabsContainer = document.getElementById('chartTabs');
        if (!tabsContainer) return;

        tabsContainer.addEventListener('click', (e) => {
            const button = e.target.closest('.chart-tab');
            if (!button) return;

            const chartType = button.getAttribute('data-type');
            if (chartType && window.ChartManager) {
                window.ChartManager.switchType(chartType);
            }
        });
    }

    /**
     * Event delegation for Table Edit and Delete actions
     */
    bindTableEvents() {
        if (!this.recordsTable) return;

        this.recordsTable.addEventListener('click', (e) => {
            // Edit Button clicked
            const editBtn = e.target.closest('.btn-edit');
            if (editBtn) {
                const tr = editBtn.closest('tr');
                if (!tr) return;

                const record = {
                    id: tr.getAttribute('data-id'),
                    category: tr.getAttribute('data-category'),
                    value: tr.getAttribute('data-value'),
                    record_date: tr.getAttribute('data-date'),
                    description: tr.getAttribute('data-description') || ''
                };

                if (window.FormHandler) {
                    window.FormHandler.populateForm(record);
                }
                return;
            }

            // Delete Button clicked
            const deleteBtn = e.target.closest('.btn-delete');
            if (deleteBtn) {
                const id = deleteBtn.getAttribute('data-id');
                const category = deleteBtn.getAttribute('data-category') || 'this record';
                this.openDeleteModal(id, category);
            }
        });
    }

    /**
     * Bind Table Search and Filter inputs
     */
    bindFilters() {
        const applyFilter = () => this.filterTable();

        if (this.searchInput) {
            this.searchInput.addEventListener('input', applyFilter);
        }
        if (this.filterCategory) {
            this.filterCategory.addEventListener('change', applyFilter);
        }
        if (this.filterDateFrom) {
            this.filterDateFrom.addEventListener('change', applyFilter);
        }
        if (this.filterDateTo) {
            this.filterDateTo.addEventListener('change', applyFilter);
        }
    }

    /**
     * Filter table rows based on search, category, and date range
     */
    filterTable() {
        if (!this.recordsTableBody) return;

        const query = this.searchInput ? this.searchInput.value.toLowerCase().trim() : '';
        const cat = this.filterCategory ? this.filterCategory.value.trim() : '';
        const fromDate = this.filterDateFrom && this.filterDateFrom.value ? new Date(this.filterDateFrom.value) : null;
        const toDate = this.filterDateTo && this.filterDateTo.value ? new Date(this.filterDateTo.value) : null;

        const rows = this.recordsTableBody.querySelectorAll('tr[data-id]');
        let visibleCount = 0;
        let visibleSum = 0;

        rows.forEach(row => {
            const rowCat = (row.getAttribute('data-category') || '').toLowerCase();
            const rowDesc = (row.getAttribute('data-description') || '').toLowerCase();
            const rowAmount = parseFloat(row.getAttribute('data-value')) || 0;
            const rowDateStr = row.getAttribute('data-date') || '';
            const rowDate = rowDateStr ? new Date(rowDateStr) : null;

            let matchesSearch = true;
            if (query) {
                matchesSearch = rowCat.includes(query) || rowDesc.includes(query);
            }

            let matchesCat = true;
            if (cat) {
                matchesCat = rowCat === cat.toLowerCase();
            }

            let matchesDate = true;
            if (rowDate) {
                if (fromDate && rowDate < fromDate) matchesDate = false;
                if (toDate && rowDate > toDate) matchesDate = false;
            }

            if (matchesSearch && matchesCat && matchesDate) {
                row.style.display = '';
                visibleCount++;
                visibleSum += rowAmount;
            } else {
                row.style.display = 'none';
            }
        });

        // Update footer total for visible items
        if (this.tableTotalEl) {
            this.tableTotalEl.innerHTML = `<strong>$${visibleSum.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong>`;
        }

        // Show/hide empty row if filtered to zero
        let emptyRow = document.getElementById('emptyRow');
        if (visibleCount === 0) {
            if (!emptyRow) {
                emptyRow = document.createElement('tr');
                emptyRow.id = 'emptyRow';
                emptyRow.innerHTML = `
                    <td colspan="6" class="empty-table" style="text-align: center; padding: 2.5rem 1rem; color: #94A3B8;">
                        <i class="fas fa-search" style="font-size: 2rem; margin-bottom: 0.5rem; display: block;"></i>
                        <p>No records match your filter criteria.</p>
                    </td>
                `;
                this.recordsTableBody.appendChild(emptyRow);
            } else {
                emptyRow.style.display = '';
            }
        } else if (emptyRow) {
            emptyRow.style.display = 'none';
        }
    }

    /**
     * Modal management for Delete Confirmation
     */
    bindModalEvents() {
        if (this.modalClose) {
            this.modalClose.addEventListener('click', () => this.closeDeleteModal());
        }
        if (this.modalCancelBtn) {
            this.modalCancelBtn.addEventListener('click', () => this.closeDeleteModal());
        }
        if (this.modalConfirmBtn) {
            this.modalConfirmBtn.addEventListener('click', () => this.executeDelete());
        }
        if (this.deleteModal) {
            this.deleteModal.addEventListener('click', (e) => {
                if (e.target === this.deleteModal) {
                    this.closeDeleteModal();
                }
            });
        }
    }

    openDeleteModal(id, category) {
        this.pendingDeleteId = id;
        if (this.modalCategory) {
            this.modalCategory.textContent = category;
        }
        if (this.deleteModal) {
            this.deleteModal.style.display = 'flex';
            this.deleteModal.classList.add('show');
        }
    }

    closeDeleteModal() {
        this.pendingDeleteId = null;
        if (this.deleteModal) {
            this.deleteModal.style.display = 'none';
            this.deleteModal.classList.remove('show');
        }
    }

    /**
     * Execute record deletion via AJAX (DELETE /api/records/{id})
     */
    async executeDelete() {
        if (!this.pendingDeleteId) return;

        const id = this.pendingDeleteId;
        const confirmBtn = this.modalConfirmBtn;
        if (confirmBtn) {
            confirmBtn.disabled = true;
            confirmBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Deleting...';
        }

        try {
            const meta = document.querySelector('meta[name="csrf-token"]');
            const csrfToken = meta ? meta.getAttribute('content') : '';

            const response = await fetch(`/api/records/${id}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': csrfToken
                }
            });

            const result = await response.json();

            if (response.ok && result.success) {
                this.showToast(result.message || 'Record deleted successfully.', 'success');
                this.removeRecordFromTable(id);

                // If currently editing this record, reset the form
                if (window.FormHandler && window.FormHandler.editingRecordId == id) {
                    window.FormHandler.resetForm();
                }

                // Live Sync: Chart & Stats
                if (result.chartData) {
                    window.ChartManager.updateChart(result.chartData);
                }
                if (result.stats) {
                    this.updateStatsCards(result.stats);
                }
            } else {
                this.showToast(result.message || 'Failed to delete record.', 'error');
            }
        } catch (error) {
            console.warn('Network error or API offline; executing deletion via local state fallback:', error);
            this.deleteLocalRecord(id);
            if (window.FormHandler && window.FormHandler.editingRecordId == id) {
                window.FormHandler.resetForm();
            }
        } finally {
            if (confirmBtn) {
                confirmBtn.disabled = false;
                confirmBtn.innerHTML = '<i class="fas fa-trash"></i> Delete';
            }
            this.closeDeleteModal();
        }
    }

    /**
     * Append a newly created record row to the table (with animation)
     */
    appendRecordToTable(record) {
        if (!this.recordsTableBody) return;

        // Remove empty state row if present
        const emptyRow = document.getElementById('emptyRow');
        if (emptyRow) {
            emptyRow.remove();
        }

        const tr = document.createElement('tr');
        tr.setAttribute('data-id', record.id);
        tr.setAttribute('data-category', record.category);
        tr.setAttribute('data-value', record.value);
        tr.setAttribute('data-date', record.record_date);
        tr.setAttribute('data-description', record.description || '');

        // Formatting date
        let dateFormatted = record.record_date;
        try {
            const d = new Date(record.record_date);
            dateFormatted = d.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
        } catch (e) {}

        const slugCategory = record.category.toLowerCase().replace(/[^a-z0-9]+/g, '-');
        const descShort = record.description && record.description.length > 50
            ? record.description.substring(0, 50) + '...'
            : (record.description || '');

        tr.innerHTML = `
            <td>1</td>
            <td>
                <span class="category-badge category-badge--${slugCategory}">
                    ${this.escapeHtml(record.category)}
                </span>
            </td>
            <td class="amount-cell">$${parseFloat(record.value).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
            <td>${dateFormatted}</td>
            <td class="description-cell">${this.escapeHtml(descShort)}</td>
            <td class="actions-cell">
                <button class="btn btn-sm btn-primary btn-edit" data-id="${this.escapeHtml(record.id)}" title="Edit">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-sm btn-danger btn-delete" data-id="${this.escapeHtml(record.id)}" data-category="${this.escapeHtml(record.category)}" title="Delete">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;

        // Prepend to top of table
        this.recordsTableBody.insertBefore(tr, this.recordsTableBody.firstChild);

        // Flash highlight animation
        tr.style.backgroundColor = '#D1FAE5';
        setTimeout(() => {
            tr.style.transition = 'background-color 1s ease';
            tr.style.backgroundColor = '';
        }, 300);

        this.renumberTableRows();
        this.updateTableFooters();
    }

    /**
     * Update an existing record in the table
     */
    updateRecordInTable(record) {
        if (!this.recordsTableBody) return;

        const tr = this.recordsTableBody.querySelector(`tr[data-id="${record.id}"]`);
        if (!tr) return;

        tr.setAttribute('data-category', record.category);
        tr.setAttribute('data-value', record.value);
        tr.setAttribute('data-date', record.record_date);
        tr.setAttribute('data-description', record.description || '');

        let dateFormatted = record.record_date;
        try {
            const d = new Date(record.record_date);
            dateFormatted = d.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
        } catch (e) {}

        const slugCategory = record.category.toLowerCase().replace(/[^a-z0-9]+/g, '-');
        const descShort = record.description && record.description.length > 50
            ? record.description.substring(0, 50) + '...'
            : (record.description || '');

        // Preserve index number
        const currentIndex = tr.querySelector('td:first-child') ? tr.querySelector('td:first-child').textContent : '1';

        tr.innerHTML = `
            <td>${currentIndex}</td>
            <td>
                <span class="category-badge category-badge--${slugCategory}">
                    ${this.escapeHtml(record.category)}
                </span>
            </td>
            <td class="amount-cell">$${parseFloat(record.value).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
            <td>${dateFormatted}</td>
            <td class="description-cell">${this.escapeHtml(descShort)}</td>
            <td class="actions-cell">
                <button class="btn btn-sm btn-primary btn-edit" data-id="${this.escapeHtml(record.id)}" title="Edit">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-sm btn-danger btn-delete" data-id="${this.escapeHtml(record.id)}" data-category="${this.escapeHtml(record.category)}" title="Delete">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;

        // Update flash
        tr.style.backgroundColor = '#FEF3C7';
        setTimeout(() => {
            tr.style.transition = 'background-color 1s ease';
            tr.style.backgroundColor = '';
        }, 400);

        this.updateTableFooters();
    }

    /**
     * Remove a record from the table
     */
    removeRecordFromTable(id) {
        if (!this.recordsTableBody) return;

        const tr = this.recordsTableBody.querySelector(`tr[data-id="${id}"]`);
        if (!tr) return;

        tr.style.transition = 'all 0.3s ease';
        tr.style.opacity = '0';
        tr.style.transform = 'translateX(20px)';

        setTimeout(() => {
            tr.remove();
            this.renumberTableRows();
            this.updateTableFooters();

            // If empty, show empty state row
            const remainingRows = this.recordsTableBody.querySelectorAll('tr[data-id]');
            if (remainingRows.length === 0) {
                const emptyRow = document.createElement('tr');
                emptyRow.id = 'emptyRow';
                emptyRow.innerHTML = `
                    <td colspan="6" class="empty-table" style="text-align: center; padding: 3rem 1rem; color: #94A3B8;">
                        <i class="fas fa-inbox" style="font-size: 2rem; margin-bottom: 0.5rem; display: block;"></i>
                        <p>No records found. Start adding sales data!</p>
                    </td>
                `;
                this.recordsTableBody.appendChild(emptyRow);
            }
        }, 300);
    }

    /**
     * Re-index table rows (1, 2, 3...)
     */
    renumberTableRows() {
        if (!this.recordsTableBody) return;
        const rows = this.recordsTableBody.querySelectorAll('tr[data-id]');
        rows.forEach((row, i) => {
            const indexCell = row.querySelector('td:first-child');
            if (indexCell) {
                indexCell.textContent = i + 1;
            }
        });

        if (this.recordCountBadge) {
            this.recordCountBadge.textContent = rows.length;
        }
    }

    /**
     * Recalculate totals in table footer
     */
    updateTableFooters() {
        if (!this.recordsTableBody || !this.tableTotalEl) return;

        const rows = this.recordsTableBody.querySelectorAll('tr[data-id]');
        let total = 0;
        rows.forEach(row => {
            if (row.style.display !== 'none') {
                total += parseFloat(row.getAttribute('data-value')) || 0;
            }
        });

        this.tableTotalEl.innerHTML = `<strong>$${total.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong>`;
    }

    /**
     * Update summary metric cards with smooth number counting animation
     */
    updateStatsCards(stats) {
        if (!stats) return;

        // Total Records
        const elRecords = document.getElementById('statTotalRecords');
        if (elRecords) {
            const current = parseInt(elRecords.getAttribute('data-value')) || 0;
            const target = stats.totalRecords !== undefined ? stats.totalRecords : 0;
            elRecords.setAttribute('data-value', target);
            this.animateValue(elRecords, current, target, 600, false);
        }

        // Total Revenue
        const elTotal = document.getElementById('statTotalValue');
        if (elTotal) {
            const current = parseFloat(elTotal.getAttribute('data-value')) || 0;
            const target = stats.totalValue !== undefined ? parseFloat(stats.totalValue) : 0;
            elTotal.setAttribute('data-value', target);
            this.animateValue(elTotal, current, target, 600, true);
        }

        // Average Sale
        const elAvg = document.getElementById('statAverageValue');
        if (elAvg) {
            const current = parseFloat(elAvg.getAttribute('data-value')) || 0;
            const target = stats.averageValue !== undefined ? parseFloat(stats.averageValue) : 0;
            elAvg.setAttribute('data-value', target);
            this.animateValue(elAvg, current, target, 600, true);
        }

        // Top Category
        const elTop = document.getElementById('statTopCategory');
        if (elTop) {
            if (stats.highestRecord) {
                const val = parseFloat(stats.highestRecord.value).toLocaleString('en-US', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                });
                elTop.innerHTML = `
                    ${this.escapeHtml(stats.highestRecord.category)}
                    <span class="stat-card__sub">$${val}</span>
                `;
            } else {
                elTop.innerHTML = 'N/A';
            }
        }
    }

    /**
     * Counting animation helper for numbers/currencies
     */
    animateValue(element, start, end, duration, isCurrency) {
        if (start === end) {
            element.textContent = isCurrency
                ? `$${end.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                : end.toLocaleString();
            return;
        }

        const startTime = performance.now();

        const step = (now) => {
            const progress = Math.min((now - startTime) / duration, 1);
            const easeOutQuart = 1 - Math.pow(1 - progress, 4);
            const current = start + (end - start) * easeOutQuart;

            if (isCurrency) {
                element.textContent = `$${current.toLocaleString('en-US', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                })}`;
            } else {
                element.textContent = Math.round(current).toLocaleString();
            }

            if (progress < 1) {
                requestAnimationFrame(step);
            } else {
                if (isCurrency) {
                    element.textContent = `$${end.toLocaleString('en-US', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2
                    })}`;
                } else {
                    element.textContent = end.toLocaleString();
                }
            }
        };

        requestAnimationFrame(step);
    }

    /**
     * Show a toast notification
     * @param {string} message
     * @param {string} type ('success', 'error', 'info')
     * @param {number} duration ms
     */
    showToast(message, type = 'info', duration = 4000) {
        if (!this.toastContainer) {
            this.toastContainer = document.getElementById('toastContainer');
        }
        if (!this.toastContainer) return;

        const toast = document.createElement('div');
        toast.className = `toast toast--${type}`;

        let iconClass = 'fa-info-circle';
        if (type === 'success') iconClass = 'fa-check-circle';
        if (type === 'error') iconClass = 'fa-exclamation-circle';

        toast.innerHTML = `
            <i class="fas ${iconClass}"></i>
            <span>${this.escapeHtml(message)}</span>
            <button class="toast-close" title="Close">&times;</button>
        `;

        const closeBtn = toast.querySelector('.toast-close');
        const removeToast = () => {
            toast.classList.add('removing');
            setTimeout(() => toast.remove(), 300);
        };

        if (closeBtn) {
            closeBtn.addEventListener('click', removeToast);
        }

        this.toastContainer.appendChild(toast);

        // Auto dismiss
        setTimeout(removeToast, duration);
    }

    /**
     * Get records array currently in table
     */
    getRecordsFromTable() {
        if (!this.recordsTableBody) return [];
        const rows = this.recordsTableBody.querySelectorAll('tr[data-id]');
        const records = [];
        rows.forEach(tr => {
            records.push({
                id: tr.getAttribute('data-id'),
                category: tr.getAttribute('data-category'),
                value: parseFloat(tr.getAttribute('data-value')) || 0,
                record_date: tr.getAttribute('data-date'),
                description: tr.getAttribute('data-description') || ''
            });
        });
        return records;
    }

    /**
     * Compute chartData and summary statistics from an array of records
     */
    calculateMetrics(records) {
        const catMap = {};
        const monthMap = {};
        let totalVal = 0;
        let highest = null;

        records.forEach(r => {
            const val = parseFloat(r.value) || 0;
            totalVal += val;

            const cat = r.category || 'Other';
            catMap[cat] = (catMap[cat] || 0) + val;

            let mKey = 'Recent';
            if (r.record_date) {
                try {
                    const parts = r.record_date.split('-');
                    if (parts.length >= 2) {
                        const d = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, 1);
                        mKey = d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
                    }
                } catch(e) {}
            }
            monthMap[mKey] = (monthMap[mKey] || 0) + val;

            if (!highest || val > parseFloat(highest.value)) {
                highest = r;
            }
        });

        const barLabels = Object.keys(catMap);
        const barValues = barLabels.map(k => Math.round(catMap[k] * 100) / 100);
        const piePercentages = barValues.map(v => totalVal > 0 ? Math.round((v / totalVal) * 1000) / 10 : 0);

        const lineLabels = Object.keys(monthMap);
        const lineValues = lineLabels.map(k => Math.round(monthMap[k] * 100) / 100);

        const stats = {
            totalRecords: records.length,
            totalValue: Math.round(totalVal * 100) / 100,
            averageValue: records.length > 0 ? Math.round((totalVal / records.length) * 100) / 100 : 0,
            highestRecord: highest ? {
                id: highest.id,
                value: parseFloat(highest.value),
                category: highest.category,
                formatted_value: `$${parseFloat(highest.value).toFixed(2)}`
            } : null
        };

        return {
            barData: { labels: barLabels, values: barValues },
            lineData: { labels: lineLabels, values: lineValues },
            pieData: { labels: barLabels, values: barValues, percentages: piePercentages },
            stats: stats
        };
    }

    /**
     * LocalStorage fallback operations
     */
    addLocalRecord(data) {
        const newRecord = {
            id: Date.now().toString(),
            category: data.category,
            value: data.value,
            record_date: data.record_date,
            description: data.description
        };

        this.appendRecordToTable(newRecord);
        const allRecords = this.getRecordsFromTable();
        const metrics = this.calculateMetrics(allRecords);

        try {
            localStorage.setItem('salessync_records', JSON.stringify(allRecords));
        } catch(e) {}

        if (window.ChartManager) {
            window.ChartManager.updateChart(metrics);
        }
        this.updateStatsCards(metrics.stats);
        return newRecord;
    }

    updateLocalRecord(id, data) {
        const updatedRecord = {
            id: id,
            category: data.category,
            value: data.value,
            record_date: data.record_date,
            description: data.description
        };

        this.updateRecordInTable(updatedRecord);
        const allRecords = this.getRecordsFromTable();
        const metrics = this.calculateMetrics(allRecords);

        try {
            localStorage.setItem('salessync_records', JSON.stringify(allRecords));
        } catch(e) {}

        if (window.ChartManager) {
            window.ChartManager.updateChart(metrics);
        }
        this.updateStatsCards(metrics.stats);
        return updatedRecord;
    }

    deleteLocalRecord(id) {
        this.removeRecordFromTable(id);

        setTimeout(() => {
            const allRecords = this.getRecordsFromTable();
            const metrics = this.calculateMetrics(allRecords);

            try {
                localStorage.setItem('salessync_records', JSON.stringify(allRecords));
            } catch(e) {}

            if (window.ChartManager) {
                window.ChartManager.updateChart(metrics);
            }
            this.updateStatsCards(metrics.stats);
        }, 320);

        this.showToast('Record deleted successfully.', 'success');
    }

    /**
     * Helper to escape HTML characters (including quotes) to prevent XSS and attribute breakout
     */
    escapeHtml(str) {
        if (str === null || str === undefined) return '';
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }
}

// Instantiate and expose globally
window.Dashboard = new DashboardApp();

document.addEventListener('DOMContentLoaded', () => {
    window.Dashboard.init();
});
