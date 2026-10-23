<?php

namespace App\Jobs;

use App\Models\FounderProfile;
use App\Models\Investor;
use App\Notifications\SpotlightPublishedNotification;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;

class NotifyInvestorsOfSpotlight implements ShouldQueue
{
    use Queueable;

    public function __construct(public FounderProfile $profile) {}

    public function handle(): void
    {
        $profile = $this->profile;

        Investor::query()
            ->where('account_status', Investor::ACCOUNT_STATUS_ACTIVE)
            ->chunkById(100, function ($investors) use ($profile): void {
                foreach ($investors as $investor) {
                    $investor->notify(new SpotlightPublishedNotification($profile));
                }
            });
    }
}
