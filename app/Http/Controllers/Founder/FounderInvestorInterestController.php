<?php

namespace App\Http\Controllers\Founder;

use App\Http\Controllers\Controller;
use App\Http\Requests\Founder\ReviewInvestorInterestRequest;
use App\Models\AuditLog;
use App\Models\InvestorDataRoomGrant;
use App\Models\InvestorInterest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class FounderInvestorInterestController extends Controller
{
    public function index(): Response
    {
        $founder = Auth::guard('founder')->user();
        return Inertia::render('Founder/InvestorInterests', ['founder' => $founder->only(['full_name', 'company_name', 'email']), 'interests' => InvestorInterest::with(['investor.profile', 'profile'])->whereHas('profile', fn ($query) => $query->where('founder_id', $founder->id))->latest()->get()]);
    }

    public function review(ReviewInvestorInterestRequest $request, InvestorInterest $interest): RedirectResponse
    {
        $founder = Auth::guard('founder')->user();
        abort_unless($interest->profile->founder_id === $founder->id, 403);
        $status = $request->validated('status');
        $interest->update(['status' => $status, 'reviewed_by_founder' => $founder->id, 'reviewed_at' => now()]);
        if ($status === 'approved') InvestorDataRoomGrant::updateOrCreate(['investor_id' => $interest->investor_id, 'profile_id' => $interest->profile_id], ['granted_by_founder' => $founder->id, 'granted_at' => now(), 'revoked_at' => null]);
        AuditLog::create(['event' => "investor.interest_{$status}", 'actor_type' => $founder::class, 'actor_id' => $founder->id, 'auditable_type' => $interest::class, 'auditable_id' => $interest->id, 'metadata' => ['profile_id' => $interest->profile_id], 'ip_address' => $request->ip(), 'user_agent' => $request->userAgent()]);
        return back()->with('success', $status === 'approved' ? 'Interest approved and data-room access granted.' : 'Interest denied.');
    }
}
