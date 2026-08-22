<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\UpdateInvestorAccountStatusRequest;
use App\Models\AuditLog;
use App\Models\Investor;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class InvestorAccountController extends Controller
{
    public function index(Request $request): Response
    {
        $kycStatus = $request->string('kyc_status')->toString();

        return Inertia::render('Admin/InvestorAccounts/Index', [
            'investors' => Investor::query()->with(['profile', 'latestKycSubmission'])
                ->when(in_array($kycStatus, [
                    Investor::KYC_STATUS_NOT_SUBMITTED,
                    Investor::KYC_STATUS_PENDING,
                    Investor::KYC_STATUS_APPROVED,
                    Investor::KYC_STATUS_REJECTED,
                ], true), fn ($query) => $query->where('kyc_status', $kycStatus))
                ->latest()->paginate(20)->withQueryString(),
            'activeKycStatus' => $kycStatus ?: 'all',
        ]);
    }

    public function show(Request $request, Investor $investor): Response
    {
        return Inertia::render('Admin/InvestorAccounts/Show', [
            'investor' => $investor->load(['profile', 'kycSubmissions']),
            'canReviewKyc' => $request->user()->isSuperAdmin() || $request->user()->isCompliance(),
        ]);
    }

    public function update(UpdateInvestorAccountStatusRequest $request, Investor $investor): RedirectResponse
    {
        $previousStatus = $investor->account_status;
        $investor->update(['account_status' => $request->validated('account_status')]);

        AuditLog::create([
            'event' => 'investor.account_status_updated',
            'actor_type' => $request->user()::class,
            'actor_id' => $request->user()->id,
            'auditable_type' => Investor::class,
            'auditable_id' => $investor->id,
            'metadata' => ['from' => $previousStatus, 'to' => $investor->account_status],
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);

        return back()->with('success', 'Investor account status updated.');
    }
}
