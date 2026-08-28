<?php

namespace App\Mail;

use App\Models\DiagnosticSession;
use App\Models\Founder;
use App\Models\Payment;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Attachment;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class PathwayBEmail2Mail extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    public function __construct(public DiagnosticSession $session) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: "VCs don't buy visions. They buy de-risked assets.",
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.diagnostic.pathway-b-2',
        );
    }

    public function shouldSend(): bool
    {
        $hasPaid = Payment::query()->where('customer_email', $this->session->email)
            ->where('status', 'paid')
            ->exists();
        $hasAccount = Founder::query()->where('email', $this->session->email)->exists();

        return ! ($hasPaid || $hasAccount);
    }

    public function attachments(): array
    {
        return [];
    }
}
