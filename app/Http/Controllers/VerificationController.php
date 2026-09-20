<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use Inertia\Response;

class VerificationController extends Controller
{
    public function sample(): Response
    {
        return Inertia::render('Verification/Show', [
            'profile_id' => null,
            'founder_name' => 'SampleUnicorn AI',
            'company_name' => 'SampleUnicorn AI',
            'sector' => 'B2B SaaS / Infrastructure',
            'batch' => 'Spring 2026',
            'overall_score' => 88,
            'radar_data' => [
                'potential' => 90,
                'agility' => 85,
                'risk' => 80,
                'alignment' => 95,
                'governance' => 85,
                'operations' => 88,
                'network' => 90,
            ],
            'analyst_summary' => 'Strong execution and clean ownership. Cap table reconciles; IP assignments are on file. The growth case rests on a verified 4.2× LTV/CAC from six months of Stripe history — not a deck claim. Main open question is concentration in the top three customers.',
            'badges' => [
                ['badge_type' => 'legal',          'label' => 'LEGAL: VERIFIED',          'is_verified' => true],
                ['badge_type' => 'financial',      'label' => 'FINANCING: VERIFIED',       'is_verified' => true],
                ['badge_type' => 'tech_stack',     'label' => 'TECH STACK: AUDITED',       'is_verified' => true],
                ['badge_type' => 'cap_table',      'label' => 'CAP TABLE: CLEAN',          'is_verified' => true],
                ['badge_type' => 'ip_ownership',   'label' => 'IP OWNERSHIP: CONFIRMED',   'is_verified' => true],
                ['badge_type' => 'unit_economics', 'label' => 'UNIT ECONOMICS: VERIFIED',  'is_verified' => true],
                ['badge_type' => 'market_size',    'label' => 'MARKET SIZE: VALIDATED',    'is_verified' => true],
            ],
            'tier' => 'institutional',
            'verified_at' => '01 Feb 2026',
            'expires_at' => '02 May 2026',
            'days_until_expiry' => 4,
            'is_sample' => true,
            'access_request_count' => 0,
            'slug' => 'sample-unicorn',
            'is_unlocked' => false,
            'token' => null,
            'unlocked_documents' => [],
        ]);
    }
}
