<?php

use App\Mail\DiagnosticResultMail;
use App\Models\DiagnosticSession;
use App\Models\Founder;
use App\Models\Payment;
use App\Models\PiaApplication;
use App\Services\DiagnosticProgress;
use Illuminate\Support\Facades\Mail;

function resumeDiagnostic(string $scoreBand, int $score, array $overrides = []): DiagnosticSession
{
    return DiagnosticSession::create(array_merge([
        'email' => "{$scoreBand}@example.test",
        'name' => 'Test Founder',
        'company_name' => 'Test Company',
        'country' => 'Nigeria',
        'growth_stage' => 'seed (trading, <$500k/yr)',
        'looking_to_raise' => '$100k–$500k',
        'answers' => [],
        'score' => $score,
        'score_band' => $scoreBand,
        'pillar_scores' => [
            'potential' => 80,
            'agility' => 80,
            'risk' => 80,
            'alignment' => 80,
            'governance' => 80,
            'operations' => 80,
            'network' => 80,
        ],
        'completed_at' => now(),
    ], $overrides));
}

function freshDiagnosticPayload(string $scoreBand, int $score): array
{
    return [
        'diagnostic_result' => [
            'total_score' => $score,
            'score_band' => $scoreBand,
            'answers' => [],
            'pillar_scores' => [
                'potential' => 40,
                'agility' => 40,
                'risk' => 40,
                'alignment' => 40,
                'governance' => 40,
                'operations' => 40,
                'network' => 40,
            ],
        ],
        'diagnostic_basics' => [
            'company_name' => 'New Company',
            'country' => 'Nigeria',
            'sector' => 'Fintech/Payments',
            'growth_stage' => 'seed (trading, <$500k/yr)',
            'describe_you' => 'startup (equity)',
            'looking_to_raise' => '$100k–$500k',
        ],
    ];
}

test('a saved diagnostic can be reopened from the resume cookie without a browser session', function () {
    $diagnostic = resumeDiagnostic('high', 84);

    $this->withCookie(DiagnosticProgress::COOKIE, $diagnostic->resume_token)
        ->get(route('checkout.index'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('Checkout/Index')
            ->where('diagnostic_session_id', $diagnostic->id)
            ->where('score', 84));
});

test('opening the diagnostic again returns a qualified founder to their results', function () {
    $diagnostic = resumeDiagnostic('mid_high', 62);

    $this->withCookie(DiagnosticProgress::COOKIE, $diagnostic->resume_token)
        ->get(route('diagnostic.index'))
        ->assertRedirect(route('diagnostic.result'));
});

test('a founder who already requested an audit tier returns to checkout', function () {
    $diagnostic = resumeDiagnostic('high', 84);

    PiaApplication::create([
        'name' => 'Test Founder',
        'email' => $diagnostic->email,
        'company' => 'Test Company',
        'country' => 'Nigeria',
        'stage' => 'seed',
        'raise_target' => '$100k–$500k',
        'source' => 'diagnostic_tier_selection',
        'selected_tier' => 'growth',
        'status' => 'pending',
    ]);

    $this->withCookie(DiagnosticProgress::COOKIE, $diagnostic->resume_token)
        ->get(route('diagnostic.index'))
        ->assertRedirect(route('checkout.index'));
});

test('the results email link restores checkout for a qualified founder', function () {
    $diagnostic = resumeDiagnostic('high', 84);

    $this->get($diagnostic->continueUrl('checkout'))
        ->assertRedirect(route('checkout.index'));
});

test('the results email link restores the score when the founder does not qualify for checkout', function () {
    $diagnostic = resumeDiagnostic('low', 30, [
        'cooldown_until' => now()->addDays(30),
    ]);

    $this->get($diagnostic->continueUrl('checkout'))
        ->assertRedirect(route('diagnostic.result'));
});

test('an unsigned continue link cannot restore a diagnostic', function () {
    $diagnostic = resumeDiagnostic('high', 84);

    $this->get(route('diagnostic.continue', [
        'diagnosticSession' => $diagnostic->id,
        'to' => 'checkout',
    ]))->assertForbidden();
});

test('entering the same email again continues the saved diagnostic', function () {
    Mail::fake();
    $diagnostic = resumeDiagnostic('high', 84);

    $this->withSession(freshDiagnosticPayload('high', 90))
        ->post(route('diagnostic.capture-email'), [
            'email' => $diagnostic->email,
            'name' => 'Test Founder',
            'role' => 'Founder',
        ])
        ->assertRedirect(route('diagnostic.result'));

    expect(DiagnosticSession::count())->toBe(1)
        ->and(DiagnosticSession::first()->score)->toBe(84);

    Mail::assertNothingQueued();
});

test('an email that already has a founder account continues at login', function () {
    Mail::fake();
    $diagnostic = resumeDiagnostic('high', 84);
    Founder::create([
        'email' => $diagnostic->email,
        'full_name' => 'Test Founder',
    ]);

    $this->withSession(freshDiagnosticPayload('high', 90))
        ->post(route('diagnostic.capture-email'), [
            'email' => $diagnostic->email,
            'name' => 'Test Founder',
            'role' => 'Founder',
        ])
        ->assertRedirect(route('founder.login'))
        ->assertSessionHas('info');

    expect(DiagnosticSession::count())->toBe(1);
    Mail::assertNothingQueued();
});

test('an email that already paid continues at the agreement step', function () {
    Mail::fake();
    $diagnostic = resumeDiagnostic('high', 84);
    $payment = Payment::create([
        'diagnostic_session_id' => $diagnostic->id,
        'tier' => 'foundation',
        'tier_base_amount' => 350000,
        'total_amount' => 350000,
        'currency' => 'NGN',
        'customer_email' => $diagnostic->email,
        'paid_at' => now(),
    ]);
    $payment->status = 'paid';
    $payment->save();

    $this->withSession(freshDiagnosticPayload('high', 90))
        ->post(route('diagnostic.capture-email'), [
            'email' => $diagnostic->email,
            'name' => 'Test Founder',
            'role' => 'Founder',
        ])
        ->assertRedirect(route('onboarding.sign'));

    expect(DiagnosticSession::count())->toBe(1);
    Mail::assertNothingQueued();
});

test('a low score still on cooldown is resumed instead of taken again', function () {
    Mail::fake();
    $diagnostic = resumeDiagnostic('low', 30, [
        'cooldown_until' => now()->addDays(10),
    ]);

    $this->withSession(freshDiagnosticPayload('low', 34))
        ->post(route('diagnostic.capture-email'), [
            'email' => $diagnostic->email,
            'name' => 'Test Founder',
            'role' => 'Founder',
        ])
        ->assertRedirect(route('diagnostic.result'));

    expect(DiagnosticSession::count())->toBe(1);
    Mail::assertNothingQueued();
});

test('a low score can be taken again after the cooldown', function () {
    Mail::fake();
    $diagnostic = resumeDiagnostic('low', 30, [
        'email' => 'retake@example.test',
        'cooldown_until' => now()->subDay(),
    ]);

    $this->withSession(freshDiagnosticPayload('low', 34))
        ->post(route('diagnostic.capture-email'), [
            'email' => $diagnostic->email,
            'name' => 'Test Founder',
            'role' => 'Founder',
        ])
        ->assertRedirect(route('diagnostic.result'));

    expect(DiagnosticSession::count())->toBe(2);
    Mail::assertQueued(DiagnosticResultMail::class);
});
