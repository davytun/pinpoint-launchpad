<?php

namespace Database\Factories;

use App\Models\Founder;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

/**
 * @extends Factory<Founder>
 */
class FounderFactory extends Factory
{
    public function definition(): array
    {
        return [
            'email'             => fake()->unique()->safeEmail(),
            'password'          => Hash::make('password'),
            'full_name'         => fake()->name(),
            'company_name'      => fake()->company(),
            'email_verified_at' => now(),
            'remember_token'    => Str::random(10),
        ];
    }

    public function unverified(): static
    {
        return $this->state(fn () => ['email_verified_at' => null]);
    }
}
