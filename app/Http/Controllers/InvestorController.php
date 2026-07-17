<?php

namespace App\Http\Controllers;

use App\Mail\InvestorApplicationAdminMail;
use App\Mail\InvestorApplicationConfirmationMail;
use App\Models\InvestorApplication;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Inertia\Inertia;
use Inertia\Response;

class InvestorController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('Investor/Index');
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'investor_type'  => ['required', 'string', 'in:angel,vc,family_office,syndicate,dfi,corporate'],
            'name'           => ['required', 'string', 'max:255'],
            'email'          => ['required', 'email', 'max:255'],
            'organisation'   => ['nullable', 'string', 'max:255'],
            'role'           => ['nullable', 'string', 'max:255'],
            'country'        => ['required', 'string', 'max:255'],
            'website'        => ['nullable', 'string', 'max:255'],

            // Mandate
            'stages'         => ['nullable', 'array'],
            'sectors'        => ['nullable', 'array'],
            'geographies'    => ['nullable', 'array'],
            'cheque_size'    => ['nullable', 'string', 'max:100'],
            'instrument'     => ['nullable', 'string', 'max:100'],
            'deals_per_year' => ['nullable', 'string', 'max:100'],
            'fund_detail'    => ['nullable', 'string', 'max:255'],
            'thesis_notes'   => ['nullable', 'string'],

            // Confirmations
            'confirmations'                     => ['required', 'array'],
            'confirmations.investor_status'     => ['required', 'boolean', 'accepted'],
            'confirmations.risk_understood'     => ['required', 'boolean', 'accepted'],
            'confirmations.no_recommendation'   => ['required', 'boolean', 'accepted'],
            'confirmations.aml_source_of_funds' => ['required', 'boolean', 'accepted'],
            'confirmations.terms_agreed'        => ['required', 'boolean', 'accepted'],
        ]);

        $application = InvestorApplication::create([
            'investor_type'  => $validated['investor_type'],
            'name'           => $validated['name'],
            'email'          => $validated['email'],
            'organisation'   => $validated['organisation'] ?? null,
            'role'           => $validated['role'] ?? null,
            'country'        => $validated['country'],
            'website'        => $validated['website'] ?? null,
            'stages'         => $validated['stages'] ?? [],
            'sectors'        => $validated['sectors'] ?? [],
            'geographies'    => $validated['geographies'] ?? [],
            'cheque_size'    => $validated['cheque_size'] ?? null,
            'instrument'     => $validated['instrument'] ?? null,
            'deals_per_year' => $validated['deals_per_year'] ?? null,
            'fund_detail'    => $validated['fund_detail'] ?? null,
            'thesis_notes'   => $validated['thesis_notes'] ?? null,
            'status'         => 'pending',
            'confirmations'  => $validated['confirmations'],
            'submitted_at'   => now(),
        ]);

        // Send confirmation to applicant
        Mail::to($application->email)->queue(new InvestorApplicationConfirmationMail($application));

        // Send alert to admin
        $adminEmail = config('mail.admin_address') ?: 'admin@pinpoint.network';
        Mail::to($adminEmail)->queue(new InvestorApplicationAdminMail($application));

        return redirect()->back()->with('success', 'Application received successfully.');
    }
}
