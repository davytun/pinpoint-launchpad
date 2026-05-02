<?php

namespace App\Mail;

use App\Models\Founder;
use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class AnalystAssignedMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public readonly User    $analyst,
        public readonly Founder $founder,
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: "New Founder Assigned — {$this->founder->company_name}",
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.analyst.assigned',
            with: [
                'analystName'  => $this->analyst->name,
                'analystEmail' => $this->analyst->email,
                'founderName'  => $this->founder->full_name,
                'companyName'  => $this->founder->company_name,
                'tier'         => ucfirst((string) $this->founder->tier),
                'score'        => $this->founder->score,
                'profileUrl'   => url("/admin/founders/{$this->founder->id}"),
            ],
        );
    }

    public function attachments(): array
    {
        return [];
    }
}
