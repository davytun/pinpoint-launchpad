<?php

use App\Models\Founder;
use App\Models\FounderDocument;
use App\Models\FounderProfile;
use App\Models\Investor;
use App\Models\InvestorDataRoomGrant;
use App\Models\InvestorInterest;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\URL;

function phaseFiveProfile(): array
{
    $founder = Founder::factory()->create();
    $profile = FounderProfile::create([
        'founder_id' => $founder->id,
        'slug' => "phase-five-{$founder->id}",
        'is_public' => true,
    ]);

    return [$founder, $profile];
}

test('only an approved data room request creates a grant after founder and admin review', function () {
    [$founder, $profile] = phaseFiveProfile();
    $admin = \App\Models\User::factory()->create(['role' => 'investor_relations']);
    $investor = Investor::factory()->create(['kyc_status' => Investor::KYC_STATUS_APPROVED]);
    $interest = InvestorInterest::create([
        'investor_id' => $investor->id,
        'profile_id' => $profile->id,
        'type' => 'more_details',
    ]);

    $this->actingAs($founder, 'founder')
        ->patch(route('founder.access-requests.status', $interest), ['status' => 'approved'])
        ->assertRedirect();

    expect($interest->fresh()->founder_decision)->toBe('approved')
        ->and($interest->fresh()->status)->toBe('pending')
        ->and(InvestorDataRoomGrant::query()->where('investor_id', $investor->id)->exists())->toBeFalse();

    $dataRoomInvestor = Investor::factory()->create(['kyc_status' => Investor::KYC_STATUS_APPROVED]);
    $dataRoomInterest = InvestorInterest::create([
        'investor_id' => $dataRoomInvestor->id,
        'profile_id' => $profile->id,
        'type' => 'data_room_access',
    ]);

    $this->actingAs($founder, 'founder')
        ->patch(route('founder.access-requests.status', $dataRoomInterest), ['status' => 'approved'])
        ->assertRedirect();

    expect($dataRoomInterest->fresh()->founder_decision)->toBe('approved')
        ->and(InvestorDataRoomGrant::query()->where('investor_id', $dataRoomInvestor->id)->exists())->toBeFalse();

    $this->actingAs($admin)
        ->patch(route('admin.dealflow.interests.update', $dataRoomInterest), ['status' => 'approved'])
        ->assertRedirect();

    $this->assertDatabaseHas('investor_data_room_grants', [
        'investor_id' => $dataRoomInvestor->id,
        'profile_id' => $profile->id,
        'granted_by_founder' => $founder->id,
        'revoked_at' => null,
    ]);
    $this->assertDatabaseHas('audit_logs', ['event' => 'data_room.granted_by_admin']);
});

test('a founder cannot decide another startup’s investor interest', function () {
    [$founder, $profile] = phaseFiveProfile();
    $otherFounder = Founder::factory()->create();
    $investor = Investor::factory()->create(['kyc_status' => Investor::KYC_STATUS_APPROVED]);
    $interest = InvestorInterest::create([
        'investor_id' => $investor->id,
        'profile_id' => $profile->id,
        'type' => 'data_room_access',
    ]);

    $this->actingAs($otherFounder, 'founder')
        ->patch(route('founder.access-requests.status', $interest), ['status' => 'approved'])
        ->assertForbidden();

    expect($interest->fresh()->status)->toBe('pending');
});

test('a signed data room download is blocked as soon as its grant is revoked', function () {
    Storage::fake('local');
    [$founder, $profile] = phaseFiveProfile();
    $investor = Investor::factory()->create(['kyc_status' => Investor::KYC_STATUS_APPROVED]);
    $grant = InvestorDataRoomGrant::create([
        'investor_id' => $investor->id,
        'profile_id' => $profile->id,
        'granted_by_founder' => $founder->id,
        'granted_at' => now(),
    ]);
    Storage::disk('local')->put("founder-documents/{$founder->id}/forecast.pdf", 'Forecast contents');
    $document = FounderDocument::create([
        'founder_id' => $founder->id,
        'category' => 'financial_forecast',
        'visibility' => 'data_room',
        'original_filename' => 'forecast.pdf',
        'stored_filename' => 'forecast.pdf',
        'file_path' => "founder-documents/{$founder->id}/forecast.pdf",
        'file_size' => 17,
        'mime_type' => 'application/pdf',
        'extension' => 'pdf',
        'is_reviewed' => true,
    ]);
    $url = URL::temporarySignedRoute('investor.data-rooms.download', now()->addMinutes(10), ['slug' => $profile->slug, 'document' => $document->id]);

    $this->actingAs($investor, 'investor')->get($url)->assertOk()->assertStreamedContent('Forecast contents');

    $grant->update(['revoked_at' => now()]);

    $this->actingAs($investor, 'investor')->get($url)->assertNotFound();
});
