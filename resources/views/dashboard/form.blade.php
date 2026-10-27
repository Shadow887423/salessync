<div class="card">
    <div class="card__header">
        <h2 class="card__title">
            <i class="fas fa-plus-circle"></i> Add / Edit Record
        </h2>
        <p class="card__subtitle">Enter sales data to track performance</p>
    </div>
    <div class="card__body">
        <form id="recordForm" novalidate>
            <input type="hidden" id="recordId" name="record_id" value="">

            <!-- Category -->
            <div class="form-group">
                <label for="category" class="form-label">
                    Category <span class="required">*</span>
                </label>
                <select id="category" name="category" class="form-control" required>
                    <option value="">Select a category...</option>
                    <option value="Electronics">Electronics</option>
                    <option value="Clothing">Clothing</option>
                    <option value="Food & Beverage">Food &amp; Beverage</option>
                    <option value="Home & Garden">Home &amp; Garden</option>
                    <option value="Sports">Sports</option>
                    <option value="Other">Other</option>
                </select>
                <span class="form-error" id="categoryError"></span>
            </div>

            <!-- Custom Category (shown when "Other" is selected) -->
            <div class="form-group" id="customCategoryGroup" style="display: none;">
                <label for="customCategory" class="form-label">
                    Custom Category <span class="required">*</span>
                </label>
                <input type="text" id="customCategory" name="custom_category" class="form-control"
                       placeholder="Enter custom category" maxlength="100">
                <span class="form-error" id="customCategoryError"></span>
            </div>

            <!-- Amount -->
            <div class="form-group">
                <label for="amount" class="form-label">
                    Amount ($) <span class="required">*</span>
                </label>
                <div class="input-icon-wrapper">
                    <span class="input-icon-prefix">$</span>
                    <input type="number" id="amount" name="value" class="form-control form-control--with-prefix"
                           step="0.01" min="0.01" placeholder="0.00" required>
                </div>
                <span class="form-error" id="amountError"></span>
            </div>

            <!-- Date -->
            <div class="form-group">
                <label for="recordDate" class="form-label">
                    Date <span class="required">*</span>
                </label>
                <input type="date" id="recordDate" name="record_date" class="form-control" required>
                <span class="form-error" id="dateError"></span>
            </div>

            <!-- Description -->
            <div class="form-group">
                <label for="description" class="form-label">
                    Description <span class="optional">(optional)</span>
                </label>
                <textarea id="description" name="description" class="form-control" rows="3"
                          maxlength="1000" placeholder="Add a brief description of this sale..."></textarea>
                <div class="form-help">
                    <span id="charCounter">0</span> / 1000 characters
                </div>
                <span class="form-error" id="descriptionError"></span>
            </div>

            <!-- Buttons Row -->
            <div class="form-actions">
                <button type="button" id="btnAdd" class="btn btn-success">
                    <i class="fas fa-plus"></i> Add Record
                </button>
                <button type="button" id="btnUpdate" class="btn btn-warning" style="display: none;">
                    <i class="fas fa-save"></i> Update Record
                </button>
                <button type="button" id="btnCancel" class="btn btn-secondary" style="display: none;">
                    <i class="fas fa-times"></i> Cancel Edit
                </button>
                <button type="button" id="btnReset" class="btn btn-outline">
                    <i class="fas fa-undo"></i> Reset
                </button>
            </div>
        </form>
    </div>
</div>
