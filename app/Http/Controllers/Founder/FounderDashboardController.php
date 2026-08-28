<?php

namespace App\Http\Controllers\Founder;

use App\Http\Controllers\Controller;
use App\Models\Founder;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cache;
use App\Models\InvestorInterest;
use App\Http\Requests\Founder\ReviewInvestorInterestRequest;
use App\Services\InvestorInterestWorkflowService;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class FounderDashboardController extends Controller
{
    public function index(): Response
    {
        /** @var Founder $founder */
        $founder = Auth::guard('founder')->user()->load([
            'diagnosticSession:id,pillar_scores,score,score_band',
            'payment:id,tier,total_amount,paid_at,audit_status',
            'signature:id,status,signed_at',
            'profile:id,founder_id,slug,is_public,is_featured_in_spotlight,verified_at,expires_at',
        ]);

        $pillarScores = Cache::remember(
            'founder_pillar_scores_'.$founder->id,
            now()->addMinutes(30),
            fn () => $founder->diagnosticSession?->pillar_scores ?? []
        );

        $scoreBandMessages = [
            'low' => 'You are in the Build phase.',
            'mid_low' => 'You have a foundation but are hitting Red Flag territory.',
            'mid_high' => 'Investment Ready Candidate.',
            'high' => 'High Velocity Candidate.',
        ];

        $tierFeatures = [
            'foundation' => [
                'Full PARAGON scan (weighted to Potential)',
                '1 founder interview (60 min)',
                'Analyst-delivered 12–15 page structured report',
                '1 debrief call',
                '10–12 hours',
                'Turnaround 7 working days',
            ],
            'growth' => [
                'Everything in Stage 01',
                'Financial review (up to 24 months)',
                'Unit-economics and LTV: CAC build',
                'Cap table and founding-document review',
                '3 interviews',
                'Analyst + associate, partner-reviewed 25–30 page report',
                'Investor-readiness gap list',
                '25–30 hours',
                'Turnaround 12 working days',
            ],
            'institutional' => [
                'Everything in Stage 02',
                'Full data-room review',
                'Corporate and governance structure analysis',
                'Material contract and IP review',
                'Management-team assessment',
                '5+ interviews',
                '40+ page report',
                'Board-ready presentation',
                'Partner-led',
                '60+ hours',
                'Turnaround 20 working days',
                'Scope confirmed and quoted before invoice',
            ],
        ];

        $auditStatusConfig = [
            'pending' => [
                'label' => 'Awaiting Assignment',
                'color' => 'slate',
                'description' => 'Your application is in the queue. An analyst will be assigned shortly.',
            ],
            'in_progress' => [
                'label' => 'Audit In Progress',
                'color' => 'blue',
                'description' => 'Your analyst is actively reviewing your venture profile.',
            ],
            'needs_info' => [
                'label' => 'Action Required',
                'color' => 'amber',
                'description' => 'Your analyst needs additional information to proceed. Please check your messages.',
            ],
            'on_hold' => [
                'label' => 'On Hold',
                'color' => 'orange',
                'description' => 'Your audit is temporarily paused. Your analyst will be in touch.',
            ],
            'complete' => [
                'label' => 'Audit Complete',
                'color' => 'emerald',
                'description' => 'Your PARAGON Certification is ready. You can now prepare your Spotlight profile for Pinpoint review.',
            ],
        ];

        $auditStatus = $founder->payment?->audit_status ?? 'pending';
        $tier = $founder->tier;

        $dataRoomGrants = $founder->profile
            ? $founder->profile->investorDataRoomGrants()
                ->whereNull('revoked_at')
                ->get()
                ->keyBy('investor_id')
            : collect();

        $accessRequests = $founder->profile
            ? $founder->profile->investorInterests()
                ->with('investor.profile')
                ->orderBy('created_at', 'desc')
                ->get()
                ->map(function ($interest) use ($dataRoomGrants) {
                    $grant = $dataRoomGrants->get($interest->investor_id);
                    $latestActivity = $interest->completed_at
                        ?? $interest->scheduled_at
                        ?? $interest->reviewed_at
                        ?? $interest->created_at;

                    return [
                        'id' => $interest->id,
                        'investor_name' => $interest->investor?->profile?->full_name ?? 'Anonymous Investor',
                        'investor_type' => $interest->investor?->profile?->investor_type ?? 'individual',
                        'firm_name' => $interest->investor?->profile?->company_name,
                        'type' => $interest->type,
                        'message' => $interest->message,
                        'status' => $interest->status,
                        'stage' => $interest->getEngagementStage($grant),
                        'introduction_status' => $interest->getIntroductionStatus(),
                        'data_room_granted' => $grant !== null,
                        'scheduled_at' => $interest->scheduled_at?->toISOString(),
                        'completed_at' => $interest->completed_at?->toISOString(),
                        'meeting_link' => $interest->meeting_link,
                        'latest_activity_at' => $latestActivity?->toISOString(),
                        'created_at' => $interest->created_at->toISOString(),
                    ];
                })
                ->toArray()
            : [];

        return Inertia::render('Founder/Dashboard', [
            'founder' => [
                'id' => $founder->id,
                'email' => $founder->email,
                'full_name' => $founder->full_name,
                'company_name' => $founder->company_name,
                'avatar' => $founder->avatar,
                'created_at' => $founder->created_at?->toISOString(),
                'last_login_at' => $founder->last_login_at?->toISOString(),
            ],
            'score' => $founder->score,
            'score_band' => $founder->score_band,
            'pillar_scores' => $pillarScores,
            'score_band_message' => $scoreBandMessages[$founder->score_band ?? ''] ?? '',
            'tier' => $tier,
            'tier_features' => $tierFeatures[$tier ?? ''] ?? [],
            'audit_status' => $auditStatus,
            'audit_status_config' => $auditStatusConfig,
            'payment' => $founder->payment ? [
                'tier' => $founder->payment->tier,
                'total_amount' => $founder->payment->total_amount,
                'paid_at' => $founder->payment->paid_at?->toISOString(),
            ] : null,
            'signature' => $founder->signature ? [
                'status' => $founder->signature->status,
                'signed_at' => $founder->signature->signed_at?->toISOString(),
            ] : null,
            'spotlight_featured' => $founder->profile?->is_featured_in_spotlight ?? false,
            'access_requests' => $accessRequests,
        ]);
    }

    public function updateRequestStatus(ReviewInvestorInterestRequest $request, InvestorInterest $accessRequest, InvestorInterestWorkflowService $workflow): RedirectResponse
    {
        $profile = $accessRequest->profile;
        if (! $profile || $profile->founder_id !== Auth::guard('founder')->id()) {
            abort(403, 'Unauthorized action.');
        }

        $workflow->review($accessRequest, Auth::guard('founder')->user(), $request->validated('status'), $request->ip(), $request->userAgent());

        $msg = $request->validated('status') === 'approved'
            ? ($accessRequest->type === 'data_room_access' ? 'Interest approved. The investor has been granted access to your data room.' : 'Interest approved. Pinpoint Investor Relations will coordinate the next step.')
            : 'Interest denied.';

        return back()->with('success', $msg);
    }
}
