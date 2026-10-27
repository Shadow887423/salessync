<div class="card">
    <div class="card__header">
        <h2 class="card__title">
            <i class="fas fa-table"></i> Sales Records
            <span class="badge" id="recordCountBadge">{{ count($records) }}</span>
        </h2>
    </div>

    <!-- Search / Filter Bar -->
    <div class="table-filters">
        <div class="filter-group">
            <div class="search-input-wrapper">
                <i class="fas fa-search"></i>
                <input type="text" id="searchInput" class="form-control" placeholder="Search records...">
            </div>
        </div>
        <div class="filter-group">
            <select id="filterCategory" class="form-control">
                <option value="">All Categories</option>
                <option value="Electronics">Electronics</option>
                <option value="Clothing">Clothing</option>
                <option value="Food & Beverage">Food &amp; Beverage</option>
                <option value="Home & Garden">Home &amp; Garden</option>
                <option value="Sports">Sports</option>
                <option value="Other">Other</option>
            </select>
        </div>
        <div class="filter-group">
            <input type="date" id="filterDateFrom" class="form-control" placeholder="From date">
        </div>
        <div class="filter-group">
            <input type="date" id="filterDateTo" class="form-control" placeholder="To date">
        </div>
    </div>

    <div class="card__body card__body--no-padding">
        <div class="table-responsive">
            <table class="data-table" id="recordsTable">
                <thead>
                    <tr>
                        <th>#</th>
                        <th>Category</th>
                        <th>Amount</th>
                        <th>Date</th>
                        <th>Description</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody id="recordsTableBody">
                    @forelse($records as $index => $record)
                    <tr data-id="{{ $record->id }}"
                        data-category="{{ $record->category }}"
                        data-value="{{ $record->value }}"
                        data-date="{{ $record->record_date }}"
                        data-description="{{ $record->description ?? '' }}">
                        <td>{{ $index + 1 }}</td>
                        <td>
                            <span class="category-badge category-badge--{{ Str::slug($record->category) }}">
                                {{ $record->category }}
                            </span>
                        </td>
                        <td class="amount-cell">${{ number_format($record->value, 2) }}</td>
                        <td>{{ \Carbon\Carbon::parse($record->record_date)->format('M d, Y') }}</td>
                        <td class="description-cell">{{ Str::limit($record->description, 50) }}</td>
                        <td class="actions-cell">
                            <button class="btn btn-sm btn-primary btn-edit" data-id="{{ $record->id }}" title="Edit">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="btn btn-sm btn-danger btn-delete" data-id="{{ $record->id }}" data-category="{{ $record->category }}" title="Delete">
                                <i class="fas fa-trash"></i>
                            </button>
                        </td>
                    </tr>
                    @empty
                    <tr id="emptyRow">
                        <td colspan="6" class="empty-table">
                            <i class="fas fa-inbox"></i>
                            <p>No records found. Start adding sales data!</p>
                        </td>
                    </tr>
                    @endforelse
                </tbody>
                <tfoot>
                    <tr>
                        <td colspan="2"><strong>Total</strong></td>
                        <td class="amount-cell" id="tableTotal">
                            <strong>${{ number_format($records->sum('value'), 2) }}</strong>
                        </td>
                        <td colspan="3"></td>
                    </tr>
                </tfoot>
            </table>
        </div>
    </div>
</div>
