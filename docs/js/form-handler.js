/**
 * SalesSync — Form Handler
 * Handles form validation, Add/Edit mode switching, and AJAX CRUD operations.
 */

class FormHandler {
    constructor() {
        this.form = document.getElementById('recordForm');
        this.recordIdInput = document.getElementById('recordId');
        this.categorySelect = document.getElementById('category');
        this.customCategoryGroup = document.getElementById('customCategoryGroup');
        this.customCategoryInput = document.getElementById('customCategory');
        this.amountInput = document.getElementById('amount');
        this.dateInput = document.getElementById('recordDate');
        this.descriptionInput = document.getElementById('description');
        this.charCounter = document.getElementById('charCounter');

        // Buttons
        this.btnAdd = document.getElementById('btnAdd');
        this.btnUpdate = document.getElementById('btnUpdate');
        this.btnCancel = document.getElementById('btnCancel');
        this.btnReset = document.getElementById('btnReset');

        // Active state
        this.isEditing = false;
        this.editingRecordId = null;
    }

    /**
     * Initialize form listeners
     */
    init() {
        if (!this.form) return;

        // Default date to today
        if (this.dateInput && !this.dateInput.value) {
            const today = new Date().toISOString().split('T')[0];
            this.dateInput.value = today;
            this.dateInput.max = today;
        }

        // Category dropdown change (handle "Other")
        if (this.categorySelect) {
            this.categorySelect.addEventListener('change', () => {
                this.handleCategoryChange();
                this.clearFieldError('category');
            });
        }

        // Description char counter
        if (this.descriptionInput && this.charCounter) {
            this.descriptionInput.addEventListener('input', () => {
                const count = this.descriptionInput.value.length;
                this.charCounter.textContent = count;
                if (count > 1000) {
                    this.charCounter.style.color = '#EF4444';
                } else {
                    this.charCounter.style.color = '';
                }
            });
        }

        // Live validation clearing on input
        if (this.amountInput) {
            this.amountInput.addEventListener('input', () => this.clearFieldError('amount'));
        }
        if (this.dateInput) {
            this.dateInput.addEventListener('input', () => this.clearFieldError('date'));
        }
        if (this.customCategoryInput) {
            this.customCategoryInput.addEventListener('input', () => this.clearFieldError('customCategory'));
        }

        // Button clicks
        if (this.btnAdd) {
            this.btnAdd.addEventListener('click', (e) => {
                e.preventDefault();
                this.handleAdd();
            });
        }

        if (this.btnUpdate) {
            this.btnUpdate.addEventListener('click', (e) => {
                e.preventDefault();
                this.handleUpdate();
            });
        }

        if (this.btnCancel) {
            this.btnCancel.addEventListener('click', (e) => {
                e.preventDefault();
                this.resetForm();
            });
        }

        if (this.btnReset) {
            this.btnReset.addEventListener('click', (e) => {
                e.preventDefault();
                this.resetForm();
            });
        }
    }

    /**
     * Show or hide custom category input if "Other" is selected
     */
    handleCategoryChange() {
        if (!this.categorySelect || !this.customCategoryGroup) return;

        if (this.categorySelect.value === 'Other') {
            this.customCategoryGroup.style.display = 'block';
            this.customCategoryGroup.classList.add('show');
            if (this.customCategoryInput) {
                this.customCategoryInput.focus();
            }
        } else {
            this.customCategoryGroup.style.display = 'none';
            this.customCategoryGroup.classList.remove('show');
            if (this.customCategoryInput) {
                this.customCategoryInput.value = '';
            }
        }
    }

    /**
     * Extract sanitized form data
     */
    getFormData() {
        let category = this.categorySelect ? this.categorySelect.value.trim() : '';
        if (category === 'Other') {
            const custom = this.customCategoryInput ? this.customCategoryInput.value.trim() : '';
            category = custom || 'Other';
        }

        const value = this.amountInput ? parseFloat(this.amountInput.value) : 0;
        const recordDate = this.dateInput ? this.dateInput.value : '';
        const description = this.descriptionInput ? this.descriptionInput.value.trim() : '';

        return {
            category: category,
            value: isNaN(value) ? null : value,
            record_date: recordDate,
            description: description || null
        };
    }

