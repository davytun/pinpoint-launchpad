<?php

namespace App\Mail;

use App\Models\Signature;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class SignatureAdminNotificationMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public Signature $signature,
        public string $tierLabel,
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'PIW Signed — New Founder Ready for Analyst Assignment',
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.signature.admin-notification',
            with: [
                'signer_email' => $this->signature->signer_email,
                'tier_label'   => $this->tierLabel,
                'signed_at'    => $this->signature->signed_at,
                'document_id'  => $this->signature->boldsign_document_id,
            ],
        );
    }

    public function attachments(): array
    {
        return [];
    }
}
