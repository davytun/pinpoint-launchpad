<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Attachment;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class PathwayBEmail3Mail extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    public function __construct(public \App\Models\DiagnosticSession $session) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'From 72 to a $2M Seed round — here\'s what changed',
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.diagnostic.pathway-b-3',
        );
    }

    public function attachments(): array
    {
        return [];
    }
}
