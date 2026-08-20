<?php

use App\Models\Investor;
use App\Models\InvestorKycSubmission;
use App\Models\InvestorProfile;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Support\Facades\Storage;

function investorForKycSubmission(array $attributes = []): Investor
{
    $investor = Investor::factory()->create($attributes);

    InvestorProfile::factory()->for($investor)->create();

    return $investor;
}

test('an investor can submit one encrypted KYC document for review', function () {
    Storage::fake('local');
    $investor = investorForKycSubmission();
    $document = UploadedFile::fake()->create('valid-id.pdf', 200, 'application/pdf');

    $response = $this->actingAs($investor, 'investor')
        ->post(route('investor.kyc.store'), ['document' => $document]);

    $response->assertSessionHas('success');

    $submission = InvestorKycSubmission::firstOrFail();

    expect($investor->fresh()->kyc_status)->toBe(Investor::KYC_STATUS_PENDING)
        ->and($submission->document_type)->toBe('valid_id')
        ->and($submission->status)->toBe(InvestorKycSubmission::STATUS_PENDING)
        ->and(Storage::disk('local')->exists($submission->storage_path))->toBeTrue()
        ->and(Crypt::decryptString(Storage::disk('local')->get($submission->storage_path)))->toBe(file_get_contents($document->getRealPath()));

    $this->assertDatabaseHas('audit_logs', [
        'event' => 'investor.kyc_submitted',
        'auditable_type' => InvestorKycSubmission::class,
        'auditable_id' => $submission->id,
    ]);
});

test('an investor cannot submit another KYC document while one is pending', function () {
    Storage::fake('local');
    $investor = investorForKycSubmission(['kyc_status' => Investor::KYC_STATUS_PENDING]);
    InvestorKycSubmission::create([
        'investor_id' => $investor->id,
        'document_type' => 'valid_id',
        'storage_path' => 'investor-kyc/pending.enc',
        'original_name' => 'pending.pdf',
        'mime_type' => 'application/pdf',
        'size_bytes' => 100,
    ]);

    $response = $this->actingAs($investor, 'investor')
        ->from(route('investor.kyc.create'))
        ->post(route('investor.kyc.store'), ['document' => UploadedFile::fake()->create('replacement.pdf', 200, 'application/pdf')]);

    $response->assertRedirect(route('investor.kyc.create'))
        ->assertSessionHasErrors('document');

    expect(InvestorKycSubmission::count())->toBe(1);
});

test('a replacement submission returns an approved investor to KYC review', function () {
    Storage::fake('local');
    $investor = investorForKycSubmission([
        'kyc_status' => Investor::KYC_STATUS_APPROVED,
        'kyc_approved_at' => now(),
    ]);
    InvestorKycSubmission::create([
        'investor_id' => $investor->id,
        'document_type' => 'valid_id',
        'storage_path' => 'investor-kyc/approved.enc',
        'original_name' => 'approved.pdf',
        'mime_type' => 'application/pdf',
        'size_bytes' => 100,
        'status' => InvestorKycSubmission::STATUS_APPROVED,
    ]);

    $response = $this->actingAs($investor, 'investor')
        ->post(route('investor.kyc.store'), ['document' => UploadedFile::fake()->create('replacement.pdf', 200, 'application/pdf')]);

    $response->assertSessionHas('success');

    expect($investor->fresh()->kyc_status)->toBe(Investor::KYC_STATUS_PENDING)
        ->and($investor->fresh()->kyc_approved_at)->toBeNull()
        ->and(InvestorKycSubmission::count())->toBe(2);

    $this->assertDatabaseHas('audit_logs', ['event' => 'investor.kyc_resubmitted']);
});
