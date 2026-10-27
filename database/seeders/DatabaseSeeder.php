<?php

namespace Database\Seeders;

use App\Models\DataRecord;
use Illuminate\Database\Seeder;
use Illuminate\Support\Carbon;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $salesData = [
            ['category' => 'Electronics', 'value' => 1299.99, 'record_date' => Carbon::now()->subDays(5)->toDateString(), 'description' => 'Laptop sale - Dell XPS 15'],
            ['category' => 'Electronics', 'value' => 849.50, 'record_date' => Carbon::now()->subDays(15)->toDateString(), 'description' => 'Smartphone bundle deal'],
            ['category' => 'Electronics', 'value' => 2450.00, 'record_date' => Carbon::now()->subMonths(2)->subDays(3)->toDateString(), 'description' => 'Home theater system installation'],
            ['category' => 'Electronics', 'value' => 399.99, 'record_date' => Carbon::now()->subMonths(4)->subDays(10)->toDateString(), 'description' => 'Tablet and accessories package'],
            ['category' => 'Clothing', 'value' => 325.75, 'record_date' => Carbon::now()->subDays(3)->toDateString(), 'description' => 'Designer jacket collection'],
            ['category' => 'Clothing', 'value' => 189.90, 'record_date' => Carbon::now()->subDays(20)->toDateString(), 'description' => 'Summer dress clearance'],
            ['category' => 'Clothing', 'value' => 540.00, 'record_date' => Carbon::now()->subMonths(1)->subDays(8)->toDateString(), 'description' => 'Business suit order'],
            ['category' => 'Clothing', 'value' => 78.50, 'record_date' => Carbon::now()->subMonths(3)->subDays(12)->toDateString(), 'description' => 'T-shirt bulk order'],
            ['category' => 'Food & Beverage', 'value' => 156.30, 'record_date' => Carbon::now()->subDays(1)->toDateString(), 'description' => 'Catering order for office event'],
            ['category' => 'Food & Beverage', 'value' => 89.99, 'record_date' => Carbon::now()->subDays(10)->toDateString(), 'description' => 'Premium coffee subscription'],
            ['category' => 'Food & Beverage', 'value' => 450.00, 'record_date' => Carbon::now()->subMonths(1)->subDays(5)->toDateString(), 'description' => 'Restaurant supply wholesale'],
            ['category' => 'Food & Beverage', 'value' => 234.50, 'record_date' => Carbon::now()->subMonths(2)->subDays(18)->toDateString(), 'description' => 'Organic produce bulk purchase'],
            ['category' => 'Home & Garden', 'value' => 780.00, 'record_date' => Carbon::now()->subDays(7)->toDateString(), 'description' => 'Patio furniture set'],
            ['category' => 'Home & Garden', 'value' => 165.25, 'record_date' => Carbon::now()->subDays(25)->toDateString(), 'description' => 'Garden tools and seeds'],
            ['category' => 'Home & Garden', 'value' => 1120.00, 'record_date' => Carbon::now()->subMonths(2)->toDateString(), 'description' => 'Kitchen remodel supplies'],
            ['category' => 'Home & Garden', 'value' => 95.99, 'record_date' => Carbon::now()->subMonths(5)->subDays(2)->toDateString(), 'description' => 'Indoor plant collection'],
            ['category' => 'Sports', 'value' => 675.00, 'record_date' => Carbon::now()->subDays(4)->toDateString(), 'description' => 'Professional tennis equipment'],
            ['category' => 'Sports', 'value' => 299.95, 'record_date' => Carbon::now()->subDays(12)->toDateString(), 'description' => 'Running shoes and gear bundle'],
            ['category' => 'Sports', 'value' => 1500.00, 'record_date' => Carbon::now()->subMonths(1)->subDays(15)->toDateString(), 'description' => 'Gym equipment wholesale order'],
            ['category' => 'Sports', 'value' => 189.00, 'record_date' => Carbon::now()->subMonths(3)->subDays(7)->toDateString(), 'description' => 'Yoga and fitness accessories'],
        ];

        foreach ($salesData as $data) {
            DataRecord::create($data);
        }
    }
}
