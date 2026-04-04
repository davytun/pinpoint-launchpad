<?php

namespace App\Mail;

use App\Models\WaitlistEntry;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class InvestorWaitlistMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public readonly WaitlistEntry $entry
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            to: $this->entry->email,
            subject: 'Welcome to the PIN Network (Priority Access)',
        );
    }

    public function content(): Content
    {
        return new Content(
            view:     'emails.waitlist.investor',
            text: 'emails.waitlist.investor-text',
        );
    }

    public function attachments(): array
    {
        return [];
    }
}
