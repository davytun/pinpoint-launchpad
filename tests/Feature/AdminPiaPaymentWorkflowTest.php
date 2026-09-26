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
        ->post(route('admin.founder.pia-requests.payment-received', $application), ['amount' => 2090000, 'currency' => 'NGN'])
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

test('founder desk surfaces open PIA requests for analysts and superadmins', function () {
    $analyst = User::factory()->create(['role' => 'analyst']);
    $superadmin = User::factory()->create(['role' => 'superadmin']);

    PiaApplication::create([
        'name' => 'Ada Founder',
        'email' => 'ada@startup.test',
        'company' => 'Startup Co',
        'country' => 'Nigeria',
        'stage' => 'seed',
        'raise_target' => '$100k-$500k',
        'source' => 'diagnostic_tier_selection',
        'selected_tier' => 'foundation',
        'status' => 'pending',
    ]);

    $this->actingAs($analyst)
        ->get(route('admin.founder.pia-requests.index'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('Admin/PiaRequests/Index')
            ->where('desk', 'founder')
            ->where('can_record_payment', true)
            ->has('applications.data', 1));

    $this->actingAs($superadmin)
        ->get(route('admin.founder.dashboard'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('Admin/Dashboard')
            ->where('desk', 'founder')
            ->where('metrics.pending_pia_count', 1)
            ->where('dealflow_handoff', null)
            ->has('needs_attention', 1)
            ->where('needs_attention.0.id', 'pending_pia'));
});

test('a payment request shows the diagnostic score stage country and raise target', function () {
    $admin = User::factory()->create(['role' => 'superadmin']);

    DiagnosticSession::create([
        'email' => 'ada@startup.test',
        'name' => 'Ada Founder',
        'company_name' => 'Startup Co',
        'country' => 'Nigeria',
        'growth_stage' => 'Seed',
        'looking_to_raise' => '$100k-$500k',
        'answers' => [],
        'score' => 76,
        'score_band' => 'mid_high',
        'pillar_scores' => [],
    ]);

    PiaApplication::create([
        'name' => 'Ada Founder',
        'email' => 'ada@startup.test',
        'company' => 'Startup Co',
        'country' => 'Nigeria',
        'stage' => 'seed',
        'raise_target' => '$100k-$500k',
        'source' => 'diagnostic_tier_selection',
        'selected_tier' => 'foundation',
        'status' => 'pending',
    ]);

    $this->actingAs($admin)
        ->get(route('admin.founder.pia-requests.index'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->where('applications.data.0.company', 'Startup Co')
            ->where('applications.data.0.name', 'Ada Founder')
            ->where('applications.data.0.selected_tier', 'foundation')
            ->where('applications.data.0.score', 76)
            ->where('applications.data.0.score_band_label', 'Getting Closer')
            ->where('applications.data.0.stage', 'Seed')
            ->where('applications.data.0.country', 'Nigeria')
            ->where('applications.data.0.raise_target', '$100k-$500k'));
});

test('an analyst on the founder desk can record offline payment', function () {
    Mail::fake();

    $analyst = User::factory()->create(['role' => 'analyst']);
    DiagnosticSession::create([
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
        'status' => 'contacted',
    ]);

    $this->actingAs($analyst)
        ->post(route('admin.founder.pia-requests.payment-received', $application), ['amount' => 2090000, 'currency' => 'NGN'])
        ->assertRedirect();

    expect($application->fresh()->status)->toBe('converted');
    Mail::assertSent(PiaAgreementInviteMail::class);
});

test('the secure agreement link establishes the paid founder session once', function () {
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
        'selected_tier' => 'foundation',
    ]);

    $this->actingAs($admin)
        ->post(route('admin.pia-requests.payment-received', $application), ['amount' => 350000, 'currency' => 'NGN'])
        ->assertRedirect();

    $agreementMail = null;
    Mail::assertSent(PiaAgreementInviteMail::class, function (PiaAgreementInviteMail $mail) use (&$agreementMail) {
        $agreementMail = $mail;

        return true;
    });

    // Invite link is one-shot: consume token, establish session, land on confirm-details.
    $this->followingRedirects()
        ->get($agreementMail->agreementUrl)
        ->assertOk()
        ->assertInertia(fn ($page) => $page->component('Onboarding/ConfirmDetails'));

    expect(session('payment_id'))->toBe(Payment::query()->sole()->id)
        ->and(session('diagnostic_session_id'))->toBe($diagnostic->id);

    $this->get($agreementMail->agreementUrl)
        ->assertRedirect(route('assessment'));
});