    /**
     * Client-side validation
     * @returns {boolean}
     */
    validateForm() {
        this.clearErrors();
        let isValid = true;

        // Category
        if (!this.categorySelect || !this.categorySelect.value) {
            this.showFieldError('category', 'Please select a sales category.');
            isValid = false;
        } else if (this.categorySelect.value === 'Other') {
            const customVal = this.customCategoryInput ? this.customCategoryInput.value.trim() : '';
            if (!customVal) {
                this.showFieldError('customCategory', 'Please specify the custom category name.');
                isValid = false;
            }
        }

        // Amount
        const amountVal = this.amountInput ? parseFloat(this.amountInput.value) : NaN;
        if (isNaN(amountVal) || amountVal <= 0) {
            this.showFieldError('amount', 'Please enter a valid positive amount greater than $0.00.');
            isValid = false;
        } else if (amountVal > 9999999.99) {
            this.showFieldError('amount', 'Amount cannot exceed $9,999,999.99.');
            isValid = false;
        }

        // Date
        if (!this.dateInput || !this.dateInput.value) {
            this.showFieldError('date', 'Please select a valid transaction date.');
            isValid = false;
        } else {
            const selectedDate = new Date(this.dateInput.value);
            const today = new Date();
            // Zero out time
            today.setHours(23, 59, 59, 999);
            if (selectedDate > today) {
                this.showFieldError('date', 'Transaction date cannot be in the future.');
                isValid = false;
            }
        }

        // Description
        if (this.descriptionInput && this.descriptionInput.value.length > 1000) {
            this.showFieldError('description', 'Description cannot exceed 1000 characters.');
            isValid = false;
        }

        return isValid;
    }

    /**
     * Display error on a specific field
     */
    showFieldError(field, message) {
        let inputEl = null;
        let errorEl = null;

        switch (field) {
            case 'category':
                inputEl = this.categorySelect;
                errorEl = document.getElementById('categoryError');
                break;
            case 'customCategory':
                inputEl = this.customCategoryInput;
                errorEl = document.getElementById('customCategoryError');
                break;
            case 'amount':
            case 'value':
                inputEl = this.amountInput;
                errorEl = document.getElementById('amountError');
                break;
            case 'date':
            case 'record_date':
                inputEl = this.dateInput;
                errorEl = document.getElementById('dateError');
                break;
            case 'description':
                inputEl = this.descriptionInput;
                errorEl = document.getElementById('descriptionError');
                break;
        }

        if (inputEl) {
            inputEl.classList.add('is-invalid');
            inputEl.classList.remove('is-valid');
        }
        if (errorEl) {
            errorEl.textContent = message;
            errorEl.style.display = 'block';
            errorEl.classList.add('show');
        }
    }

    /**
     * Clear error on a single field
     */
    clearFieldError(field) {
        let inputEl = null;
        let errorEl = null;

        switch (field) {
            case 'category':
                inputEl = this.categorySelect;
                errorEl = document.getElementById('categoryError');
                break;
            case 'customCategory':
                inputEl = this.customCategoryInput;
                errorEl = document.getElementById('customCategoryError');
                break;
            case 'amount':
            case 'value':
                inputEl = this.amountInput;
                errorEl = document.getElementById('amountError');
                break;
            case 'date':
            case 'record_date':
                inputEl = this.dateInput;
                errorEl = document.getElementById('dateError');
                break;
            case 'description':
                inputEl = this.descriptionInput;
                errorEl = document.getElementById('descriptionError');
                break;
        }

        if (inputEl) {
            inputEl.classList.remove('is-invalid');
        }
        if (errorEl) {
            errorEl.textContent = '';
            errorEl.style.display = 'none';
            errorEl.classList.remove('show');
        }
    }

