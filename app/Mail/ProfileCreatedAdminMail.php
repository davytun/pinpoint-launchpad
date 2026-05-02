<?php

namespace App\Mail;

use App\Models\Founder;
use App\Models\FounderProfile;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class ProfileCreatedAdminMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public readonly Founder $founder,
        public readonly FounderProfile $profile,
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Verification Page Created — ' . ($this->founder->company_name ?? $this->founder->email),
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.verification.profile-created-admin',
            with: [
                'founder'         => $this->founder,
                'profile'         => $this->profile,
                'verificationUrl' => url('/verify/' . $this->profile->slug),
                'adminUrl'        => url('/admin/profiles/' . $this->profile->id),
                'recipientEmail'  => config('mail.admin_address'),
            ],
        );
    }

    public function attachments(): array
    {
        return [];
    }
}
