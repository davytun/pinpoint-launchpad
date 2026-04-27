<?php

namespace App\Http\Controllers\Founder;

use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cache;
use Inertia\Inertia;
use Inertia\Response;

class FounderDashboardController extends Controller
{
    public function index(): Response
    {
        /** @var \App\Models\Founder $founder */
        $founder = Auth::guard('founder')->user()->load([
            'diagnosticSession:id,pillar_scores',
            'payment:id,tier,total_amount,paid_at,audit_status',
            'signature:id,status,signed_at',
        ]);

        $pillarScores = Cache::remember(
            'founder_pillar_scores_' . $founder->id,
            now()->addMinutes(30),
            fn () => $founder->diagnosticSession?->pillar_scores ?? []
        );

        $scoreBandMessages = [
            'low'      => 'You are in the Build phase.',
            'mid_low'  => 'You have a foundation but are hitting Red Flag territory.',
            'mid_high' => 'Investment Ready Candidate.',
            'high'     => 'High Velocity Candidate.',
        ];

        $tierFeatures = [
            'foundation' => [
                'Full Radar Chart',
                'Actionable Blueprint (5-page gap analysis)',
                'Digital Readiness Badge',
                'Standard Email Support',
            ],
            'growth' => [
                'Full Radar Chart',
                'Actionable Blueprint',
                'Digital Readiness Badge',
                '1-on-1 Analyst Review (45 min)',
                'Financial Stress-Test',
                'Tier 2 PIN Access (3 VC intros)',
            ],
            'institutional' => [
                'Full Radar Chart',
                'Actionable Blueprint',
                'Digital Readiness Badge',
                '1-on-1 Analyst Review',
                'Financial Stress-Test',
                '2-Hour Strategy Intensive',
                'Verified Portal (custom URL)',
                'PIN Network Max (unlimited VC access)',
                '$1,500 credited against 2% warrant',
            ],
        ];

        $auditStatusConfig = [
            'pending' => [
                'label'       => 'Awaiting Assignment',
                'color'       => 'slate',
                'description' => 'Your application is in the queue. An analyst will be assigned shortly.',
            ],
            'in_progress' => [
                'label'       => 'Audit In Progress',
                'color'       => 'blue',
                'description' => 'Your analyst is actively reviewing your venture profile.',
            ],
            'needs_info' => [
                'label'       => 'Action Required',
                'color'       => 'amber',
                'description' => 'Your analyst needs additional information to proceed. Please check your messages.',
            ],
            'on_hold' => [
                'label'       => 'On Hold',
                'color'       => 'orange',
                'description' => 'Your audit is temporarily paused. Your analyst will be in touch.',
            ],
            'complete' => [
                'label'       => 'Audit Complete',
                'color'       => 'emerald',
                'description' => 'Your PARAGON Certification is ready. Your investor page is now live.',
            ],
        ];

        $auditStatus = $founder->payment?->audit_status ?? 'pending';
        $tier        = $founder->tier;

        return Inertia::render('Founder/Dashboard', [
            'founder' => [
                'id'           => $founder->id,
                'email'        => $founder->email,
                'full_name'    => $founder->full_name,
                'company_name' => $founder->company_name,
                'avatar'       => $founder->avatar,
                'created_at'   => $founder->created_at?->toISOString(),
                'last_login_at'=> $founder->last_login_at?->toISOString(),
            ],
            'score'              => $founder->score,
            'score_band'         => $founder->score_band,
            'pillar_scores'      => $pillarScores,
            'score_band_message' => $scoreBandMessages[$founder->score_band ?? ''] ?? '',
            'tier'               => $tier,
            'tier_features'      => $tierFeatures[$tier ?? ''] ?? [],
            'audit_status'       => $auditStatus,
            'audit_status_config'=> $auditStatusConfig,
            'payment'            => $founder->payment ? [
                'tier'         => $founder->payment->tier,
                'total_amount' => $founder->payment->total_amount,
                'paid_at'      => $founder->payment->paid_at?->toISOString(),
            ] : null,
            'signature' => $founder->signature ? [
                'status'    => $founder->signature->status,
                'signed_at' => $founder->signature->signed_at?->toISOString(),
            ] : null,
            'verification_url' => null,
        ]);
    }
}
