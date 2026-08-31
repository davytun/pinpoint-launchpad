<?php

use App\Mail\PiaAgreementInviteMail;
use App\Models\DiagnosticSession;
use App\Models\Payment;
use App\Models\PiaApplication;
use App\Models\User;
use Illuminate\Support\Facades\Mail;

test('a superadmin can confirm an offline PIA payment and send the agreement handoff', function () {
    Mail::fake();

    $admin = User::factory()->create(['role' => 'superadmin']);
    $diagnostic = DiagnosticSession::create([
        'email' => 'founder@example.test',
        'name' => 'Test Founder',
        'company_name' => 'Test Company',
        'country' => 'Nigeria',
        'answers' => [],
        'score' => 84,
        'score_band' => 'high',
        'pillar_scores' => [],
    ]);
    $application = PiaApplication::create([
        'name' => 'Test Founder',
        'email' => 'founder@example.test',
        'company' => 'Test Company',
        'country' => 'Nigeria',
        'stage' => 'seed',
        'raise_target' => '$100k-$500k',
        'source' => 'diagnostic_tier_selection',
        'selected_tier' => 'growth',
    ]);

    $this->actingAs($admin)
        ->post(route('admin.pia-requests.payment-received', $application), ['amount' => 2090000, 'currency' => 'NGN'])
        ->assertRedirect();

    $payment = Payment::query()->sole();
    expect($payment->diagnostic_session_id)->toBe($diagnostic->id)
        ->and($payment->status)->toBe('paid')
        ->and($payment->audit_status)->toBe('pending')
        ->and($payment->total_amount)->toBe(2090000)
        ->and($payment->currency)->toBe('NGN');

    expect($application->fresh()->status)->toBe('converted');
    Mail::assertSent(PiaAgreementInviteMail::class, fn (PiaAgreementInviteMail $mail) => $mail->hasTo('founder@example.test'));
});

test('only a superadmin can record offline payment', function () {
    $analyst = User::factory()->create(['role' => 'analyst']);
    $application = PiaApplication::create([
        'name' => 'Test Founder',
        'email' => 'founder@example.test',
        'company' => 'Test Company',
        'country' => 'Nigeria',
        'stage' => 'seed',
        'raise_target' => '$100k-$500k',
        'selected_tier' => 'growth',
    ]);

    $this->actingAs($analyst)
        ->post(route('admin.pia-requests.payment-received', $application), ['amount' => 2090000, 'currency' => 'NGN'])
        ->assertForbidden();
});
