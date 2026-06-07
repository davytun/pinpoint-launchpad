<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Attachment;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class PathwayBEmail1Mail extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    public function __construct(public \App\Models\DiagnosticSession $session) {}

    public function envelope(): Envelope
    {
        $subject = $this->session->score_band === 'mid_low'
            ? "Your PARAGON score has gaps — here's what to fix before investors see it"
            : "You're in the top 20% — but the 'Unknown No' is lurking";

        return new Envelope(subject: $subject);
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.diagnostic.pathway-b-1',
        );
    }

    public function shouldSend(): bool
    {
        $hasPaid = \App\Models\Payment::query()->where('customer_email', $this->session->email)
            ->where('status', 'paid')
            ->exists();
        $hasAccount = \App\Models\Founder::query()->where('email', $this->session->email)->exists();

        return ! ($hasPaid || $hasAccount);
    }

    public function attachments(): array
    {
        return [];
    }
}
