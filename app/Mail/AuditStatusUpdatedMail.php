<?php

namespace App\Mail;

use App\Models\Founder;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class AuditStatusUpdatedMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public readonly Founder $founder,
        public readonly string  $auditStatus,
    ) {}

    public function envelope(): Envelope
    {
        $label = match ($this->auditStatus) {
            'in_progress' => 'In Progress',
            'needs_info'  => 'Action Required',
            'on_hold'     => 'On Hold',
            'complete'    => 'Complete',
            default       => ucfirst($this->auditStatus),
        };

        return new Envelope(
            subject: "Audit Update — {$label}",
        );
    }

    public function content(): Content
    {
        $body = match ($this->auditStatus) {
            'in_progress' => 'Your analyst has begun reviewing your PARAGON audit. You will hear from them directly with any questions.',
            'needs_info'  => 'Your analyst needs additional information to continue your audit. Please check your Messages tab on your dashboard.',
            'on_hold'     => 'Your audit has been temporarily paused. Your analyst will be in touch shortly with next steps.',
            'complete'    => 'Your PARAGON audit is complete. Your investor verification page is now live.',
            default       => 'Your audit status has been updated.',
        };

        $ctaText = match ($this->auditStatus) {
            'needs_info' => 'Go to Messages',
            'complete'   => 'View Your Investor Page',
            default      => null,
        };

        $ctaUrl = match ($this->auditStatus) {
            'needs_info' => url('/founder/messages'),
            'complete'   => $this->founder->profile?->slug
                ? url("/verify/{$this->founder->profile->slug}")
                : url('/founder/dashboard'),
            default      => null,
        };

        return new Content(
            view: 'emails.audit.status-updated',
            with: [
                'founderName'   => $this->founder->full_name,
                'founderEmail'  => $this->founder->email,
                'body'          => $body,
                'ctaText'       => $ctaText,
                'ctaUrl'        => $ctaUrl,
            ],
        );
    }

    public function attachments(): array
    {
        return [];
    }
}
