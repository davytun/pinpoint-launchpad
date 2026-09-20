<?php

namespace App\Http\Controllers\Investor;

use App\Http\Controllers\Controller;
use App\Models\Investor;
use App\Models\SpotlightEntry;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class InvestorDashboardController extends Controller
{
    public function index(): Response
    {
        /** @var Investor $investor */
        $investor = Auth::guard('investor')->user()->load('profile');

        $openInterests = $investor->interests()
            ->where(function ($query) {
                $query->where('status', 'pending')
                    ->orWhere(function ($inner) {
                        $inner->where('status', 'approved')
                            ->whereNull('completed_at')
                            ->where(function ($decision) {
                                $decision->whereNull('founder_decision')
                                    ->orWhere('founder_decision', '!=', 'declined');
                            });
                    });
            })
            ->count();

        $activeDataRooms = $investor->dataRoomGrants()
            ->whereNull('revoked_at')
            ->count();

        $openDiligence = $investor->diligenceRequests()
            ->whereNotIn('status', ['resolved', 'declined'])
            ->count();

        $publishedSpotlight = SpotlightEntry::published()->count();

        return Inertia::render('Investor/Dashboard', [
            'investor' => [
                'full_name' => $investor->profile?->full_name ?? 'Investor',
                'email' => $investor->email,
                'kyc_status' => $investor->kyc_status,
                'can_access_protected' => $investor->canAccessProtectedInvestorContent(),
            ],
            'stats' => [
                'published_startups' => $publishedSpotlight,
                'open_interests' => $openInterests,
                'active_data_rooms' => $activeDataRooms,
                'open_diligence' => $openDiligence,
            ],
            'next_step' => $this->nextStep($investor, $openInterests, $activeDataRooms, $openDiligence),
        ]);
    }

    /**
     * @return array{title: string, body: string, cta_label: string, cta_route: string, tone: string}
     */
    private function nextStep(Investor $investor, int $openInterests, int $activeDataRooms, int $openDiligence): array
    {
        if ($investor->needsKycSubmission()) {
            $rejected = $investor->kyc_status === Investor::KYC_STATUS_REJECTED;

            return [
                'title' => $rejected ? 'Update your identity document' : 'Verify your identity',
                'body' => $rejected
                    ? 'Compliance asked for a clearer document. Upload a replacement to unlock protected investor actions.'
                    : 'Submit your ID (or company certificate) so compliance can unlock interest, pitch decks, and data rooms.',
                'cta_label' => $rejected ? 'Resubmit KYC' : 'Start verification',
                'cta_route' => 'investor.kyc.create',
                'tone' => 'amber',
            ];
        }

        if ($investor->hasPendingKyc()) {
            return [
                'title' => 'Verification under review',
                'body' => 'You can browse Spotlight now. Expressing interest, diligence, data rooms, and pitch decks unlock after approval.',
                'cta_label' => 'Browse Spotlight',
                'cta_route' => 'investor.spotlight.index',
                'tone' => 'amber',
            ];
        }

        if ($openDiligence > 0) {
            return [
                'title' => 'Diligence updates waiting',
                'body' => 'You have open diligence threads. Review responses or follow up through Pinpoint.',
                'cta_label' => 'Open diligence',
                'cta_route' => 'investor.diligence.index',
                'tone' => 'blue',
            ];
        }

        if ($activeDataRooms > 0) {
            return [
                'title' => 'Data rooms ready',
                'body' => 'You have active data room access. Review documents when you are ready.',
                'cta_label' => 'Open data rooms',
                'cta_route' => 'investor.data-rooms.index',
                'tone' => 'emerald',
            ];
        }

        if ($openInterests > 0) {
            return [
                'title' => 'Engagements in progress',
                'body' => 'Pinpoint is coordinating one or more of your interest requests. Track status on Interests.',
                'cta_label' => 'View interests',
                'cta_route' => 'investor.interests.index',
                'tone' => 'blue',
            ];
        }

        return [
            'title' => 'Browse verified startups',
            'body' => 'Your identity is verified. Explore Spotlight and submit a mediated interest when a company fits.',
            'cta_label' => 'Go to Spotlight',
            'cta_route' => 'investor.spotlight.index',
            'tone' => 'emerald',
        ];
    }
}
