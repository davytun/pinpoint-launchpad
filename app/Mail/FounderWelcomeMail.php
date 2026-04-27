<?php

namespace App\Mail;

use App\Models\Founder;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class FounderWelcomeMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(public readonly Founder $founder) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Welcome to Pinpoint — Your Dashboard is Ready',
        );
    }

    public function content(): Content
    {
        return new Content(
            markdown: 'emails.founder.welcome',
            with: [
                'founder'    => $this->founder,
                'tierLabel'  => ucfirst($this->founder->tier ?? 'Foundation'),
                'dashboardUrl' => url('/dashboard'),
            ],
        );
    }

    public function attachments(): array
    {
        return [];
    }
}
