<?php

namespace App\Mail;

use App\Models\Founder;
use App\Models\FounderProfile;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class VerificationPageLiveMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public readonly Founder $founder,
        public readonly FounderProfile $profile,
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Your Investor Page is Now Live — Pinpoint Launchpad',
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.verification.page-live',
            with: [
                'founder'         => $this->founder,
                'profile'         => $this->profile,
                'verificationUrl' => url('/verify/' . $this->profile->slug),
                'recipientEmail'  => $this->founder->email,
            ],
        );
    }

    public function attachments(): array
    {
        return [];
    }
}
