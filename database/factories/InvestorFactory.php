<?php

namespace Database\Factories;

use App\Models\Investor;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Investor>
 */
class InvestorFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'email' => fake()->unique()->safeEmail(),
            'password' => 'password',
            'account_status' => Investor::ACCOUNT_STATUS_ACTIVE,
            'kyc_status' => Investor::KYC_STATUS_NOT_SUBMITTED,
        ];
    }

    public function active(): static
    {
        return $this->state(fn (): array => ['account_status' => Investor::ACCOUNT_STATUS_ACTIVE]);
    }
}
