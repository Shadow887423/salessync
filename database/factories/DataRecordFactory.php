<?php

namespace Database\Factories;

use App\Models\DataRecord;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\DataRecord>
 */
class DataRecordFactory extends Factory
{
    /**
     * The name of the factory's corresponding model.
     *
     * @var string
     */
    protected $model = DataRecord::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $categories = ['Electronics', 'Clothing', 'Food & Beverage', 'Home & Garden', 'Sports'];

        return [
            'category' => $this->faker->randomElement($categories),
            'value' => $this->faker->randomFloat(2, 10.00, 5000.00),
            'record_date' => $this->faker->dateTimeBetween('-6 months', 'now')->format('Y-m-d'),
            'description' => $this->faker->optional(0.8)->sentence(8),
        ];
    }

    /**
     * Indicate that the record belongs to the Electronics category.
     */
    public function electronics(): static
    {
        return $this->state(fn (array $attributes) => [
            'category' => 'Electronics',
        ]);
    }

    /**
     * Indicate that the record belongs to the Clothing category.
     */
    public function clothing(): static
    {
        return $this->state(fn (array $attributes) => [
            'category' => 'Clothing',
        ]);
    }

    /**
     * Indicate that the record belongs to the Food & Beverage category.
     */
    public function foodAndBeverage(): static
    {
        return $this->state(fn (array $attributes) => [
            'category' => 'Food & Beverage',
        ]);
    }

    /**
     * Indicate that the record belongs to the Home & Garden category.
     */
    public function homeAndGarden(): static
    {
        return $this->state(fn (array $attributes) => [
            'category' => 'Home & Garden',
        ]);
    }

    /**
     * Indicate that the record belongs to the Sports category.
     */
    public function sports(): static
    {
        return $this->state(fn (array $attributes) => [
            'category' => 'Sports',
        ]);
    }
}
