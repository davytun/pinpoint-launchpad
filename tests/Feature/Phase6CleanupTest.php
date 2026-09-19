<?php

use App\Models\DiagnosticSession;
use App\Models\User;
use Illuminate\Support\Facades\URL;

function phase6DiagnosticSession(string $email): DiagnosticSession
{
    return DiagnosticSession::create([
        'email' => $email,
        'name' => 'Test Founder',
        'company_name' => 'Test Company',
        'country' => 'Nigeria',
        'answers' => [],
        'score' => 72,
        'score_band' => 'mid_high',
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

test('unsigned diagnostic result restore links are rejected', function () {
    $session = phase6DiagnosticSession('signed-view@example.com');

    $this->get(route('diagnostic.view', $session->id))->assertForbidden();
});

test('signed diagnostic result restore links work', function () {
    $session = phase6DiagnosticSession('signed-ok@example.com');

    $url = URL::temporarySignedRoute('diagnostic.view', now()->addDay(), ['id' => $session->id]);

    $this->get($url)->assertRedirect(route('diagnostic.result'));
});

test('retired support role cannot be set on team update', function () {
    $superadmin = User::factory()->create(['role' => 'superadmin']);
    $member = User::factory()->create(['role' => 'analyst']);

    $this->actingAs($superadmin)
        ->patch(route('admin.users.update', $member), [
            'name' => $member->name,
            'role' => 'support',
        ])
        ->assertSessionHasErrors('role');

    expect($member->fresh()->role)->toBe('analyst');
});