    /**
     * Clear all validation errors
     */
    clearErrors() {
        const errorSpans = document.querySelectorAll('.form-error');
        errorSpans.forEach(span => {
            span.textContent = '';
            span.style.display = 'none';
            span.classList.remove('show');
        });

        const inputs = this.form ? this.form.querySelectorAll('.form-control') : [];
        inputs.forEach(input => {
            input.classList.remove('is-invalid');
        });
    }

    /**
     * Show server validation errors
     */
    showErrors(errors) {
        this.clearErrors();
        if (!errors || typeof errors !== 'object') return;

        for (const [field, messages] of Object.entries(errors)) {
            const message = Array.isArray(messages) ? messages[0] : messages;
            this.showFieldError(field, message);
        }
    }

    /**
     * Handle Add Record (POST /api/records)
     */
    async handleAdd() {
        if (!this.validateForm()) return;

        const data = this.getFormData();
        this.setButtonLoading(this.btnAdd, true, 'Adding...');

        try {
            const csrfToken = this.getCsrfToken();
            const response = await fetch('/api/records', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': csrfToken
                },
                body: JSON.stringify(data)
            });

            const result = await response.json();

            if (response.ok && result.success) {
                window.Dashboard.showToast(result.message || 'Record added successfully!', 'success');
                this.resetForm();

                // Live Sync: Chart, Table, and Stats
                if (result.chartData) {
                    window.ChartManager.updateChart(result.chartData);
                }
                if (result.stats) {
                    window.Dashboard.updateStatsCards(result.stats);
                }
                if (result.record) {
                    window.Dashboard.appendRecordToTable(result.record);
                }
            } else if (response.status === 422 && result.errors) {
                this.showErrors(result.errors);
                window.Dashboard.showToast('Please correct the validation errors in the form.', 'error');
            } else {
                // If API returned non-success, fallback to local handling
                window.Dashboard.addLocalRecord(data);
                window.Dashboard.showToast('Record added successfully (Local Sync)!', 'success');
                this.resetForm();
            }
        } catch (error) {
            console.warn('Network or API offline; saving to local dashboard state:', error);
            window.Dashboard.addLocalRecord(data);
            window.Dashboard.showToast('Record added successfully (Local Mode)!', 'success');
            this.resetForm();
        } finally {
            this.setButtonLoading(this.btnAdd, false, '<i class="fas fa-plus"></i> Add Record');
        }
    }

    /**
     * Handle Update Record (PUT /api/records/{id})
     */
    async handleUpdate() {
        if (!this.editingRecordId) return;
        if (!this.validateForm()) return;

        const data = this.getFormData();
        this.setButtonLoading(this.btnUpdate, true, 'Updating...');

        try {
            const csrfToken = this.getCsrfToken();
            const response = await fetch(`/api/records/${this.editingRecordId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': csrfToken
                },
                body: JSON.stringify(data)
            });

            const result = await response.json();

            if (response.ok && result.success) {
                window.Dashboard.showToast(result.message || 'Record updated successfully!', 'success');
                this.resetForm();

                // Live Sync
                if (result.chartData) {
                    window.ChartManager.updateChart(result.chartData);
                }
                if (result.stats) {
                    window.Dashboard.updateStatsCards(result.stats);
                }
                if (result.record) {
                    window.Dashboard.updateRecordInTable(result.record);
                }
            } else if (response.status === 422 && result.errors) {
                this.showErrors(result.errors);
                window.Dashboard.showToast('Please correct the validation errors in the form.', 'error');
            } else {
                window.Dashboard.updateLocalRecord(this.editingRecordId, data);
                window.Dashboard.showToast('Record updated successfully (Local Sync)!', 'success');
                this.resetForm();
            }
        } catch (error) {
            console.warn('Network or API offline; updating in local dashboard state:', error);
            window.Dashboard.updateLocalRecord(this.editingRecordId, data);
            window.Dashboard.showToast('Record updated successfully (Local Mode)!', 'success');
            this.resetForm();
        } finally {
            this.setButtonLoading(this.btnUpdate, false, '<i class="fas fa-save"></i> Update Record');
        }
    }

    /**
     * Populate form fields for editing
     * @param {Object} record
     */
    populateForm(record) {
        if (!record) return;

        this.clearErrors();
        this.isEditing = true;
        this.editingRecordId = record.id;

        if (this.recordIdInput) this.recordIdInput.value = record.id;

        // Set Category
        const standardCategories = ['Electronics', 'Clothing', 'Food & Beverage', 'Home & Garden', 'Sports'];
        if (standardCategories.includes(record.category)) {
            if (this.categorySelect) this.categorySelect.value = record.category;
            if (this.customCategoryGroup) this.customCategoryGroup.style.display = 'none';
            if (this.customCategoryInput) this.customCategoryInput.value = '';
        } else {
            if (this.categorySelect) this.categorySelect.value = 'Other';
            if (this.customCategoryGroup) this.customCategoryGroup.style.display = 'block';
            if (this.customCategoryInput) this.customCategoryInput.value = record.category;
        }

        // Amount
        if (this.amountInput) {
            this.amountInput.value = parseFloat(record.value).toFixed(2);
        }

        // Date
        if (this.dateInput) {
            let formattedDate = record.record_date;
            if (formattedDate && formattedDate.includes('T')) {
                formattedDate = formattedDate.split('T')[0];
            }
            this.dateInput.value = formattedDate;
        }

        // Description
        if (this.descriptionInput) {
            this.descriptionInput.value = record.description || '';
            if (this.charCounter) {
                this.charCounter.textContent = (record.description || '').length;
            }
        }

        this.setEditMode(record);

        // Smooth scroll to form
        if (this.form) {
            this.form.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }

    /**
     * Switch form UI to Edit Mode
     */
    setEditMode(record) {
        if (this.btnAdd) this.btnAdd.style.display = 'none';
        if (this.btnUpdate) this.btnUpdate.style.display = 'inline-flex';
        if (this.btnCancel) this.btnCancel.style.display = 'inline-flex';

        // Highlight table row being edited
        document.querySelectorAll('#recordsTable tbody tr').forEach(row => {
            if (row.getAttribute('data-id') == record.id) {
                row.classList.add('editing');
            } else {
                row.classList.remove('editing');
            }
        });
    }

    /**
     * Switch form UI to Add Mode
     */
    setAddMode() {
        this.isEditing = false;
        this.editingRecordId = null;

        if (this.btnAdd) this.btnAdd.style.display = 'inline-flex';
        if (this.btnUpdate) this.btnUpdate.style.display = 'none';
        if (this.btnCancel) this.btnCancel.style.display = 'none';

        // Remove row highlights
        document.querySelectorAll('#recordsTable tbody tr').forEach(row => {
            row.classList.remove('editing');
        });
    }

    /**
     * Reset form fields to clean state
     */
    resetForm() {
        this.clearErrors();
        if (this.recordIdInput) this.recordIdInput.value = '';
        if (this.categorySelect) this.categorySelect.value = '';
        if (this.customCategoryGroup) this.customCategoryGroup.style.display = 'none';
        if (this.customCategoryInput) this.customCategoryInput.value = '';
        if (this.amountInput) this.amountInput.value = '';

        if (this.dateInput) {
            const today = new Date().toISOString().split('T')[0];
            this.dateInput.value = today;
            this.dateInput.max = today;
        }

        if (this.descriptionInput) {
            this.descriptionInput.value = '';
        }

        if (this.charCounter) {
            this.charCounter.textContent = '0';
            this.charCounter.style.color = '';
        }

        this.setAddMode();
    }

    /**
     * Helper to set loading state on action buttons
     */
    setButtonLoading(button, isLoading, text) {
        if (!button) return;
        button.disabled = isLoading;
        button.innerHTML = text;
    }

    /**
     * Get CSRF token from document meta tag
     */
    getCsrfToken() {
        const meta = document.querySelector('meta[name="csrf-token"]');
        return meta ? meta.getAttribute('content') : '';
    }
}

// Export singleton to window
window.FormHandler = new FormHandler();
