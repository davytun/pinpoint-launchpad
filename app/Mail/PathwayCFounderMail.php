<?php

namespace App\Mail;

use App\Models\DiagnosticSession;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Attachment;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class PathwayCFounderMail extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    public function __construct(public DiagnosticSession $session) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            from: new \Illuminate\Mail\Mailables\Address(
                config('mail.from.address'),
                config('mail.analyst_name'),
            ),
            subject: 'Moving your venture to the Fast-Track',
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.diagnostic.pathway-c-founder',
        );
    }

    public function attachments(): array
    {
        return [];
    }
}
