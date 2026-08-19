<?php

namespace App\Http\Controllers\Investor;

use App\Http\Controllers\Controller;
use App\Http\Requests\Investor\InvestorLoginRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class InvestorAuthController extends Controller
{
    public function showLogin(): Response|RedirectResponse
    {
        if (Auth::guard('investor')->check()) {
            return redirect()->route('investor.dashboard');
        }

        return Inertia::render('Investor/Auth/Login', [
            'status' => session('status'),
        ]);
    }

    public function login(InvestorLoginRequest $request): RedirectResponse
    {
        $validated = $request->validated();

        if (! Auth::guard('investor')->attempt([
            'email' => $validated['email'],
            'password' => $validated['password'],
            'account_status' => 'active',
        ], $request->boolean('remember'))) {
            return back()->withErrors([
                'email' => 'We could not sign you in. Your account may still be under review.',
            ])->onlyInput('email');
        }

        $request->session()->regenerate();
        Auth::guard('investor')->user()->update(['last_login_at' => now()]);

        return redirect()->intended(route('investor.dashboard'));
    }

    public function logout(Request $request): RedirectResponse
    {
        Auth::guard('investor')->logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect()->route('investor.login');
    }

    public function dashboard(): Response
    {
        return Inertia::render('Investor/Dashboard', [
            'investor' => Auth::guard('investor')->user()->load('profile:investor_id,full_name'),
        ]);
    }
}
