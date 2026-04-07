<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Attachment;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class PathwayAMail extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    public function __construct(public \App\Models\DiagnosticSession $session) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Your PARAGON Roadmap: 3 Steps to Investment Readiness',
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.diagnostic.pathway-a',
        );
    }

    public function attachments(): array
    {
        return [];
    }
}
