<?php

namespace App\Http\Controllers\Investor;

use App\Http\Controllers\Controller;
use App\Http\Requests\Investor\StoreInvestorOnboardingRequest;
use App\Models\AuditLog;
use App\Models\Investor;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class InvestorOnboardingController extends Controller
{
    public function create(): Response
    {
        return Inertia::render('Investor/Onboarding');
    }

    public function store(StoreInvestorOnboardingRequest $request): RedirectResponse
    {
        $validated = $request->validated();

        DB::transaction(function () use ($validated, $request): void {
            $investor = Investor::create([
                'email' => $validated['email'],
                'password' => $validated['password'],
                'account_status' => 'active',
                'terms_accepted_at' => now(),
                'aml_confirmed_at' => now(),
            ]);

            $investor->profile()->create([
                'investor_type' => $validated['investor_type'],
                'full_name' => $validated['full_name'],
                'company_name' => $validated['company_name'] ?? null,
                'phone' => $validated['phone'],
                'address' => $validated['address'],
            ]);

            AuditLog::create([
                'event' => 'investor.onboarding_submitted',
                'auditable_type' => Investor::class,
                'auditable_id' => $investor->id,
                'metadata' => ['investor_type' => $validated['investor_type']],
                'ip_address' => $request->ip(),
                'user_agent' => $request->userAgent(),
            ]);
            Auth::guard('investor')->login($investor);
        });

        return redirect()->route('investor.dashboard')
            ->with('success', 'Your account has been created successfully. Please complete KYC to unlock full access.');
    }
}
