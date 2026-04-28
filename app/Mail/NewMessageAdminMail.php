<?php

namespace App\Mail;

use App\Models\Founder;
use App\Models\Message;
use App\Models\MessageThread;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class NewMessageAdminMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public readonly Founder $founder,
        public readonly Message $message,
        public readonly MessageThread $thread,
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'New Message from ' . ($this->founder->company_name ?? $this->founder->full_name) . ' — Pinpoint',
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.messages.admin-notification',
            with: [
                'founder_name'    => $this->founder->full_name,
                'company_name'    => $this->founder->company_name ?? $this->founder->full_name,
                'message_preview' => $this->message->body
                    ? \Illuminate\Support\Str::limit($this->message->body, 150)
                    : null,
                'has_attachment'       => $this->message->has_attachment,
                'attachment_filename'  => $this->message->attachment_filename,
                'thread_url'          => url('/admin/messages/' . $this->thread->id),
                'recipient_email'     => config('mail.admin_address'),
            ],
        );
    }

    public function attachments(): array
    {
        return [];
    }
}
