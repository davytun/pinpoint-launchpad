<?php

namespace App\Http\Controllers;

use App\Jobs\SendWaitlistEmail;
use App\Models\WaitlistEntry;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class WaitlistController extends Controller
{
    public function index(Request $request): Response
    {
        $audience = $request->query('audience');

        return Inertia::render('Waitlist/Index', [
            'selectedAudience' => in_array($audience, ['founder', 'investor']) ? $audience : null,
            'founderStages' => [
                ['value' => 'idea',        'label' => 'Idea Stage'],
                ['value' => 'pre-revenue', 'label' => 'Pre-Revenue'],
                ['value' => 'revenue',     'label' => 'Revenue'],
                ['value' => 'scaling',     'label' => 'Scaling'],
            ],
            'investorRoles' => [
                ['value' => 'angel',            'label' => 'Angel Investor'],
                ['value' => 'micro-vc',         'label' => 'Micro-VC'],
                ['value' => 'institutional-vc', 'label' => 'Institutional VC'],
                ['value' => 'family-office',    'label' => 'Family Office'],
                ['value' => 'other',            'label' => 'Other'],
            ],
            'founderStatus'  => session('founderStatus'),
            'investorStatus' => session('investorStatus'),
        ]);
    }

    public function storeFounder(Request $request): RedirectResponse
    {
        $request->validate([
            'name'         => ['required', 'string', 'max:100'],
            'email'        => ['required', 'email', 'unique:waitlist_entries,email'],
            'company_name' => ['required', 'string', 'max:150'],
            'stage'        => ['required', 'in:idea,pre-revenue,revenue,scaling'],
        ]);

        try {
            $entry = WaitlistEntry::create([
                'type'         => 'founder',
                'name'         => $request->name,
                'email'        => $request->email,
                'company_name' => $request->company_name,
                'stage'        => $request->stage,
            ]);

            SendWaitlistEmail::dispatch($entry);
        } catch (\Illuminate\Database\QueryException $e) {
            if ($e->errorInfo[1] === 1062) {
                return back()->withErrors(['email' => 'This email is already on the waitlist.']);
            }
            throw $e;
        }

        return redirect()
            ->route('waitlist.index', ['audience' => 'founder'])
            ->with('founderStatus', [
                'variant' => 'success',
                'message' => "You're on the list. Your PARAGON Readiness Checklist is on its way to your inbox.",
            ]);
    }

    public function storeInvestor(Request $request): RedirectResponse
    {
        $request->validate([
            'name'      => ['required', 'string', 'max:100'],
            'email'     => ['required', 'email', 'unique:waitlist_entries,email'],
            'firm_name' => ['required', 'string', 'max:150'],
            'role'      => ['required', 'in:angel,micro-vc,institutional-vc,family-office,other'],
        ]);

        try {
            $entry = WaitlistEntry::create([
                'type'      => 'investor',
                'name'      => $request->name,
                'email'     => $request->email,
                'firm_name' => $request->firm_name,
                'role'      => $request->role,
            ]);

            SendWaitlistEmail::dispatch($entry);
        } catch (\Illuminate\Database\QueryException $e) {
            if ($e->errorInfo[1] === 1062) {
                return back()->withErrors(['email' => 'This email is already on the waitlist.']);
            }
            throw $e;
        }

        return redirect()
            ->route('waitlist.index', ['audience' => 'investor'])
            ->with('investorStatus', [
                'variant' => 'success',
                'message' => "You're in. Welcome to the PIN Network — expect a message from us shortly.",
            ]);
    }
}
