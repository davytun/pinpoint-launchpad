<?php

use App\Models\AuditLog;
use App\Models\Investor;
use App\Models\InvestorKycSubmission;
use App\Models\InvestorProfile;
use App\Models\User;
use App\Notifications\InvestorJoinedNotification;
use App\Notifications\InvestorKycReviewedNotification;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\Storage;

test('investor registers successfully with a complete profile and initial not_submitted KYC status', function () {
    Notification::fake();

    $existingInvestor = Investor::factory()->create(['account_status' => Investor::ACCOUNT_STATUS_ACTIVE]);

    $payload = [
        'investor_type' => 'individual',
        'full_name' => 'Sarah Connor',
        'email' => 'sarah.connor@example.com',
        'phone' => '+1234567890',
        'address' => '100 SkyNet Way, Los Angeles, CA',
        'password' => 'SecurePass123!',
        'password_confirmation' => 'SecurePass123!',
        'terms_agreed' => true,
        'aml_confirmed' => true,
    ];

    $response = $this->post(route('investor.onboarding.store'), $payload);

    $response->assertRedirect(route('investor.dashboard'));
    $response->assertSessionHas('success');

    $investor = Investor::where('email', 'sarah.connor@example.com')->first();
    expect($investor)->not->toBeNull()
        ->and($investor->account_status)->toBe(Investor::ACCOUNT_STATUS_ACTIVE)
        ->and($investor->kyc_status)->toBe(Investor::KYC_STATUS_NOT_SUBMITTED)
        ->and($investor->kyc_approved_at)->toBeNull()
        ->and($investor->terms_accepted_at)->not->toBeNull()
        ->and($investor->aml_confirmed_at)->not->toBeNull()
        ->and(Auth::guard('investor')->check())->toBeTrue()
        ->and(Auth::guard('investor')->id())->toBe($investor->id);

    $profile = $investor->profile;
    expect($profile)->not->toBeNull()
        ->and($profile->investor_type)->toBe('individual')
        ->and($profile->full_name)->toBe('Sarah Connor')
        ->and($profile->phone)->toBe('+1234567890')
        ->and($profile->address)->toBe('100 SkyNet Way, Los Angeles, CA');

    $this->assertDatabaseHas('audit_logs', [
        'event' => 'investor.onboarding_submitted',
        'actor_type' => Investor::class,
        'actor_id' => $investor->id,
        'auditable_type' => Investor::class,
        'auditable_id' => $investor->id,
    ]);

    Notification::assertSentTo($existingInvestor, InvestorJoinedNotification::class);
});

test('corporate investor registers successfully with company name', function () {
    Notification::fake();

    $payload = [
        'investor_type' => 'corporate',
        'full_name' => 'John Apex',
        'company_name' => 'Apex Ventures LLC',
        'email' => 'john@apexventures.com',
        'phone' => '+442079460999',
        'address' => '10 City Road, London, UK',
        'password' => 'Capital123!@#',
        'password_confirmation' => 'Capital123!@#',
        'terms_agreed' => true,
        'aml_confirmed' => true,
    ];

    $response = $this->post(route('investor.onboarding.store'), $payload);

    $response->assertRedirect(route('investor.dashboard'));

    $investor = Investor::where('email', 'john@apexventures.com')->first();
    expect($investor)->not->toBeNull()
        ->and($investor->profile->company_name)->toBe('Apex Ventures LLC')
        ->and($investor->profile->investor_type)->toBe('corporate');
});

test('duplicate email is blocked during investor registration', function () {
    Investor::factory()->create(['email' => 'duplicate@example.com']);

    $payload = [
        'investor_type' => 'individual',
        'full_name' => 'Duplicate User',
        'email' => 'duplicate@example.com',
        'phone' => '+1234567890',
        'address' => 'Some address',
        'password' => 'Password123!',
        'password_confirmation' => 'Password123!',
        'terms_agreed' => true,
        'aml_confirmed' => true,
    ];

    $response = $this->post(route('investor.onboarding.store'), $payload);

    $response->assertSessionHasErrors('email');
    expect(Investor::where('email', 'duplicate@example.com')->count())->toBe(1);
});

test('investor submits KYC document and status transitions from not_submitted to pending', function () {
    Storage::fake('local');

    $investor = Investor::factory()->create(['kyc_status' => Investor::KYC_STATUS_NOT_SUBMITTED]);
    InvestorProfile::factory()->for($investor)->create(['investor_type' => 'individual']);

    $file = UploadedFile::fake()->create('passport.pdf', 500, 'application/pdf');

    $response = $this->actingAs($investor, 'investor')
        ->post(route('investor.kyc.store'), ['document' => $file]);

    $response->assertSessionHas('success');

    $investor->refresh();
    expect($investor->kyc_status)->toBe(Investor::KYC_STATUS_PENDING)
        ->and($investor->kyc_approved_at)->toBeNull();

    $submission = $investor->latestKycSubmission;
    expect($submission)->not->toBeNull()
        ->and($submission->status)->toBe(InvestorKycSubmission::STATUS_PENDING)
        ->and($submission->document_type)->toBe('valid_id')
        ->and($submission->original_name)->toBe('passport.pdf')
        ->and(Storage::disk('local')->exists($submission->storage_path))->toBeTrue()
        ->and(Crypt::decryptString(Storage::disk('local')->get($submission->storage_path)))->toBe(file_get_contents($file->getRealPath()));

    $this->assertDatabaseHas('audit_logs', [
        'event' => 'investor.kyc_submitted',
        'actor_type' => Investor::class,
        'actor_id' => $investor->id,
        'auditable_type' => InvestorKycSubmission::class,
        'auditable_id' => $submission->id,
    ]);
});

