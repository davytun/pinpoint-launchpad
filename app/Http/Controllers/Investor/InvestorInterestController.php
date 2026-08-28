<?php

namespace App\Http\Controllers\Investor;

use App\Http\Controllers\Controller;
use App\Http\Requests\Investor\StoreInvestorInterestRequest;
use App\Models\SpotlightEntry;
use App\Services\InvestorInterestWorkflowService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class InvestorInterestController extends Controller
{
    public function index(): Response
    {
        $investor = Auth::guard('investor')->user();

        $dataRoomGrants = $investor->dataRoomGrants()
            ->get()
            ->keyBy('profile_id');

        $interests = $investor->interests()
            ->with(['profile.founder:id,company_name', 'profile:id,founder_id,slug,sector,spotlight_one_liner'])
            ->latest()
            ->get()
            ->map(function ($interest) use ($dataRoomGrants) {
                $grant = $dataRoomGrants->get($interest->profile_id);
                $dataRoomStatus = 'none';
                if ($grant !== null) {
                    $dataRoomStatus = $grant->revoked_at === null ? 'granted' : 'revoked';
                }

                return [
                    'id' => $interest->id,
                    'type' => $interest->type,
                    'message' => $interest->message,
                    'status' => $interest->status,
                    'investor_facing_status' => $interest->getInvestorFacingStatus($grant),
                    'founder_decision' => $interest->founder_decision,
                    'created_at' => $interest->created_at->toISOString(),
                    'scheduled_at' => $interest->scheduled_at?->toISOString(),
                    'completed_at' => $interest->completed_at?->toISOString(),
                    'meeting_link' => $interest->meeting_link,
                    'introduction_status' => $interest->getIntroductionStatus(),
                    'data_room_status' => $dataRoomStatus,
                    'profile' => [
                        'slug' => $interest->profile?->slug,
                        'sector' => $interest->profile?->sector,
                        'spotlight_one_liner' => $interest->profile?->spotlight_one_liner,
                        'founder' => [
                            'company_name' => $interest->profile?->founder?->company_name ?? 'PIN Startup',
                        ],
                    ],
                ];
            });

        return Inertia::render('Investor/Interests', [
            'interests' => $interests,
        ]);
    }

    public function store(StoreInvestorInterestRequest $request, string $slug, InvestorInterestWorkflowService $workflow): RedirectResponse
    {
        $investor = Auth::guard('investor')->user();
        abort_unless($investor->canAccessProtectedInvestorContent(), 403, 'KYC approval is required to submit interest.');

        $entry = SpotlightEntry::published()->with('profile')->whereHas('profile', fn ($query) => $query->where('slug', $slug))->firstOrFail();
        $workflow->submit($investor, $entry->profile, $request->validated(), $request->ip(), $request->userAgent());

        return redirect()->route('investor.interests.index')->with('success', 'Your interest has been submitted to Pinpoint Investor Relations for review.');
    }
}
