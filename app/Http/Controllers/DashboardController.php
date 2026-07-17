<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function index(Request $request): \Inertia\Response
    {
        $payment   = null;
        $signature = null;

        if ($request->session()->has('payment_id')) {
            $payment   = \App\Models\Payment::with('signature')->find($request->session()->get('payment_id'));
            $signature = $payment?->signature;
        }

        return \Inertia\Inertia::render('Dashboard/Index', [
            'tier'        => $payment ? $payment->tier_label : 'Concept / Pre-Seed',
            'amount_paid' => $payment?->total_amount ?? 0,
            'signed_at'   => $signature?->signed_at?->toDateTimeString(),
            'email'       => $payment?->customer_email ?? $request->user()?->email,
        ]);
    }
}
