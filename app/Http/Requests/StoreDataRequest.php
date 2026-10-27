<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreDataRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Sanitize inputs prior to validation.
     * Hardening: Strip tags, strip null bytes, and trim whitespace to block XSS and injection.
     */
    protected function prepareForValidation(): void
    {
        $sanitizeString = function ($value) {
            if (!is_string($value)) {
                return $value;
            }
            // Strip null bytes and control characters
            $clean = str_replace(chr(0), '', $value);
            // Strip HTML and PHP tags to eliminate stored XSS vectors
            $clean = strip_tags($clean);
            return trim($clean);
        };

        $this->merge([
            'category' => $sanitizeString($this->input('category')),
            'description' => $sanitizeString($this->input('description')),
        ]);
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'category' => [
                'required',
                'string',
                'max:100',
                'regex:/^[\pL\s\d\-&,\'()\/]+$/u',
            ],
            'value' => [
                'required',
                'numeric',
                'min:0.01',
                'max:9999999.99',
                'regex:/^\d+(\.\d{1,2})?$/',
            ],
            'record_date' => [
                'required',
                'date',
                'date_format:Y-m-d',
                'before_or_equal:today',
                'after:1970-01-01',
            ],
            'description' => [
                'nullable',
                'string',
                'max:1000',
            ],
        ];
    }

    /**
     * Get custom error messages for validator errors.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'category.required' => 'A category is required for the sales record.',
            'category.string' => 'The category must be a valid text string.',
            'category.max' => 'The category name cannot exceed 100 characters.',
            'category.regex' => 'The category contains invalid characters. Only alphanumeric text and standard punctuation are allowed.',
            'value.required' => 'A sales value is required.',
            'value.numeric' => 'The sales value must be a valid number.',
            'value.min' => 'The sales value must be at least $0.01.',
            'value.max' => 'The sales value cannot exceed $9,999,999.99.',
            'value.regex' => 'The sales value cannot have more than 2 decimal places.',
            'record_date.required' => 'A record date is required.',
            'record_date.date' => 'Please provide a valid date.',
            'record_date.date_format' => 'The date must be in YYYY-MM-DD format.',
            'record_date.before_or_equal' => 'The record date cannot be in the future.',
            'record_date.after' => 'The record date must be after 1970-01-01.',
            'description.string' => 'The description must be a valid text string.',
            'description.max' => 'The description cannot exceed 1000 characters.',
        ];
    }
}
