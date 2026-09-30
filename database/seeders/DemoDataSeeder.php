<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

/**
 * Sample investors, spotlight/dealflow fixtures, and blog posts — local/staging only.
 */
class DemoDataSeeder extends Seeder
{
    public function run(): void
    {
        if (app()->environment('production')) {
            $this->command?->warn('DemoDataSeeder skipped (production).');

            return;
        }

        $this->call([
            InvestorSeeder::class,
            SpotlightAndDealflowSeeder::class,
            BlogPostSeeder::class,
        ]);
    }
}
