<?php

namespace App\Mail;

use App\Models\PiaApplication;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class PiaApplicationAdminMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(public readonly PiaApplication $application) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: "New PIA Application: {$this->application->company} | {$this->application->name}",
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.pia.admin-notification',
            with: [
                'name'         => $this->application->name,
                'email'        => $this->application->email,
                'company'      => $this->application->company,
                'country'      => $this->application->country,
                'stage'        => $this->application->stage,
                'raise_target' => $this->application->raise_target,
                'founder_message' => $this->application->message,
                'submitted_at'    => $this->application->created_at,
            ],
        );
    }

    public function attachments(): array
    {
        return [];
    }
}
