<?php

namespace App\Http\Controllers\Founder;

use App\Http\Controllers\Controller;
use App\Mail\InvestorAccessApprovedMail;
use App\Models\InvestorAccessRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Mail;
use Inertia\Inertia;
use Inertia\Response;

class FounderDashboardController extends Controller
{
    public function index(): Response
    {
        /** @var \App\Models\Founder $founder */
        $founder = Auth::guard('founder')->user()->load([
            'diagnosticSession:id,pillar_scores,score,score_band',
            'payment:id,tier,total_amount,paid_at,audit_status',
            'signature:id,status,signed_at',
            'profile:id,founder_id,slug,is_public,verified_at,expires_at',
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

        $accessRequests = $founder->profile
            ? $founder->profile->investorAccessRequests()
                ->orderBy('created_at', 'desc')
                ->get()
                ->map(fn ($req) => [
                    'id'             => $req->id,
                    'investor_name'  => $req->investor_name,
                    'investor_email' => $req->investor_email,
                    'firm_name'      => $req->firm_name,
                    'linkedin_url'   => $req->linkedin_url,
                    'message'        => $req->message,
                    'status'         => $req->status,
                    'created_at'     => $req->created_at->toISOString(),
                ])
                ->toArray()
            : [];

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
            'verification_url' => $founder->profile?->is_public
                ? route('verify.show', $founder->profile->slug)
                : null,
            'profile_is_live'  => $founder->profile?->isLive() ?? false,
            'access_requests'  => $accessRequests,
        ]);
    }

    public function updateRequestStatus(Request $request, InvestorAccessRequest $accessRequest): RedirectResponse
    {
        $request->validate([
            'status' => ['required', 'string', 'in:approved,rejected'],
        ]);

        $profile = $accessRequest->founderProfile;
        if (! $profile || $profile->founder_id !== Auth::id()) {
            abort(403, 'Unauthorized action.');
        }

        $accessRequest->update([
            'status' => $request->input('status'),
        ]);

        if ($request->input('status') === 'approved') {
            if (empty($accessRequest->token)) {
                $token = \Illuminate\Support\Str::random(32);
                $accessRequest->update([
                    'token' => $token,
                ]);
                $accessRequest->token = $token;
            }

            // Send the approval email notification to the investor
            Mail::to($accessRequest->investor_email)->send(
                new InvestorAccessApprovedMail(
                    $profile->founder,
                    $profile,
                    $accessRequest->investor_name,
                    $accessRequest->investor_email,
                    $accessRequest->token
                )
            );
        }

        $msg = $request->input('status') === 'approved'
            ? 'Access request approved. The investor has been emailed their secure link.'
            : 'Access request rejected.';

        return back()->with('success', $msg);
    }
}
