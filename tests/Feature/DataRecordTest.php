<?php

namespace Tests\Feature;

use App\Models\DataRecord;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class DataRecordTest extends TestCase
{
    use RefreshDatabase;

    /**
     * Test that the dashboard page loads successfully.
     */
    public function test_can_view_dashboard(): void
    {
        DataRecord::factory()->count(3)->create();

        $response = $this->get(route('dashboard'));

        $response->assertStatus(200);
        $response->assertViewIs('dashboard.index');
        $response->assertViewHas('records');
        $response->assertViewHas('stats');
    }

    /**
     * Test that a record can be created via the API.
     */
    public function test_can_create_record_via_api(): void
    {
        $data = [
            'category' => 'Electronics',
            'value' => 299.99,
            'record_date' => now()->subDay()->toDateString(),
            'description' => 'Test electronics sale',
        ];

        $response = $this->postJson('/api/records', $data);

        $response->assertStatus(201)
            ->assertJson([
                'success' => true,
                'message' => 'Record created successfully.',
            ])
            ->assertJsonStructure([
                'success',
                'message',
                'record' => ['id', 'category', 'value', 'record_date', 'description'],
                'stats' => ['totalRecords', 'totalValue', 'averageValue'],
                'chartData' => ['barData', 'lineData', 'pieData', 'stats'],
            ]);

        $this->assertDatabaseHas('data_records', [
            'category' => 'Electronics',
            'value' => 299.99,
        ]);
    }

    /**
     * Test that invalid data is rejected when creating a record.
     */
    public function test_cannot_create_record_with_invalid_data(): void
    {
        // Missing required fields
        $response = $this->postJson('/api/records', []);
        $response->assertStatus(422)
            ->assertJsonValidationErrors(['category', 'value', 'record_date']);

        // Invalid value (negative)
        $response = $this->postJson('/api/records', [
            'category' => 'Electronics',
            'value' => -10,
            'record_date' => now()->toDateString(),
        ]);
        $response->assertStatus(422)
            ->assertJsonValidationErrors(['value']);

        // Future date
        $response = $this->postJson('/api/records', [
            'category' => 'Electronics',
            'value' => 100,
            'record_date' => now()->addDays(5)->toDateString(),
        ]);
        $response->assertStatus(422)
            ->assertJsonValidationErrors(['record_date']);

        // Value exceeds maximum
        $response = $this->postJson('/api/records', [
            'category' => 'Electronics',
            'value' => 99999999.99,
            'record_date' => now()->toDateString(),
        ]);
        $response->assertStatus(422)
            ->assertJsonValidationErrors(['value']);
    }

    /**
     * Test that a record can be updated via the API.
     */
    public function test_can_update_record(): void
    {
        $record = DataRecord::factory()->create([
            'category' => 'Electronics',
            'value' => 100.00,
        ]);

        $updatedData = [
            'category' => 'Clothing',
            'value' => 250.50,
            'record_date' => now()->subDays(2)->toDateString(),
            'description' => 'Updated record description',
        ];

        $response = $this->putJson("/api/records/{$record->id}", $updatedData);

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'message' => 'Record updated successfully.',
            ])
            ->assertJsonStructure([
                'success',
                'message',
                'record',
                'stats',
                'chartData',
            ]);

        $this->assertDatabaseHas('data_records', [
            'id' => $record->id,
            'category' => 'Clothing',
            'value' => 250.50,
        ]);
    }

    /**
     * Test that a record can be deleted via the API.
     */
    public function test_can_delete_record(): void
    {
        $record = DataRecord::factory()->create();

        $response = $this->deleteJson("/api/records/{$record->id}");

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'message' => 'Record deleted successfully.',
            ])
            ->assertJsonStructure([
                'success',
                'message',
                'stats',
                'chartData',
            ]);

        $this->assertDatabaseMissing('data_records', [
            'id' => $record->id,
        ]);
    }

    /**
     * Test that the chart data endpoint returns the correct structure.
     */
    public function test_chart_data_endpoint_returns_correct_structure(): void
    {
        DataRecord::factory()->count(5)->create();

        $response = $this->getJson('/api/chart-data');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'barData' => ['labels', 'values'],
                'lineData' => ['labels', 'values'],
                'pieData' => ['labels', 'values', 'percentages'],
                'stats' => [
                    'totalRecords',
                    'totalValue',
                    'averageValue',
                    'highestRecord',
                    'monthlyGrowth',
                ],
            ]);
    }

    /**
     * Security Test: XSS payloads are sanitized from incoming payloads.
     */
    public function test_xss_payloads_are_sanitized(): void
    {
        $payload = [
            'category' => '<b>Electronics</b>',
            'value' => 150.00,
            'record_date' => now()->toDateString(),
            'description' => '<script>alert("XSS")</script>Clean Description',
        ];

        $response = $this->postJson('/api/records', $payload);

        $response->assertStatus(201);
        $this->assertDatabaseHas('data_records', [
            'category' => 'Electronics',
            'description' => 'Clean Description',
        ]);
    }

    /**
     * Security Test: Categories with illegal characters are rejected.
     */
    public function test_category_with_illegal_characters_is_rejected(): void
    {
        $payload = [
            'category' => 'Electronics<script>;DROP TABLE data_records;',
            'value' => 100.00,
            'record_date' => now()->toDateString(),
        ];

        $response = $this->postJson('/api/records', $payload);
        $response->assertStatus(422)
            ->assertJsonValidationErrors(['category']);
    }

    /**
     * Security Test: Response contains hardened HTTP security headers.
     */
    public function test_security_headers_are_present(): void
    {
        $response = $this->get('/');

        $response->assertHeader('X-Content-Type-Options', 'nosniff');
        $response->assertHeader('X-Frame-Options', 'SAMEORIGIN');
        $response->assertHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    }
}
