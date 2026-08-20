<?php

namespace App\Http\Controllers\Investor;

use App\Http\Controllers\Controller;
use App\Http\Requests\Investor\StoreInvestorInterestRequest;
use App\Models\AuditLog;
use App\Models\InvestorInterest;
use App\Models\SpotlightEntry;
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

    public function store(StoreInvestorInterestRequest $request, string $slug): RedirectResponse
    {
        $investor = Auth::guard('investor')->user();
        abort_unless($investor->canAccessProtectedInvestorContent(), 403, 'KYC approval is required to submit interest.');

        $entry = SpotlightEntry::published()->with('profile')->whereHas('profile', fn ($query) => $query->where('slug', $slug))->firstOrFail();
        $interest = InvestorInterest::updateOrCreate(['investor_id' => $investor->id, 'profile_id' => $entry->profile_id], array_merge($request->validated(), ['status' => 'pending', 'reviewed_at' => null, 'reviewed_by_founder' => null]));
        AuditLog::create(['event' => 'investor.interest_submitted', 'actor_type' => $investor::class, 'actor_id' => $investor->id, 'auditable_type' => $interest::class, 'auditable_id' => $interest->id, 'metadata' => ['profile_id' => $entry->profile_id, 'type' => $interest->type], 'ip_address' => $request->ip(), 'user_agent' => $request->userAgent()]);
        
        $entry->profile->founder->notify(new \App\Notifications\InvestorInterestReceivedNotification($interest));
        
        return redirect()->route('investor.interests.index')->with('success', 'Your interest has been shared with Pinpoint and the founder.');
    }
}
