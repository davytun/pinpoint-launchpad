<?php

namespace App\Jobs;

use App\Mail\FounderWaitlistMail;
use App\Mail\InvestorWaitlistMail;
use App\Models\WaitlistEntry;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Mail;

class SendWaitlistEmail implements ShouldQueue
{
    use Queueable;

    public function __construct(
        public readonly WaitlistEntry $entry
    ) {}

    public function handle(): void
    {
        $mailable = match ($this->entry->type) {
            'founder'  => new FounderWaitlistMail($this->entry),
            'investor' => new InvestorWaitlistMail($this->entry),
        };

        Mail::send($mailable);

        $this->entry->update(['email_sent_at' => now()]);
    }
}
