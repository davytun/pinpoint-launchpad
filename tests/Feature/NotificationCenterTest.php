<?php

use App\Models\Investor;
use App\Models\User;
use App\Notifications\PlatformAnnouncementNotification;
use Illuminate\Support\Facades\Notification;

test('investors can mark only their own notifications read', function () {
    $investor = Investor::factory()->create();
    $otherInvestor = Investor::factory()->create();
    $notification = $investor->notifications()->create(['id' => (string) \Illuminate\Support\Str::uuid(), 'type' => 'test', 'data' => ['type' => 'test']]);

    $this->actingAs($otherInvestor, 'investor')->patch(route('investor.notifications.read', $notification->id))->assertNotFound();
    $this->actingAs($investor, 'investor')->patch(route('investor.notifications.read', $notification->id))->assertRedirect();

    expect($notification->fresh()->read_at)->not->toBeNull();
});

test('investor relations can publish an announcement to active investors', function () {
    Notification::fake();
    $staff = User::factory()->create(['role' => 'investor_relations']);
    $investor = Investor::factory()->create();

    $this->actingAs($staff)->post(route('admin.announcements.store'), ['type' => 'fundraise', 'audience' => 'active_investors', 'title' => 'New round', 'body' => 'A Spotlight startup is raising.'])->assertRedirect();

    Notification::assertSentTo($investor, PlatformAnnouncementNotification::class);
});
