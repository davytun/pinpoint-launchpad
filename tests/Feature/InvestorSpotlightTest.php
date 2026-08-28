<?php

use App\Models\AuditLog;
use App\Models\Founder;
use App\Models\FounderDocument;
use App\Models\FounderProfile;
use App\Models\Investor;
use App\Models\SpotlightEntry;
use App\Models\User;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\URL;

function investorSpotlightEntry(array $attributes = []): array
{
    $founder = Founder::factory()->create();
    $profile = FounderProfile::create(array_merge([
        'founder_id' => $founder->id,
        'slug' => "{$founder->id}-investor-spotlight",
        'is_public' => true,
        'verified_at' => now(),
        'spotlight_one_liner' => 'Clear software for better infrastructure decisions.',
        'spotlight_summary' => 'A prepared company summary for investor review.',
        'radar_data' => ['potential' => 80, 'agility' => 75, 'risk' => 70, 'alignment' => 85, 'governance' => 78, 'operations' => 72, 'network' => 68],
    ], $attributes));
    $entry = SpotlightEntry::create(['profile_id' => $profile->id, 'published_at' => now()]);

    return [$founder, $profile, $entry];
}

function investorSpotlightDocument(Founder $founder, array $attributes = []): FounderDocument
{
    Storage::disk('local')->put("founder-documents/{$founder->id}/pitch-deck.pdf", 'Pitch deck contents');

    return FounderDocument::create(array_merge([
        'founder_id' => $founder->id,
        'category' => 'pitch_deck',
        'visibility' => 'spotlight',
        'original_filename' => 'pitch-deck.pdf',
        'stored_filename' => 'pitch-deck.pdf',
        'file_path' => "founder-documents/{$founder->id}/pitch-deck.pdf",
        'file_size' => 20,
        'mime_type' => 'application/pdf',
        'extension' => 'pdf',
        'is_reviewed' => true,
    ], $attributes));
}

function temporarySpotlightDocumentUrl(string $routeName, FounderProfile $profile): string
{
    return URL::temporarySignedRoute($routeName, now()->addMinutes(10), ['slug' => $profile->slug]);
}

test('only KYC-approved investors can access the Spotlight index and show pages', function () {
    [$founder, $profile] = investorSpotlightEntry();
    $pendingInvestor = Investor::factory()->create(['kyc_status' => Investor::KYC_STATUS_PENDING]);
    $notSubmittedInvestor = Investor::factory()->create(['kyc_status' => Investor::KYC_STATUS_NOT_SUBMITTED]);
    $rejectedInvestor = Investor::factory()->create(['kyc_status' => Investor::KYC_STATUS_REJECTED]);
    $approvedInvestor = Investor::factory()->create(['kyc_status' => Investor::KYC_STATUS_APPROVED]);

    // Unapproved states are redirected to /investor/kyc
    $this->actingAs($pendingInvestor, 'investor')->get(route('investor.spotlight.index'))->assertRedirect(route('investor.kyc.create'));
    $this->actingAs($pendingInvestor, 'investor')->get(route('investor.spotlight.show', $profile->slug))->assertRedirect(route('investor.kyc.create'));

    $this->actingAs($notSubmittedInvestor, 'investor')->get(route('investor.spotlight.index'))->assertRedirect(route('investor.kyc.create'));
    $this->actingAs($rejectedInvestor, 'investor')->get(route('investor.spotlight.index'))->assertRedirect(route('investor.kyc.create'));

    // Approved investor can access Spotlight index and show pages
    $this->actingAs($approvedInvestor, 'investor')
        ->get(route('investor.spotlight.index'))
        ->assertOk();

    $this->actingAs($approvedInvestor, 'investor')
        ->get(route('investor.spotlight.show', $profile->slug))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('Investor/Spotlight/Show')
            ->where('entry.slug', $profile->slug));
});

