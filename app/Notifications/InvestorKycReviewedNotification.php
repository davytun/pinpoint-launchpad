<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class InvestorKycReviewedNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(
        public string $status,
        public ?string $reviewNotes = null,
    ) {}

    /**
     * Get the notification's delivery channels.
     *
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['mail', 'database'];
    }

    /**
     * Get the mail representation of the notification.
     */
    public function toMail(object $notifiable): MailMessage
    {
        $approved = $this->status === 'approved';
        $name = $notifiable->profile?->full_name ?? 'Investor';

        $message = (new MailMessage)
            ->subject($approved ? 'Your KYC has been approved - Pinpoint' : 'Action needed: your KYC submission - Pinpoint')
            ->greeting("Hello {$name},")
            ->line($approved
                ? 'Your identity document has been approved. Protected investor access is now available.'
                : 'Your identity document was not approved. Please review the compliance note and upload a new document.');

        if (! $approved && $this->reviewNotes) {
            $message->line("Compliance note: {$this->reviewNotes}");
        }

        return $message
            ->action($approved ? 'Browse Spotlight' : 'Review KYC status', url('/investor/'.($approved ? 'spotlight' : 'kyc')))
            ->line('Thank you for using the Pinpoint Investment Network.');
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return [
            'type' => 'investor_kyc_reviewed',
            'status' => $this->status,
            'title' => $this->status === 'approved' ? 'KYC approved' : 'KYC needs attention',
            'message' => $this->status === 'approved'
                ? 'Your protected investor access is now available.'
                : 'Review the compliance note and upload a replacement document.',
            'review_notes' => $this->reviewNotes,
            'action_url' => url('/investor/'.($this->status === 'approved' ? 'spotlight' : 'kyc')),
        ];
    }
}
