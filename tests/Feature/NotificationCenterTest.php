<?php

use App\Models\Founder;
use App\Models\Investor;
use App\Models\User;
use App\Notifications\InvestorKycReviewedNotification;
use App\Notifications\PlatformAnnouncementNotification;
use App\Support\NotificationPresenter;
use Illuminate\Notifications\DatabaseNotification;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Str;

test('investors can mark only their own notifications read', function () {
    $investor = Investor::factory()->create();
    $otherInvestor = Investor::factory()->create();
    $notification = $investor->notifications()->create([
        'id' => (string) Str::uuid(),
        'type' => 'test',
        'data' => ['type' => 'test', 'title' => 'Test'],
    ]);

    $this->actingAs($otherInvestor, 'investor')
        ->patch(route('investor.notifications.read', $notification->id))
        ->assertNotFound();

    $this->actingAs($investor, 'investor')
        ->patch(route('investor.notifications.read', $notification->id))
        ->assertRedirect();

    expect($notification->fresh()->read_at)->not->toBeNull();
});

test('investor notifications index uses investor audience shell props', function () {
    $investor = Investor::factory()->create();
    $investor->notify(new InvestorKycReviewedNotification('approved'));

    $this->actingAs($investor, 'investor')
        ->get(route('investor.notifications.index'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('Notifications/Index')
            ->where('audience', 'investor')
            ->has('notifications.data', 1)
            ->where('notifications.data.0.data.title', 'KYC approved')
            ->where('unread_count', 1));
});

test('founder notifications index is isolated from investor notifications', function () {
    $founder = Founder::factory()->create();
    $investor = Investor::factory()->create();

    $investor->notify(new InvestorKycReviewedNotification('approved'));

    $this->actingAs($founder, 'founder')
        ->get(route('founder.notifications.index'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('Notifications/Index')
            ->where('audience', 'founder')
            ->has('notifications.data', 0)
            ->where('unread_count', 0));
});

test('admin notifications index only shows staff user notifications', function () {
    $admin = User::factory()->create(['role' => 'superadmin']);
    $investor = Investor::factory()->create();

    $investor->notify(new InvestorKycReviewedNotification('approved'));
    $admin->notifications()->create([
        'id' => (string) Str::uuid(),
        'type' => PlatformAnnouncementNotification::class,
        'data' => [
            'type' => 'platform_announcement',
            'title' => 'Staff alert',
            'body' => 'Internal note',
            'destination_url' => '/admin',
        ],
    ]);

    $this->actingAs($admin)
        ->get(route('admin.notifications.index'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('Notifications/Index')
            ->where('audience', 'admin')
            ->has('notifications.data', 1)
            ->where('notifications.data.0.data.title', 'Staff alert'));
});

test('notification presenter normalizes legacy message and action_url fields', function () {
    $notification = new DatabaseNotification([
        'id' => (string) Str::uuid(),
        'type' => 'test',
        'data' => [
            'type' => 'legacy',
            'title' => 'Legacy title',
            'message' => 'Legacy body',
            'action_url' => '/investor/kyc',
        ],
        'created_at' => now(),
    ]);

    $presented = NotificationPresenter::present($notification);

    expect($presented['data']['body'])->toBe('Legacy body')
        ->and($presented['data']['destination_url'])->toBe('/investor/kyc');
});

test('investor relations can publish an announcement to active investors', function () {
    Notification::fake();
    $staff = User::factory()->create(['role' => 'investor_relations']);
    $investor = Investor::factory()->create();

    $this->actingAs($staff)->post(route('admin.announcements.store'), [
        'type' => 'fundraise',
        'audience' => 'active_investors',
        'title' => 'New round',
        'body' => 'A Spotlight startup is raising.',
    ])->assertRedirect();

    Notification::assertSentTo($investor, PlatformAnnouncementNotification::class);
});

test('kyc reviewed notification includes destination_url for in-app UI', function () {
    $notification = new InvestorKycReviewedNotification('rejected', 'Blurry scan');
    $payload = $notification->toArray(Investor::factory()->make());

    expect($payload['title'])->toBe('KYC needs attention')
        ->and($payload['body'])->not->toBeEmpty()
        ->and($payload['destination_url'])->toContain('/investor/kyc');
});
