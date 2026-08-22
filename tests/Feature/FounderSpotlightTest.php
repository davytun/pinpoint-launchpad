<?php

use App\Models\AuditLog;
use App\Models\Founder;
use App\Models\FounderProfile;
use App\Models\User;
use App\Services\DocumentService;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

function spotlightProfile(Founder $founder, array $attributes = []): FounderProfile
{
    return FounderProfile::create(array_merge([
        'founder_id' => $founder->id,
        'slug' => "{$founder->id}-spotlight",
    ], $attributes));
}

test('a founder can save Spotlight content and the edit is audited', function () {
    $founder = Founder::factory()->create();
    $profile = spotlightProfile($founder);

    $this->actingAs($founder, 'founder')
        ->patch(route('founder.spotlight.update'), [
            'spotlight_one_liner' => 'Climate intelligence for resilient African supply chains.',
            'spotlight_summary' => 'We help logistics teams forecast disruption, improve routing, and cut costly delivery delays.',
        ])
        ->assertRedirect();

    $profile->refresh();

    expect($profile->spotlight_one_liner)->toBe('Climate intelligence for resilient African supply chains.')
        ->and($profile->spotlight_summary)->toBe('We help logistics teams forecast disruption, improve routing, and cut costly delivery delays.')
        ->and(AuditLog::query()->where('event', 'founder.spotlight_updated')->where('auditable_id', $profile->id)->exists())->toBeTrue();
});

test('Spotlight content respects the agreed limits', function () {
    $founder = Founder::factory()->create();
    spotlightProfile($founder);

    $response = $this->actingAs($founder, 'founder')
        ->from(route('founder.spotlight.edit'))
        ->patch(route('founder.spotlight.update'), [
            'spotlight_one_liner' => str_repeat('a', 121),
            'spotlight_summary' => str_repeat('b', 501),
        ]);

    $response->assertRedirect(route('founder.spotlight.edit'))
        ->assertSessionHasErrors(['spotlight_one_liner', 'spotlight_summary']);
});

test('the founder dashboard exposes the current Spotlight feature status', function () {
    $founder = Founder::factory()->create();
    spotlightProfile($founder, ['is_featured_in_spotlight' => true]);

    $response = $this->actingAs($founder, 'founder')->get(route('founder.dashboard'));

    $response->assertOk();

    expect($response->viewData('page')['props']['spotlight_featured'])->toBeTrue();
});

test('compliance cannot manage Spotlight publishing', function () {
    $compliance = User::factory()->create(['role' => 'compliance']);
    $founder = Founder::factory()->create();
    $profile = spotlightProfile($founder, [
        'spotlight_one_liner' => 'A ready startup.',
        'spotlight_summary' => 'A completed summary.',
        'is_public' => true,
        'verified_at' => now(),
    ]);

    $this->actingAs($compliance)
        ->patch(route('admin.spotlight.update', $profile), ['publish' => true])
        ->assertForbidden();
});

test('investor relations can correct Spotlight content and the edit is audited', function () {
    $investorRelations = User::factory()->create(['role' => 'investor_relations']);
    $founder = Founder::factory()->create();
    $profile = spotlightProfile($founder, [
        'spotlight_one_liner' => 'Original founder copy.',
        'spotlight_summary' => 'Original founder summary.',
    ]);

    $this->actingAs($investorRelations)
        ->patch(route('admin.spotlight.update', $profile), [
            'spotlight_one_liner' => 'Edited for investor clarity.',
            'spotlight_summary' => 'A clearer summary, approved by Investor Relations.',
        ])
        ->assertRedirect();

    $profile->refresh();

    expect($profile->spotlight_one_liner)->toBe('Edited for investor clarity.')
        ->and($profile->spotlight_summary)->toBe('A clearer summary, approved by Investor Relations.')
        ->and(AuditLog::query()->where('event', 'spotlight.content_updated')->where('auditable_id', $profile->id)->exists())->toBeTrue();
});

test('document categories receive the correct investor visibility tier by default', function () {
    Storage::fake('local');
    $founder = Founder::factory()->create();
    $documents = app(DocumentService::class);

    $pitchDeck = $documents->store(
        UploadedFile::fake()->create('pitch-deck.pdf', 200, 'application/pdf'),
        $founder,
        'pitch_deck',
    );
    $financialForecast = $documents->store(
        UploadedFile::fake()->create('forecast.pdf', 200, 'application/pdf'),
        $founder,
        'financial_forecast',
    );

    expect($pitchDeck->visibility)->toBe('spotlight')
        ->and($financialForecast->visibility)->toBe('data_room');
});

test('a reviewed pitch deck is required before an investor relations user can publish Spotlight', function () {
    $investorRelations = User::factory()->create(['role' => 'investor_relations']);
    $founder = Founder::factory()->create();
    $profile = spotlightProfile($founder, [
        'spotlight_one_liner' => 'A ready startup.',
        'spotlight_summary' => 'A completed summary.',
        'is_public' => true,
        'verified_at' => now(),
    ]);

    $this->actingAs($investorRelations)
        ->patch(route('admin.spotlight.update', $profile), ['publish' => true])
        ->assertStatus(422);
});
