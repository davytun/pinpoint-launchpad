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
        $queue = $request->query('queue', 'all');
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

        if ($queue === 'awaiting_founder') {
            $query->where(function ($q) {
                $q->whereNull('founder_decision')->orWhere('founder_decision', 'pending');
            })->where('status', 'pending');
        } elseif ($queue === 'founder_authorized') {
            $query->where('founder_decision', 'approved')->where('status', 'pending');
        } elseif ($queue === 'awaiting_schedule') {
            $query->where('type', 'founder_call')->where('founder_decision', 'approved')->whereNull('scheduled_at');
        } elseif ($queue === 'awaiting_grant') {
            $query->where('type', 'data_room_access')->where('founder_decision', 'approved')->where('status', 'pending');
        } elseif ($queue === 'completed') {
            $query->where(function ($q) {
                $q->whereNotNull('completed_at')->orWhere('status', 'approved');
            });
        }

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

        $totalsRow = InvestorInterest::query()->selectRaw("
            count(*) as all_count,
            sum(case when status = 'pending' then 1 else 0 end) as pending,
            sum(case when status = 'approved' then 1 else 0 end) as approved,
            sum(case when status = 'denied' then 1 else 0 end) as denied,
            sum(case when status = 'pending' and (founder_decision is null or founder_decision = 'pending') then 1 else 0 end) as awaiting_founder,
            sum(case when status = 'pending' and founder_decision = 'approved' then 1 else 0 end) as founder_authorized,
            sum(case when type = 'founder_call' and founder_decision = 'approved' and scheduled_at is null then 1 else 0 end) as awaiting_schedule,
            sum(case when type = 'data_room_access' and founder_decision = 'approved' and status = 'pending' then 1 else 0 end) as awaiting_grant,
            sum(case when type = 'data_room_access' then 1 else 0 end) as data_room_requests,
            sum(case when type = 'founder_call' then 1 else 0 end) as founder_call_requests,
            sum(case when type = 'more_details' then 1 else 0 end) as more_details_requests,
            sum(case when type = 'founder_call' and scheduled_at is not null and completed_at is null then 1 else 0 end) as scheduled_calls,
            sum(case when type = 'founder_call' and completed_at is not null then 1 else 0 end) as completed_calls,
            sum(case when type = 'founder_call' and status = 'pending' then 1 else 0 end) as pending_introductions
        ")->first();
        $totals = [
            'all' => (int) $totalsRow->all_count,
            'pending' => (int) $totalsRow->pending,
            'approved' => (int) $totalsRow->approved,
            'denied' => (int) $totalsRow->denied,
            'awaiting_founder' => (int) $totalsRow->awaiting_founder,
            'founder_authorized' => (int) $totalsRow->founder_authorized,
            'awaiting_schedule' => (int) $totalsRow->awaiting_schedule,
            'awaiting_grant' => (int) $totalsRow->awaiting_grant,
            'data_room_requests' => (int) $totalsRow->data_room_requests,
            'founder_call_requests' => (int) $totalsRow->founder_call_requests,
            'more_details_requests' => (int) $totalsRow->more_details_requests,
            'scheduled_calls' => (int) $totalsRow->scheduled_calls,
            'completed_calls' => (int) $totalsRow->completed_calls,
            'pending_introductions' => (int) $totalsRow->pending_introductions,
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
            'activeQueue' => $queue,
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
