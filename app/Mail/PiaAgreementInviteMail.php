<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class PiaAgreementInviteMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public readonly string $name,
        public readonly string $agreementUrl,
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(subject: 'Your PIA agreement is ready to sign');
    }

    public function content(): Content
    {
        return new Content(view: 'emails.pia.agreement-invite');
    }

    public function attachments(): array
    {
        return [];
    }
}
