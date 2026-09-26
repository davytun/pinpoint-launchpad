<?php

use App\Models\Payment;
use App\Models\PiaApplication;
use App\Models\User;

function assessmentApplication(array $overrides = []): PiaApplication
{
    return PiaApplication::create(array_merge([
        'name' => 'Ada Founder',
        'email' => 'ada@startup.test',
        'company' => 'Startup Co',
        'country' => 'Nigeria',
        'stage' => 'seed',
        'raise_target' => '$100k-$500k',
        'message' => 'We are raising this quarter.',
        'source' => 'assessment_page',
        'status' => 'pending',
    ], $overrides));
}

test('assessment applications stay off the payment requests list', function () {
    $admin = User::factory()->create(['role' => 'superadmin']);

    assessmentApplication();
    PiaApplication::create([
        'name' => 'Payment Founder',
        'email' => 'pay@startup.test',
        'company' => 'Pay Co',
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
            ->has('applications.data', 1)
            ->where('applications.data.0.company', 'Pay Co'));

    $this->actingAs($admin)
        ->get(route('admin.founder.assessments.index'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('Admin/Assessments/Index')
            ->where('desk', 'founder')
            ->has('applications.data', 1)
            ->where('applications.data.0.company', 'Startup Co')
            ->where('statusCounts.pending', 1));
});

test('confirming payment is refused for an assessment application', function () {
    $admin = User::factory()->create(['role' => 'superadmin']);
    $application = assessmentApplication();

    $this->actingAs($admin)
        ->post(route('admin.founder.pia-requests.payment-received', $application), [
            'amount' => 2090000,
            'currency' => 'NGN',
            'selected_tier' => 'growth',
        ])
        ->assertNotFound();

    expect(Payment::query()->count())->toBe(0)
        ->and($application->fresh()->status)->toBe('pending');
});

test('an analyst reviews an assessment and marks scope and fee as sent', function () {
    $analyst = User::factory()->create(['role' => 'analyst']);
    $application = assessmentApplication();

    $this->actingAs($analyst)
        ->patch(route('admin.founder.assessments.scope-sent', $application))
        ->assertRedirect()
        ->assertSessionHas('error');

    expect($application->fresh()->status)->toBe('pending');

    $this->actingAs($analyst)
        ->patch(route('admin.founder.assessments.review', $application))
        ->assertRedirect()
        ->assertSessionHas('success');

    expect($application->fresh()->status)->toBe('contacted');

    $this->actingAs($analyst)
        ->patch(route('admin.founder.assessments.scope-sent', $application))
        ->assertRedirect()
        ->assertSessionHas('success');

    expect($application->fresh()->status)->toBe('replied');
    expect(Payment::query()->count())->toBe(0);
});

test('a diagnostic payment request cannot be opened as an assessment', function () {
    $admin = User::factory()->create(['role' => 'superadmin']);
    $application = PiaApplication::create([
        'name' => 'Payment Founder',
        'email' => 'pay@startup.test',
        'company' => 'Pay Co',
        'country' => 'Nigeria',
        'stage' => 'seed',
        'raise_target' => '$100k-$500k',
        'source' => 'diagnostic_tier_selection',
        'status' => 'pending',
    ]);

    $this->actingAs($admin)
        ->patch(route('admin.assessments.review', $application))
        ->assertNotFound();

    expect($application->fresh()->status)->toBe('pending');
});

test('the founder dashboard separates open assessments from payment requests', function () {
    $admin = User::factory()->create(['role' => 'superadmin']);
    assessmentApplication();

    $this->actingAs($admin)
        ->get(route('admin.founder.dashboard'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->where('metrics.pending_pia_count', 0)
            ->where('needs_attention.0.id', 'open_assessments')
            ->where('needs_attention.0.count', 1)
            ->where('needs_attention.0.action_url', '/admin/founder/assessments'));
});
