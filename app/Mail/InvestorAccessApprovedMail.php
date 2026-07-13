<?php

namespace App\Mail;

use App\Models\Founder;
use App\Models\FounderProfile;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class InvestorAccessApprovedMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public readonly Founder $founder,
        public readonly FounderProfile $profile,
        public readonly string $investorName,
        public readonly string $investorEmail,
        public readonly string $token,
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Access Granted — Secure Data Room Unlocked: ' . $this->profile->founder->company_name,
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.verification.investor-access-approved',
            with: [
                'founder'         => $this->founder,
                'profile'         => $this->profile,
                'investorName'    => $this->investorName,
                'investorEmail'   => $this->investorEmail,
                'unlockedUrl'     => route('verify.show', ['slug' => $this->profile->slug, 'token' => $this->token]),
                'recipientEmail'  => $this->investorEmail,
            ],
        );
    }

    public function attachments(): array
    {
        return [];
    }
}
