<?php

use App\Models\DiagnosticSession;
use App\Models\PiaApplication;
use Illuminate\Support\Facades\Mail;

function diagnosticSessionForCheckout(string $scoreBand, int $score): DiagnosticSession
{
    return DiagnosticSession::create([
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
    ]);
}

test('qualified diagnostic bands can enter audit tier selection', function (string $scoreBand, int $score) {
    $diagnosticSession = diagnosticSessionForCheckout($scoreBand, $score);

    $this->withSession(['diagnostic_session_id' => $diagnosticSession->id])
        ->get(route('checkout.index'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('Checkout/Index')
            ->where('score_band', $scoreBand)
            ->where('diagnostic_session_id', $diagnosticSession->id));
})->with([
    'mid-high score' => ['mid_high', 55],
    'high score with a risk flag' => ['high', 84],
]);

test('lower diagnostic bands cannot enter audit tier selection', function (string $scoreBand, int $score) {
    $diagnosticSession = diagnosticSessionForCheckout($scoreBand, $score);

    $this->withSession(['diagnostic_session_id' => $diagnosticSession->id])
        ->get(route('checkout.index'))
        ->assertRedirect(route('diagnostic.result'));
})->with([
    'low score' => ['low', 34],
    'mid-low score' => ['mid_low', 54],
]);

test('a qualified founder can request a selected PIA tier without re-entering diagnostic details', function () {
    Mail::fake();
    $diagnosticSession = diagnosticSessionForCheckout('high', 84);

    $this->withSession(['diagnostic_session_id' => $diagnosticSession->id])
        ->post(route('checkout.request'), [
            'tier' => 'growth',
            'diagnostic_session_id' => $diagnosticSession->id,
        ])
        ->assertRedirect(route('checkout.index'));

    $application = PiaApplication::query()->sole();

    expect($application->email)->toBe($diagnosticSession->email)
        ->and($application->source)->toBe('diagnostic_tier_selection')
        ->and($application->selected_tier)->toBe('growth')
        ->and($application->message)->toBe('Selected PIA tier: growth.');

    $this->withSession(['diagnostic_session_id' => $diagnosticSession->id])
        ->post(route('checkout.request'), [
            'tier' => 'growth',
            'diagnostic_session_id' => $diagnosticSession->id,
        ])
        ->assertRedirect(route('checkout.index'));

    expect(PiaApplication::count())->toBe(1);

    $this->withSession(['diagnostic_session_id' => $diagnosticSession->id])
        ->get(route('checkout.index'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->where('request_submitted', true)
            ->where('submitted_tier', 'growth'));
});
