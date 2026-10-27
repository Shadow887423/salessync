<?php

namespace Tests\Unit;

use App\Models\DataRecord;
use App\Services\ChartDataService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ChartDataServiceTest extends TestCase
{
    use RefreshDatabase;

    protected ChartDataService $service;

    protected function setUp(): void
    {
        parent::setUp();
        $this->service = new ChartDataService();
    }

    /**
     * Test that the service returns empty data when no records exist.
     */
    public function test_returns_empty_data_when_no_records_exist(): void
    {
        $chartData = $this->service->getAllChartData();

        $this->assertEmpty($chartData['barData']['labels']);
        $this->assertEmpty($chartData['barData']['values']);
        $this->assertEmpty($chartData['lineData']['labels']);
        $this->assertEmpty($chartData['lineData']['values']);
        $this->assertEmpty($chartData['pieData']['labels']);
        $this->assertEmpty($chartData['pieData']['values']);
        $this->assertEquals(0, $chartData['stats']['totalRecords']);
        $this->assertEquals(0, $chartData['stats']['totalValue']);
        $this->assertEquals(0, $chartData['stats']['averageValue']);
        $this->assertNull($chartData['stats']['highestRecord']);
    }

    /**
     * Test that bar chart data has the correct structure.
     */
    public function test_returns_correct_bar_chart_structure(): void
    {
        DataRecord::factory()->create([
            'category' => 'Electronics',
            'value' => 500.00,
            'record_date' => now()->subDays(5)->toDateString(),
        ]);
        DataRecord::factory()->create([
            'category' => 'Electronics',
            'value' => 300.00,
            'record_date' => now()->subDays(3)->toDateString(),
        ]);
        DataRecord::factory()->create([
            'category' => 'Clothing',
            'value' => 200.00,
            'record_date' => now()->subDays(2)->toDateString(),
        ]);

        $barData = $this->service->getBarChartData();

        $this->assertArrayHasKey('labels', $barData);
        $this->assertArrayHasKey('values', $barData);
        $this->assertCount(2, $barData['labels']);
        $this->assertCount(2, $barData['values']);
        $this->assertContains('Electronics', $barData['labels']);
        $this->assertContains('Clothing', $barData['labels']);

        // Find the index for Electronics and verify sum
        $electronicsIndex = array_search('Electronics', $barData['labels']);
        $this->assertEquals(800.00, $barData['values'][$electronicsIndex]);

        $clothingIndex = array_search('Clothing', $barData['labels']);
        $this->assertEquals(200.00, $barData['values'][$clothingIndex]);
    }

    /**
     * Test that stats are calculated correctly.
     */
    public function test_returns_correct_stats(): void
    {
        DataRecord::factory()->create([
            'category' => 'Electronics',
            'value' => 1000.00,
            'record_date' => now()->subDays(5)->toDateString(),
        ]);
        DataRecord::factory()->create([
            'category' => 'Clothing',
            'value' => 500.00,
            'record_date' => now()->subDays(3)->toDateString(),
        ]);
        DataRecord::factory()->create([
            'category' => 'Sports',
            'value' => 250.00,
            'record_date' => now()->subDays(1)->toDateString(),
        ]);

        $stats = $this->service->getStats();

        $this->assertEquals(3, $stats['totalRecords']);
        $this->assertEquals(1750.00, $stats['totalValue']);
        $this->assertEqualsWithDelta(583.33, $stats['averageValue'], 0.01);
        $this->assertNotNull($stats['highestRecord']);
        $this->assertEquals('Electronics', $stats['highestRecord']['category']);
        $this->assertEquals(1000.00, $stats['highestRecord']['value']);
        $this->assertArrayHasKey('monthlyGrowth', $stats);
    }

    /**
     * Test that line chart data is grouped by month correctly.
     */
    public function test_returns_correct_line_chart_data(): void
    {
        $currentMonth = now();
        $lastMonth = now()->subMonth();

        DataRecord::factory()->create([
            'category' => 'Electronics',
            'value' => 100.00,
            'record_date' => $currentMonth->copy()->subDays(2)->toDateString(),
        ]);
        DataRecord::factory()->create([
            'category' => 'Clothing',
            'value' => 200.00,
            'record_date' => $lastMonth->copy()->subDays(5)->toDateString(),
        ]);

        $lineData = $this->service->getLineChartData();

        $this->assertArrayHasKey('labels', $lineData);
        $this->assertArrayHasKey('values', $lineData);
        $this->assertCount(2, $lineData['labels']);
        $this->assertCount(2, $lineData['values']);
    }

    /**
     * Test that pie chart data includes percentages.
     */
    public function test_returns_correct_pie_chart_data(): void
    {
        DataRecord::factory()->create([
            'category' => 'Electronics',
            'value' => 750.00,
            'record_date' => now()->subDays(5)->toDateString(),
        ]);
        DataRecord::factory()->create([
            'category' => 'Clothing',
            'value' => 250.00,
            'record_date' => now()->subDays(3)->toDateString(),
        ]);

        $pieData = $this->service->getPieChartData();

        $this->assertArrayHasKey('labels', $pieData);
        $this->assertArrayHasKey('values', $pieData);
        $this->assertArrayHasKey('percentages', $pieData);
        $this->assertCount(2, $pieData['labels']);
        $this->assertEquals(100.0, array_sum($pieData['percentages']));
    }
}
