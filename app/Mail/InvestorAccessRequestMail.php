<?php

namespace App\Mail;

use App\Models\Founder;
use App\Models\FounderProfile;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class InvestorAccessRequestMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public readonly Founder $founder,
        public readonly FounderProfile $profile,
        public readonly string $investorName,
        public readonly ?string $firmName,
        public readonly string $investorEmail,
    ) {}

    public function envelope(): Envelope
    {
        $firm = $this->firmName ?? 'Independent Investor';

        return new Envelope(
            subject: 'Investor Interest — ' . $firm . ' Viewed Your Profile',
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.verification.investor-access-request',
            with: [
                'founder'         => $this->founder,
                'profile'         => $this->profile,
                'investorName'    => $this->investorName,
                'firmName'        => $this->firmName,
                'investorEmail'   => $this->investorEmail,
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
