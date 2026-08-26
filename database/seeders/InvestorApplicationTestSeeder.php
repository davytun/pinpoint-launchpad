<?php

namespace Database\Seeders;

use App\Models\InvestorApplication;
use Carbon\Carbon;
use Illuminate\Database\Seeder;

class InvestorApplicationTestSeeder extends Seeder
{
    public function run(): void
    {
        $apps = [
            [
                'investor_type' => 'vc',
                'name' => 'Julian Sterling',
                'email' => 'julian@sterlingvc.com',
                'organisation' => 'Sterling Capital Partners',
                'role' => 'Managing Partner',
                'country' => 'United Kingdom',
                'website' => 'https://sterlingvc.com',
                'stages' => ['Seed', 'Series A'],
                'sectors' => ['FinTech', 'B2B SaaS', 'AI/ML'],
                'geographies' => ['UK', 'Europe', 'North America'],
                'cheque_size' => '$500k - $2M',
                'instrument' => 'Priced Equity / SAFE',
                'deals_per_year' => '8 - 12',
                'thesis_notes' => 'Early-stage B2B enterprise SaaS and applied AI infrastructure.',
                'status' => 'pending',
                'submitted_at' => Carbon::now()->subHours(8),
                'created_at' => Carbon::now()->subHours(8),
            ],
            [
                'investor_type' => 'angel',
                'name' => 'Claire Beauchamp',
                'email' => 'claire@highlandangel.net',
                'organisation' => 'Highland Angel Syndicate',
                'role' => 'Syndicate Lead',
                'country' => 'United States',
                'website' => 'https://highlandangel.net',
                'stages' => ['Pre-Seed', 'Seed'],
                'sectors' => ['HealthTech', 'Digital Health'],
                'geographies' => ['US', 'Canada'],
                'cheque_size' => '$100k - $350k',
                'instrument' => 'SAFE / Convertible Note',
                'deals_per_year' => '4 - 6',
                'thesis_notes' => 'Backing clinical workflow and healthcare automation founders.',
                'status' => 'approved',
                'submitted_at' => Carbon::now()->subDays(2),
                'created_at' => Carbon::now()->subDays(2),
            ],
            [
                'investor_type' => 'family_office',
                'name' => 'Henrik Lindqvist',
                'email' => 'henrik@nordicfamily.se',
                'organisation' => 'Nordic Capital Family Office',
                'role' => 'Chief Investment Officer',
                'country' => 'Sweden',
                'website' => 'https://nordicfamily.se',
                'stages' => ['Series A', 'Growth'],
                'sectors' => ['ClimateTech', 'Energy', 'Industrial'],
                'geographies' => ['Nordics', 'DACH', 'UK'],
                'cheque_size' => '$1M - $5M',
                'instrument' => 'Equity',
                'deals_per_year' => '3 - 5',
                'thesis_notes' => 'Sustainable industrial software and energy transition scaleups.',
                'status' => 'request_more_info',
                'submitted_at' => Carbon::now()->subDays(3),
                'created_at' => Carbon::now()->subDays(3),
            ],
            [
                'investor_type' => 'dfi',
                'name' => 'Amara Okafor',
                'email' => 'amara@impactafrica.org',
                'organisation' => 'Pan-African Impact Fund',
                'role' => 'Investment Director',
                'country' => 'Nigeria',
                'website' => 'https://impactafrica.org',
                'stages' => ['Seed', 'Series A'],
                'sectors' => ['FinTech', 'AgriTech', 'Clean Energy'],
                'geographies' => ['West Africa', 'East Africa'],
                'cheque_size' => '$250k - $1.5M',
                'instrument' => 'Equity & Mezzanine',
                'deals_per_year' => '6 - 10',
                'thesis_notes' => 'High-growth emerging market digital infrastructure and financial inclusion.',
                'status' => 'pending',
                'submitted_at' => Carbon::now()->subHours(16),
                'created_at' => Carbon::now()->subHours(16),
            ],
            [
                'investor_type' => 'corporate',
                'name' => 'Taro Tanaka',
                'email' => 't.tanaka@solaris-ventures.jp',
                'organisation' => 'Solaris Global Corporate Ventures',
                'role' => 'VP Ventures',
                'country' => 'Japan',
                'website' => 'https://solaris-ventures.jp',
                'stages' => ['Series A', 'Series B'],
                'sectors' => ['DeepTech', 'Robotics', 'Logistics'],
                'geographies' => ['APAC', 'US'],
                'cheque_size' => '$2M - $8M',
                'instrument' => 'Strategic Direct Equity',
                'deals_per_year' => '4 - 8',
                'thesis_notes' => 'Corporate strategic investments in logistics robotics and autonomous supply chain.',
                'status' => 'rejected',
                'submitted_at' => Carbon::now()->subDays(5),
                'created_at' => Carbon::now()->subDays(5),
            ],
        ];

        foreach ($apps as $app) {
            InvestorApplication::updateOrCreate(
                ['email' => $app['email']],
                $app
            );
        }
    }
}
