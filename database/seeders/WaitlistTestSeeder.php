<?php

namespace Database\Seeders;

use App\Models\WaitlistEntry;
use Carbon\Carbon;
use Illuminate\Database\Seeder;

class WaitlistTestSeeder extends Seeder
{
    public function run(): void
    {
        $entries = [
            [
                'type' => 'founder',
                'name' => 'Alexander Hayes',
                'email' => 'alex@stratahealth.co',
                'company_name' => 'Strata Health',
                'firm_name' => null,
                'stage' => 'Seed',
                'role' => null,
                'email_sent_at' => Carbon::now()->subDays(2),
                'converted_at' => Carbon::now()->subHours(6),
                'created_at' => Carbon::now()->subDays(3),
            ],
            [
                'type' => 'founder',
                'name' => 'Elena Rostova',
                'email' => 'elena@novafin.ai',
                'company_name' => 'NovaFin AI',
                'firm_name' => null,
                'stage' => 'Series A',
                'role' => null,
                'email_sent_at' => Carbon::now()->subHours(18),
                'converted_at' => null,
                'created_at' => Carbon::now()->subDays(1),
            ],
            [
                'type' => 'investor',
                'name' => 'Julian Sterling',
                'email' => 'julian@sterlingvc.com',
                'company_name' => null,
                'firm_name' => 'Sterling Capital Partners',
                'stage' => null,
                'role' => 'Managing Partner',
                'email_sent_at' => Carbon::now()->subDays(4),
                'converted_at' => Carbon::now()->subDays(1),
                'created_at' => Carbon::now()->subDays(5),
            ],
            [
                'type' => 'founder',
                'name' => 'Marcus Chen',
                'email' => 'marcus@quantumlogistics.io',
                'company_name' => 'Quantum Logistics',
                'firm_name' => null,
                'stage' => 'Pre-Seed',
                'role' => null,
                'email_sent_at' => null,
                'converted_at' => null,
                'created_at' => Carbon::now()->subHours(4),
            ],
            [
                'type' => 'investor',
                'name' => 'Sophia Vandermeer',
                'email' => 'sophia@aurorafund.eu',
                'company_name' => null,
                'firm_name' => 'Aurora Ventures Europe',
                'stage' => null,
                'role' => 'Principal',
                'email_sent_at' => Carbon::now()->subDays(1),
                'converted_at' => null,
                'created_at' => Carbon::now()->subDays(2),
            ],
            [
                'type' => 'founder',
                'name' => 'David Kalu',
                'email' => 'david@paystackr.africa',
                'company_name' => 'Paystackr',
                'firm_name' => null,
                'stage' => 'Seed',
                'role' => null,
                'email_sent_at' => Carbon::now()->subHours(12),
                'converted_at' => null,
                'created_at' => Carbon::now()->subHours(14),
            ],
            [
                'type' => 'investor',
                'name' => 'Claire Beauchamp',
                'email' => 'claire@highlandangel.net',
                'company_name' => null,
                'firm_name' => 'Highland Angel Network',
                'stage' => null,
                'role' => 'Angel Syndicate Lead',
                'email_sent_at' => Carbon::now()->subDays(3),
                'converted_at' => Carbon::now()->subDays(2),
                'created_at' => Carbon::now()->subDays(6),
            ],
        ];

        foreach ($entries as $entry) {
            WaitlistEntry::updateOrCreate(
                ['email' => $entry['email']],
                $entry
            );
        }
    }
}
