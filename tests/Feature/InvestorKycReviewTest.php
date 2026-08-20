<?php

use App\Models\Investor;
use App\Models\InvestorKycSubmission;
use App\Models\InvestorProfile;
use App\Models\User;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Support\Facades\Storage;

function pendingKycSubmissionForReview(): InvestorKycSubmission
{
    $investor = Investor::factory()->create(['kyc_status' => Investor::KYC_STATUS_PENDING]);
    InvestorProfile::factory()->for($investor)->create();

    return InvestorKycSubmission::create([
        'investor_id' => $investor->id,
        'document_type' => 'valid_id',
        'storage_path' => "investor-kyc/{$investor->id}/identity.enc",
        'original_name' => 'identity.pdf',
        'mime_type' => 'application/pdf',
        'size_bytes' => 100,
    ]);
}

test('a compliance officer can approve a pending KYC submission', function () {
    $compliance = User::factory()->create(['role' => 'compliance']);
    $submission = pendingKycSubmissionForReview();

    $response = $this->actingAs($compliance)
        ->patch(route('admin.investor-kyc.review', $submission), [
            'status' => InvestorKycSubmission::STATUS_APPROVED,
            'review_notes' => 'Identity verified.',
        ]);

    $response->assertSessionHas('success');

    expect($submission->fresh()->status)->toBe(InvestorKycSubmission::STATUS_APPROVED)
        ->and($submission->fresh()->reviewed_by)->toBe($compliance->id)
        ->and($submission->fresh()->review_notes)->toBe('Identity verified.')
        ->and($submission->investor->fresh()->kyc_status)->toBe(Investor::KYC_STATUS_APPROVED)
        ->and($submission->investor->fresh()->kyc_approved_at)->not->toBeNull();

    $this->assertDatabaseHas('audit_logs', [
        'event' => 'investor.kyc_approved',
        'actor_type' => User::class,
        'actor_id' => $compliance->id,
        'auditable_type' => InvestorKycSubmission::class,
        'auditable_id' => $submission->id,
    ]);
});

test('a support user cannot review investor KYC submissions', function () {
    $support = User::factory()->create(['role' => 'support']);
    $submission = pendingKycSubmissionForReview();

    $this->actingAs($support)
        ->patch(route('admin.investor-kyc.review', $submission), ['status' => InvestorKycSubmission::STATUS_APPROVED])
        ->assertForbidden();

    expect($submission->fresh()->isPending())->toBeTrue()
        ->and($submission->investor->fresh()->kyc_status)->toBe(Investor::KYC_STATUS_PENDING);
});

test('a reviewed KYC submission cannot receive a second decision', function () {
    $superAdmin = User::factory()->create(['role' => 'superadmin']);
    $submission = pendingKycSubmissionForReview();

    $this->actingAs($superAdmin)
        ->patch(route('admin.investor-kyc.review', $submission), ['status' => InvestorKycSubmission::STATUS_APPROVED])
        ->assertSessionHas('success');

    $this->actingAs($superAdmin)
        ->patch(route('admin.investor-kyc.review', $submission), ['status' => InvestorKycSubmission::STATUS_REJECTED])
        ->assertSessionHasErrors('status');

    expect($submission->fresh()->status)->toBe(InvestorKycSubmission::STATUS_APPROVED)
        ->and($submission->investor->fresh()->kyc_status)->toBe(Investor::KYC_STATUS_APPROVED);

    expect($this->app->make('db')->table('audit_logs')->where('auditable_id', $submission->id)->count())->toBe(1);
});

test('a compliance officer can download an encrypted KYC document', function () {
    Storage::fake('local');
    $compliance = User::factory()->create(['role' => 'compliance']);
    $submission = pendingKycSubmissionForReview();
    Storage::disk('local')->put($submission->storage_path, Crypt::encryptString('verified KYC contents'));

    $this->actingAs($compliance)
        ->get(route('admin.investor-kyc.download', $submission))
        ->assertOk()
        ->assertHeader('content-type', 'application/pdf')
        ->assertHeader('content-disposition', 'attachment; filename="identity.pdf"')
        ->assertSee('verified KYC contents');

    $this->assertDatabaseHas('audit_logs', [
        'event' => 'investor.kyc_downloaded',
        'actor_id' => $compliance->id,
        'auditable_id' => $submission->id,
    ]);
});