test('compliance reviews and approves pending KYC transitioning status to approved', function () {
    Notification::fake();
    Storage::fake('local');

    $compliance = User::factory()->create(['role' => 'compliance']);
    $investor = Investor::factory()->create(['kyc_status' => Investor::KYC_STATUS_PENDING]);
    InvestorProfile::factory()->for($investor)->create();

    $submission = InvestorKycSubmission::create([
        'investor_id' => $investor->id,
        'document_type' => 'valid_id',
        'storage_path' => "investor-kyc/{$investor->id}/id.enc",
        'original_name' => 'national_id.pdf',
        'mime_type' => 'application/pdf',
        'size_bytes' => 1024,
        'status' => InvestorKycSubmission::STATUS_PENDING,
    ]);
    Storage::disk('local')->put($submission->storage_path, Crypt::encryptString('doc contents'));

    $response = $this->actingAs($compliance)
        ->patch(route('admin.investor-kyc.review', $submission), [
            'status' => InvestorKycSubmission::STATUS_APPROVED,
            'review_notes' => 'Document is clear and fully verified.',
        ]);

    $response->assertSessionHas('success');

    $investor->refresh();
    $submission->refresh();

    expect($investor->kyc_status)->toBe(Investor::KYC_STATUS_APPROVED)
        ->and($investor->kyc_approved_at)->not->toBeNull()
        ->and($investor->hasApprovedKyc())->toBeTrue()
        ->and($investor->canAccessProtectedInvestorContent())->toBeTrue()
        ->and($submission->status)->toBe(InvestorKycSubmission::STATUS_APPROVED)
        ->and($submission->reviewed_by)->toBe($compliance->id)
        ->and($submission->reviewed_at)->not->toBeNull()
        ->and($submission->review_notes)->toBe('Document is clear and fully verified.');

    Notification::assertSentTo($investor, InvestorKycReviewedNotification::class, function ($notification) {
        return $notification->status === 'approved';
    });

    $this->assertDatabaseHas('audit_logs', [
        'event' => 'investor.kyc_approved',
        'actor_type' => User::class,
        'actor_id' => $compliance->id,
        'auditable_type' => InvestorKycSubmission::class,
        'auditable_id' => $submission->id,
    ]);
});

test('compliance reviews and rejects KYC with a mandatory review note', function () {
    Notification::fake();
    Storage::fake('local');

    $compliance = User::factory()->create(['role' => 'compliance']);
    $investor = Investor::factory()->create(['kyc_status' => Investor::KYC_STATUS_PENDING]);
    InvestorProfile::factory()->for($investor)->create();

    $submission = InvestorKycSubmission::create([
        'investor_id' => $investor->id,
        'document_type' => 'valid_id',
        'storage_path' => "investor-kyc/{$investor->id}/id.enc",
        'original_name' => 'blurry_id.jpg',
        'mime_type' => 'image/jpeg',
        'size_bytes' => 2048,
        'status' => InvestorKycSubmission::STATUS_PENDING,
    ]);
    Storage::disk('local')->put($submission->storage_path, Crypt::encryptString('image contents'));

    // Attempt rejection without note -> should fail validation
    $response = $this->actingAs($compliance)
        ->patch(route('admin.investor-kyc.review', $submission), [
            'status' => InvestorKycSubmission::STATUS_REJECTED,
        ]);
    $response->assertSessionHasErrors('review_notes');

    // Rejection with note -> should succeed
    $response = $this->actingAs($compliance)
        ->patch(route('admin.investor-kyc.review', $submission), [
            'status' => InvestorKycSubmission::STATUS_REJECTED,
            'review_notes' => 'Image was too blurry to read full name and expiration date.',
        ]);

    $response->assertSessionHas('success');

    $investor->refresh();
    $submission->refresh();

    expect($investor->kyc_status)->toBe(Investor::KYC_STATUS_REJECTED)
        ->and($investor->kyc_approved_at)->toBeNull()
        ->and($investor->needsKycSubmission())->toBeTrue()
        ->and($submission->status)->toBe(InvestorKycSubmission::STATUS_REJECTED)
        ->and($submission->review_notes)->toBe('Image was too blurry to read full name and expiration date.');

    Notification::assertSentTo($investor, InvestorKycReviewedNotification::class, function ($notification) {
        return $notification->status === 'rejected' && str_contains($notification->reviewNotes, 'blurry');
    });
});

