<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\DiligenceRequest;
use App\Models\InvestorInterest;
use App\Services\DiligenceWorkflowService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DiligenceRequestController extends Controller
{
    public function index(Request $request): Response
    {
        $status = $request->query('status', 'all');
        $category = $request->query('category', 'all');
        $queue = $request->query('queue', 'all');
        $search = trim((string) $request->query('search', ''));

        $query = DiligenceRequest::query()
            ->with([
                'investor.profile',
                'profile.founder',
                'interest',
            ])
            ->latest();

        if ($queue === 'submitted') {
            $query->where('status', 'submitted');
        } elseif ($queue === 'waiting_for_founder') {
            $query->where('status', 'waiting_for_founder');
        } elseif ($queue === 'founder_responded') {
            $query->where('status', 'founder_responded');
        } elseif ($queue === 'resolved') {
            $query->where('status', 'resolved');
        }

        if ($status && $status !== 'all') {
            $query->where('status', $status);
        }

        if ($category && $category !== 'all') {
            $query->where('category', $category);
        }

        if ($search !== '') {
            $query->where(function ($q) use ($search) {
                $q->where('subject', 'like', "%{$search}%")
                    ->orWhere('request_details', 'like', "%{$search}%")
                    ->orWhereHas('investor.profile', fn ($iq) => $iq->where('full_name', 'like', "%{$search}%")->orWhere('company_name', 'like', "%{$search}%"))
                    ->orWhereHas('profile.founder', fn ($fq) => $fq->where('company_name', 'like', "%{$search}%")->orWhere('full_name', 'like', "%{$search}%"));
            });
        }

        $statusCounts = DiligenceRequest::query()
            ->selectRaw('status, count(*) as total')
            ->groupBy('status')
            ->pluck('total', 'status');
        $categoryCounts = DiligenceRequest::query()
            ->selectRaw('category, count(*) as total')
            ->groupBy('category')
            ->pluck('total', 'category');
        $totals = [
            'all' => (int) $statusCounts->sum(),
            'submitted' => (int) ($statusCounts['submitted'] ?? 0),
            'waiting_for_founder' => (int) ($statusCounts['waiting_for_founder'] ?? 0),
            'founder_responded' => (int) ($statusCounts['founder_responded'] ?? 0),
            'resolved' => (int) ($statusCounts['resolved'] ?? 0),
            'declined' => (int) ($statusCounts['declined'] ?? 0),
            'financial' => (int) ($categoryCounts['financial'] ?? 0),
            'operational' => (int) ($categoryCounts['operational'] ?? 0),
            'legal_governance' => (int) ($categoryCounts['legal_governance'] ?? 0),
            'document_request' => (int) ($categoryCounts['document_request'] ?? 0),
        ];

        return Inertia::render('Admin/Dealflow/Diligence', [
            'requests' => $query->paginate(15)->withQueryString(),
            'activeStatus' => $status,
            'activeCategory' => $category,
            'activeQueue' => $queue,
            'search' => $search,
            'totals' => $totals,
        ]);
    }

    public function requestFounder(
        Request $request,
        DiligenceRequest $diligenceRequest,
        DiligenceWorkflowService $workflow
    ): RedirectResponse {
        $validated = $request->validate([
            'admin_instructions_for_founder' => ['nullable', 'string', 'max:2000'],
        ]);

        $workflow->requestFounderResponse(
            $diligenceRequest,
            $request->user(),
            $validated['admin_instructions_for_founder'] ?? null,
            $request->ip(),
            $request->userAgent()
        );

        return back()->with('success', 'Information request sent to founder.');
    }

    public function releaseResponse(
        Request $request,
        DiligenceRequest $diligenceRequest,
        DiligenceWorkflowService $workflow
    ): RedirectResponse {
        $validated = $request->validate([
            'investor_visible_response' => ['required', 'string', 'max:5000'],
            'mark_resolved' => ['required', 'boolean'],
            'admin_notes' => ['nullable', 'string', 'max:2000'],
        ]);

        $workflow->releaseApprovedResponse(
            $diligenceRequest,
            $request->user(),
            $validated['investor_visible_response'],
            (bool) $validated['mark_resolved'],
            $validated['admin_notes'] ?? null,
            $request->ip(),
            $request->userAgent()
        );

        return back()->with('success', 'Approved diligence response published to investor.');
    }

    public function decline(
        Request $request,
        DiligenceRequest $diligenceRequest,
        DiligenceWorkflowService $workflow
    ): RedirectResponse {
        $validated = $request->validate([
            'reason' => ['nullable', 'string', 'max:1000'],
        ]);

        $workflow->declineRequest(
            $diligenceRequest,
            $request->user(),
            $validated['reason'] ?? null,
            $request->ip(),
            $request->userAgent()
        );

        return back()->with('success', 'Diligence request marked as declined.');
    }

    public function updateDealStage(
        Request $request,
        InvestorInterest $interest,
        DiligenceWorkflowService $workflow
    ): RedirectResponse {
        $validated = $request->validate([
            'deal_stage' => ['required', 'in:introduction,diligence,active_discussion,advanced_discussion,passed,closed'],
            'notes' => ['nullable', 'string', 'max:1000'],
        ]);

        $workflow->updateDealStage(
            $interest,
            $request->user(),
            $validated['deal_stage'],
            $validated['notes'] ?? null,
            $request->ip(),
            $request->userAgent()
        );

        return back()->with('success', 'Engagement stage updated successfully.');
    }
}
