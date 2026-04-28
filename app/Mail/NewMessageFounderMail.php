<?php

namespace App\Mail;

use App\Models\Founder;
use App\Models\Message;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class NewMessageFounderMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public readonly Founder $founder,
        public readonly Message $message,
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'New Message from Pinpoint Launchpad',
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.messages.founder-notification',
            with: [
                'founder_name'    => $this->founder->full_name,
                'message_preview' => $this->message->body
                    ? \Illuminate\Support\Str::limit($this->message->body, 150)
                    : null,
                'has_attachment'      => $this->message->has_attachment,
                'attachment_filename' => $this->message->attachment_filename,
                'dashboard_url'       => url('/founder/messages'),
                'recipient_email'     => $this->founder->email,
            ],
        );
    }

    public function attachments(): array
    {
        return [];
    }
}
