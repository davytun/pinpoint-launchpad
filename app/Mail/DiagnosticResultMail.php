<?php

namespace App\Mail;

use App\Models\DiagnosticSession;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class DiagnosticResultMail extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    public function __construct(public DiagnosticSession $session) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Your PARAGON Diagnostic Results — Pinpoint Launchpad',
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.diagnostic.result',
        );
    }

    public function attachments(): array
    {
        return [];
    }
}
