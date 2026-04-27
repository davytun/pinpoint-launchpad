<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;
class FounderSetupInviteMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public readonly string $email,
        public readonly string $setupUrl,
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Set Up Your Pinpoint Dashboard',
        );
    }

    public function content(): Content
    {
        return new Content(
            markdown: 'emails.founder.setup-invite',
            with: [
                'setupUrl' => $this->setupUrl,
                'email'    => $this->email,
            ],
        );
    }

    public function attachments(): array
    {
        return [];
    }
}
