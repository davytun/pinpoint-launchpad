<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Attachment;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class UnicornAlertMail extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    public function __construct(public \App\Models\DiagnosticSession $session) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: '🚨 UNICORN ALERT — High Velocity Candidate Detected',
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.diagnostic.unicorn-alert-admin',
        );
    }

    public function attachments(): array
    {
        return [];
    }
}
