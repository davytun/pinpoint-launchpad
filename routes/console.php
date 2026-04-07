<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

// Process queued jobs every minute — required for cPanel shared hosting
// where no persistent queue worker can run.
// Pair with a cPanel cron: * * * * * php /home/{cpanel_username}/pinpoint/artisan schedule:run >> /dev/null 2>&1
Schedule::command('queue:work --stop-when-empty')->everyMinute()->withoutOverlapping();