test('only KYC-approved investors can preview a reviewed published PDF pitch deck and the preview is audited', function () {
    Storage::fake('local');
    [$founder, $profile] = investorSpotlightEntry();
    $document = investorSpotlightDocument($founder);
    $approvedInvestor = Investor::factory()->create(['kyc_status' => Investor::KYC_STATUS_APPROVED]);
    $pendingInvestor = Investor::factory()->create(['kyc_status' => Investor::KYC_STATUS_PENDING]);

    $this->actingAs($pendingInvestor, 'investor')
        ->get(temporarySpotlightDocumentUrl('investor.spotlight.pitch-deck.preview', $profile))
        ->assertRedirect(route('investor.kyc.create'));

    $this->actingAs($approvedInvestor, 'investor')
        ->get(temporarySpotlightDocumentUrl('investor.spotlight.pitch-deck.preview', $profile))
        ->assertOk()
        ->assertHeader('content-type', 'application/pdf')
        ->assertHeader('content-disposition', 'inline; filename=pitch-deck.pdf')
        ->assertHeader('cache-control', 'max-age=0, no-store, private')
        ->assertStreamedContent('Pitch deck contents');

    $this->actingAs($approvedInvestor, 'investor')
        ->get(temporarySpotlightDocumentUrl('investor.spotlight.pitch-deck', $profile))
        ->assertOk()
        ->assertHeader('content-disposition', 'attachment; filename=pitch-deck.pdf')
        ->assertStreamedContent('Pitch deck contents');

    $this->assertDatabaseHas('audit_logs', [
        'event' => 'spotlight.pitch_deck_previewed',
        'actor_type' => Investor::class,
        'actor_id' => $approvedInvestor->id,
        'auditable_type' => FounderDocument::class,
        'auditable_id' => $document->id,
    ]);
    $this->assertDatabaseHas('audit_logs', [
        'event' => 'spotlight.pitch_deck_downloaded',
        'actor_type' => Investor::class,
        'actor_id' => $approvedInvestor->id,
        'auditable_type' => FounderDocument::class,
        'auditable_id' => $document->id,
    ]);
});

test('unreviewed or non-spotlight documents cannot be previewed by URL access', function () {
    Storage::fake('local');
    [$founder, $profile] = investorSpotlightEntry();
    investorSpotlightDocument($founder, ['is_reviewed' => false]);
    $investor = Investor::factory()->create(['kyc_status' => Investor::KYC_STATUS_APPROVED]);

    $this->actingAs($investor, 'investor')
        ->get(temporarySpotlightDocumentUrl('investor.spotlight.pitch-deck.preview', $profile))
        ->assertNotFound();

    expect(AuditLog::query()->where('event', 'spotlight.pitch_deck_previewed')->exists())->toBeFalse();
});

test('Spotlight document links must be signed and expire after ten minutes', function () {
    Storage::fake('local');
    [$founder, $profile] = investorSpotlightEntry();
    investorSpotlightDocument($founder);
    $investor = Investor::factory()->create(['kyc_status' => Investor::KYC_STATUS_APPROVED]);

    $this->actingAs($investor, 'investor')
        ->get(route('investor.spotlight.pitch-deck.preview', $profile->slug))
        ->assertForbidden();

    $url = temporarySpotlightDocumentUrl('investor.spotlight.pitch-deck.preview', $profile);

    $this->travel(11)->minutes();

    $this->actingAs($investor, 'investor')
        ->get($url)
        ->assertForbidden();
});

test('only investor relations and superadmins can publish eligible Spotlight profiles', function () {
    Storage::fake('local');
    [$founder, $profile, $entry] = investorSpotlightEntry();
    $entry->update(['published_at' => null]);
    investorSpotlightDocument($founder);
    $support = User::factory()->create(['role' => 'support']);
    $investorRelations = User::factory()->create(['role' => 'investor_relations']);

    $this->actingAs($support)
        ->patch(route('admin.spotlight.update', $profile), ['publish' => true])
        ->assertForbidden();

    $this->actingAs($investorRelations)
        ->patch(route('admin.spotlight.update', $profile), ['publish' => true])
        ->assertRedirect();

    expect($profile->fresh()->is_featured_in_spotlight)->toBeTrue()
        ->and($entry->fresh()->published_at)->not->toBeNull();
});
