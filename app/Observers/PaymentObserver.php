<?php

namespace App\Observers;

use App\Mail\ProfileCreatedAdminMail;
use App\Mail\VerificationPageLiveMail;
use App\Models\Founder;
use App\Models\FounderProfile;
use App\Models\Payment;
use App\Models\VerificationBadge;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;

class PaymentObserver
{
    public function updated(Payment $payment): void
    {
        if (! $payment->wasChanged('audit_status')) {
            return;
        }

        if ($payment->audit_status !== 'complete') {
            return;
        }

        $founder = $payment->founderProfile?->founder
            ?? Founder::where('payment_id', $payment->id)->first();

        if (! $founder) {
            return;
        }

        $pillarScores = $founder->diagnosticSession?->pillar_scores ?? [
            'potential'   => 0,
            'agility'     => 0,
            'risk'        => 0,
            'alignment'   => 0,
            'governance'  => 0,
            'operations'  => 0,
            'need'        => 0,
        ];

        $overallScore = $founder->diagnosticSession?->score ?? 0;

        $slug     = Str::slug($founder->company_name ?? $founder->email);
        $baseSlug = $slug;
        $counter  = 1;

        while (FounderProfile::where('slug', $slug)->exists()) {
            $slug = $baseSlug . '-' . $counter++;
        }

        $profile = FounderProfile::updateOrCreate(
            ['founder_id' => $founder->id],
            [
                'payment_id'    => $payment->id,
                'slug'          => $slug,
                'is_public'     => true,
                'radar_data'    => $pillarScores,
                'overall_score' => $overallScore,
                'batch'         => 'Spring 2026',
                'verified_at'   => now(),
                'expires_at'    => now()->addDays(90),
            ]
        );

        $defaultBadges = [
            'legal'          => 'LEGAL: VERIFIED',
            'financial'      => 'FINANCING: VERIFIED',
            'tech_stack'     => 'TECH STACK: AUDITED',
            'cap_table'      => 'CAP TABLE: CLEAN',
            'ip_ownership'   => 'IP OWNERSHIP: CONFIRMED',
            'unit_economics' => 'UNIT ECONOMICS: VERIFIED',
            'market_size'    => 'MARKET SIZE: VALIDATED',
        ];

        foreach ($defaultBadges as $type => $label) {
            VerificationBadge::firstOrCreate(
                ['profile_id' => $profile->id, 'badge_type' => $type],
                ['label' => $label, 'is_verified' => false]
            );
        }

        Mail::to($founder->email)->send(new VerificationPageLiveMail($founder, $profile));
        Mail::to(config('mail.admin_address'))->send(new ProfileCreatedAdminMail($founder, $profile));
    }
}