test('rejected investor can still login, view rejection reason, and resubmit a replacement document', function () {
    Storage::fake('local');

    $investor = Investor::factory()->create([
        'email' => 'rejected.investor@example.com',
        'password' => bcrypt('ValidPassword123!'),
        'account_status' => Investor::ACCOUNT_STATUS_ACTIVE,
        'kyc_status' => Investor::KYC_STATUS_REJECTED,
    ]);
    InvestorProfile::factory()->for($investor)->create(['investor_type' => 'individual']);

    $firstSubmission = InvestorKycSubmission::create([
        'investor_id' => $investor->id,
        'document_type' => 'valid_id',
        'storage_path' => "investor-kyc/{$investor->id}/first.enc",
        'original_name' => 'first_attempt.pdf',
        'mime_type' => 'application/pdf',
        'size_bytes' => 1000,
        'status' => InvestorKycSubmission::STATUS_REJECTED,
        'review_notes' => 'Document expired on 2025-01-01.',
        'reviewed_at' => now()->subDay(),
    ]);

    // 1. Rejected investor logs in successfully
    $loginResponse = $this->post(route('investor.login.store'), [
        'email' => 'rejected.investor@example.com',
        'password' => 'ValidPassword123!',
    ]);
    $loginResponse->assertRedirect(route('investor.dashboard'));
    expect(Auth::guard('investor')->check())->toBeTrue();

    // 2. Rejected investor visits KYC page to view rejection details
    $kycPageResponse = $this->actingAs($investor, 'investor')->get(route('investor.kyc.create'));
    $kycPageResponse->assertOk();

    // 3. Rejected investor uploads replacement document
    $replacementFile = UploadedFile::fake()->create('valid_unexpired_passport.pdf', 800, 'application/pdf');
    $submitResponse = $this->actingAs($investor, 'investor')
        ->post(route('investor.kyc.store'), ['document' => $replacementFile]);

    $submitResponse->assertSessionHas('success');

    // 4. Status returns to pending
    $investor->refresh();
    expect($investor->kyc_status)->toBe(Investor::KYC_STATUS_PENDING)
        ->and($investor->hasPendingKyc())->toBeTrue();

    // 5. Check that history is preserved and both submissions belong to the same investor
    expect($investor->kycSubmissions()->count())->toBe(2)
        ->and(Investor::where('email', 'rejected.investor@example.com')->count())->toBe(1);

    $latestSubmission = $investor->latestKycSubmission;
    expect($latestSubmission->id)->not->toBe($firstSubmission->id)
        ->and($latestSubmission->status)->toBe(InvestorKycSubmission::STATUS_PENDING)
        ->and($latestSubmission->original_name)->toBe('valid_unexpired_passport.pdf');

    $this->assertDatabaseHas('audit_logs', [
        'event' => 'investor.kyc_resubmitted',
        'actor_id' => $investor->id,
        'auditable_id' => $latestSubmission->id,
    ]);
});

test('confidential KYC documents cannot be downloaded or previewed by unauthorized users', function () {
    Storage::fake('local');

    $investor = Investor::factory()->create();
    InvestorProfile::factory()->for($investor)->create();
    $submission = InvestorKycSubmission::create([
        'investor_id' => $investor->id,
        'document_type' => 'valid_id',
        'storage_path' => "investor-kyc/{$investor->id}/confidential.enc",
        'original_name' => 'confidential_id.pdf',
        'mime_type' => 'application/pdf',
        'size_bytes' => 1024,
    ]);
    Storage::disk('local')->put($submission->storage_path, Crypt::encryptString('top secret identity data'));

    // Guest -> Redirected to admin login (302)
    $this->get(route('admin.investor-kyc.preview', $submission))->assertRedirect(route('admin.login'));
    $this->get(route('admin.investor-kyc.download', $submission))->assertRedirect(route('admin.login'));

    // Logged-in Investor -> 403 Forbidden
    $this->actingAs($investor, 'investor')->get(route('admin.investor-kyc.preview', $submission))->assertForbidden();

    // Unauthorized Staff (Support or Analyst role) -> 403 Forbidden
    $analyst = User::factory()->create(['role' => 'analyst']);
    $this->actingAs($analyst)->get(route('admin.investor-kyc.preview', $submission))->assertForbidden();
    $this->actingAs($analyst)->get(route('admin.investor-kyc.download', $submission))->assertForbidden();

    $support = User::factory()->create(['role' => 'support']);
    $this->actingAs($support)->get(route('admin.investor-kyc.preview', $submission))->assertForbidden();

    // Authorized Staff (Compliance) -> 200 OK
    $compliance = User::factory()->create(['role' => 'compliance']);
    $this->actingAs($compliance)->get(route('admin.investor-kyc.preview', $submission))->assertOk();
    $this->actingAs($compliance)->get(route('admin.investor-kyc.download', $submission))->assertOk();

    // Authorized Staff (Superadmin) -> 200 OK
    $superadmin = User::factory()->create(['role' => 'superadmin']);
    $this->actingAs($superadmin)->get(route('admin.investor-kyc.preview', $submission))->assertOk();
    $this->actingAs($superadmin)->get(route('admin.investor-kyc.download', $submission))->assertOk();
});
