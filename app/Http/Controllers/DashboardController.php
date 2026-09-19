<?php

namespace App\Http\Controllers;

use App\Models\Payment;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(Request $request): Response
    {
        $payment = null;
        $signature = null;

        if ($request->session()->has('payment_id')) {
            $payment = Payment::with('signature')->find($request->session()->get('payment_id'));
            $signature = $payment?->signature;
        }

        return Inertia::render('Dashboard/Index', [
            'tier' => $payment ? $payment->tier_label : 'Concept / Pre-Seed',
            'amount_paid' => $payment?->total_amount ?? 0,
            'signed_at' => $signature?->signed_at?->toDateTimeString(),
            'email' => $payment?->customer_email ?? $request->user()?->email,
        ]);
    }
}
