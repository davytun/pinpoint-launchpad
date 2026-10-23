<?php

namespace App\Jobs;

use App\Models\Founder;
use App\Models\Investor;
use App\Models\PlatformAnnouncement;
use App\Models\User;
use App\Notifications\PlatformAnnouncementNotification;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;

class SendPlatformAnnouncement implements ShouldQueue
{
    use Queueable;

    public function __construct(public PlatformAnnouncement $announcement) {}

    public function handle(): void
    {
        $announcement = $this->announcement;

        $recipients = match ($announcement->audience) {
            'active_investors' => Investor::query()->where('account_status', Investor::ACCOUNT_STATUS_ACTIVE),
            'kyc_approved_investors' => Investor::query()
                ->where('account_status', Investor::ACCOUNT_STATUS_ACTIVE)
                ->where('kyc_status', Investor::KYC_STATUS_APPROVED),
            'founders' => Founder::query(),
            default => User::query()->whereIn('role', ['superadmin', 'analyst', 'compliance', 'investor_relations']),
        };

        $recipients->chunkById(100, function ($chunk) use ($announcement): void {
            foreach ($chunk as $recipient) {
                $recipient->notify(new PlatformAnnouncementNotification($announcement));
            }
        });
    }
}
