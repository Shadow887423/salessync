<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class DataRecord extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     * Hardening: Whitelisted fillable attributes block mass-assignment vulnerabilities.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'category',
        'value',
        'record_date',
        'description',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'value' => 'decimal:2',
        'record_date' => 'date',
    ];

    /**
     * The accessors to append to the model's array form.
     *
     * @var array<int, string>
     */
    protected $appends = ['formatted_value'];

    /**
     * Mutator for category: Sanitize HTML tags and control characters.
     */
    public function setCategoryAttribute($value): void
    {
        $clean = is_string($value) ? trim(strip_tags(str_replace(chr(0), '', $value))) : $value;
        $this->attributes['category'] = $clean;
    }

    /**
     * Mutator for description: Sanitize HTML tags and control characters.
     */
    public function setDescriptionAttribute($value): void
    {
        $clean = is_string($value) ? trim(strip_tags(str_replace(chr(0), '', $value))) : $value;
        $this->attributes['description'] = $clean ?: null;
    }

    /**
     * Get the currency-formatted value.
     *
     * @return string
     */
    public function getFormattedValueAttribute(): string
    {
        return '$' . number_format((float) $this->value, 2);
    }

    /**
     * Scope a query to filter records by category.
     * Uses prepared parameter binding.
     *
     * @param  \Illuminate\Database\Eloquent\Builder  $query
     * @param  string  $category
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeByCategory($query, string $category)
    {
        return $query->where('category', $category);
    }

    /**
     * Scope a query to filter records by date range.
     * Uses prepared parameter binding.
     *
     * @param  \Illuminate\Database\Eloquent\Builder  $query
     * @param  string  $start
     * @param  string  $end
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeByDateRange($query, string $start, string $end)
    {
        return $query->whereBetween('record_date', [$start, $end]);
    }
}
