<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\FounderProfile;
use App\Models\InvestorInterest;
use App\Services\InvestorInterestWorkflowService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class InvestorInterestController extends Controller
{
    public function index(Request $request): Response
    {
        $status = $request->query('status', 'all');
        $type = $request->query('type', 'all');
        $search = trim((string) $request->query('search', ''));
        $sector = $request->query('sector', 'all');
        $callStatus = $request->query('call_status', 'all');

        $query = InvestorInterest::query()
            ->with([
                'investor.profile',
                'profile.founder',
                'reviewer',
            ])
            ->latest();

        if ($status && $status !== 'all') {
            $query->where('status', $status);
        }

        if ($type && $type !== 'all') {
            $query->where('type', $type);
        }

        if ($sector && $sector !== 'all') {
            $query->whereHas('profile', fn ($q) => $q->where('sector', $sector));
        }

        if ($callStatus === 'scheduled') {
            $query->where('type', 'founder_call')->whereNotNull('scheduled_at')->whereNull('completed_at');
        } elseif ($callStatus === 'completed') {
            $query->where('type', 'founder_call')->whereNotNull('completed_at');
        } elseif ($callStatus === 'pending') {
            $query->where('type', 'founder_call')->where('status', 'pending');
        }

        if ($search !== '') {
            $query->where(function ($q) use ($search) {
                $q->where('message', 'like', "%{$search}%")
                    ->orWhereHas('investor', fn ($iq) => $iq->where('email', 'like', "%{$search}%")
                        ->orWhereHas('profile', fn ($pq) => $pq->where('full_name', 'like', "%{$search}%")
                            ->orWhere('company_name', 'like', "%{$search}%")))
                    ->orWhereHas('profile.founder', fn ($fq) => $fq->where('company_name', 'like', "%{$search}%")
                        ->orWhere('full_name', 'like', "%{$search}%"));
            });
        }

        $allInterests = InvestorInterest::all();
        $totals = [
            'all' => $allInterests->count(),
            'pending' => $allInterests->where('status', 'pending')->count(),
            'approved' => $allInterests->where('status', 'approved')->count(),
            'denied' => $allInterests->where('status', 'denied')->count(),
            'data_room_requests' => $allInterests->where('type', 'data_room_access')->count(),
            'founder_call_requests' => $allInterests->where('type', 'founder_call')->count(),
            'more_details_requests' => $allInterests->where('type', 'more_details')->count(),
            'scheduled_calls' => $allInterests->where('type', 'founder_call')->whereNotNull('scheduled_at')->whereNull('completed_at')->count(),
            'completed_calls' => $allInterests->where('type', 'founder_call')->whereNotNull('completed_at')->count(),
            'pending_introductions' => $allInterests->where('type', 'founder_call')->where('status', 'pending')->count(),
        ];

        $sectors = FounderProfile::query()
            ->whereNotNull('sector')
            ->distinct()
            ->pluck('sector')
            ->values()
            ->all();

        return Inertia::render('Admin/Dealflow/Interests', [
            'interests' => $query->paginate(15)->withQueryString(),
            'activeStatus' => $status,
            'activeType' => $type,
            'activeSector' => $sector,
            'activeCallStatus' => $callStatus,
            'search' => $search,
            'sectors' => $sectors,
            'totals' => $totals,
        ]);
    }

    public function update(
        Request $request,
        InvestorInterest $interest,
        InvestorInterestWorkflowService $workflow
    ): RedirectResponse {
        $validated = $request->validate([
            'status' => ['required', 'in:approved,denied,pending'],
            'notes' => ['nullable', 'string', 'max:1000'],
        ]);

        $status = $validated['status'];

        if ($status === 'pending') {
            $interest->update([
                'status' => 'pending',
                'reviewed_at' => null,
                'reviewed_by_founder' => null,
                'scheduled_at' => null,
                'completed_at' => null,
            ]);
            return back()->with('success', 'Interest request reset to pending.');
        }

        $workflow->reviewByAdmin(
            $interest,
            $request->user(),
            $status,
            $request->ip(),
            $request->userAgent()
        );

        return back()->with('success', "Interest request marked as {$status}.");
    }

    public function schedule(
        Request $request,
        InvestorInterest $interest,
        InvestorInterestWorkflowService $workflow
    ): RedirectResponse {
        $validated = $request->validate([
            'scheduled_at' => ['required', 'date'],
            'meeting_link' => ['nullable', 'string', 'max:500'],
            'notes' => ['nullable', 'string', 'max:1000'],
        ]);

        $workflow->scheduleIntroduction(
            $interest,
            $request->user(),
            $validated['scheduled_at'],
            $validated['meeting_link'] ?? null,
            $validated['notes'] ?? null,
            $request->ip(),
            $request->userAgent()
        );

        return back()->with('success', 'Introduction call scheduled successfully.');
    }

    public function complete(
        Request $request,
        InvestorInterest $interest,
        InvestorInterestWorkflowService $workflow
    ): RedirectResponse {
        $validated = $request->validate([
            'notes' => ['nullable', 'string', 'max:1000'],
        ]);

        $workflow->completeIntroduction(
            $interest,
            $request->user(),
            $validated['notes'] ?? null,
            $request->ip(),
            $request->userAgent()
        );

        return back()->with('success', 'Introduction call marked as completed.');
    }
}
