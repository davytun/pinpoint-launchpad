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
        return Inertia::render('Investor/Interests', ['interests' => $investor->interests()->with('profile.founder:id,company_name')->latest()->get()]);
    }

    public function store(StoreInvestorInterestRequest $request, string $slug, InvestorInterestWorkflowService $workflow): RedirectResponse
    {
        $investor = Auth::guard('investor')->user();
        abort_unless($investor->canAccessProtectedInvestorContent(), 403, 'KYC approval is required to submit interest.');

        $entry = SpotlightEntry::published()->with('profile')->whereHas('profile', fn ($query) => $query->where('slug', $slug))->firstOrFail();
        $workflow->submit($investor, $entry->profile, $request->validated(), $request->ip(), $request->userAgent());
        
        return redirect()->route('investor.interests.index')->with('success', 'Your interest has been shared with Pinpoint and the founder.');
    }
}
