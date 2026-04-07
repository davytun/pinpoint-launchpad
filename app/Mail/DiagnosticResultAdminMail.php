<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Attachment;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class DiagnosticResultAdminMail extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    public function __construct(public \App\Models\DiagnosticSession $session) {}

    public function envelope(): Envelope
    {
        $label = $this->session->getScoreBandLabel();
        $score = $this->session->score;

        return new Envelope(
            subject: "New Diagnostic Completed — {$label} | Score: {$score}",
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.diagnostic.result-admin',
        );
    }

    public function attachments(): array
    {
        return [];
    }
}
