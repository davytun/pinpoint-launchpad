<?php

namespace App\Mail;

use App\Models\Signature;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class SignatureCompleteMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public Signature $signature,
        public string $tierLabel,
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Agreement Signed — Your PARAGON Audit Begins Now',
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.signature.complete',
            with: [
                'tier_label'   => $this->tierLabel,
                'signer_email' => $this->signature->signer_email,
                'signed_at'    => $this->signature->signed_at,
            ],
        );
    }

    public function attachments(): array
    {
        return [];
    }
}
