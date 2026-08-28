<?php

namespace App\Notifications;

use App\Models\DiligenceRequest;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class FounderDiligenceRequestedNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(public DiligenceRequest $diligenceRequest) {}

    /**
     * Get the notification's delivery channels.
     *
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['database', 'mail'];
    }

    /**
     * Get the mail representation of the notification.
     */
    public function toMail(object $notifiable): MailMessage
    {
        $category = str_replace('_', ' ', ucfirst($this->diligenceRequest->category));

        return (new MailMessage)
            ->subject('Pinpoint Information Request — Response Required')
            ->greeting('Hello ' . ($notifiable->full_name ?? 'Founder') . ',')
            ->line('An approved Investor currently engaged with your venture has requested additional clarification through Pinpoint Investor Relations.')
            ->line("Category: {$category}")
            ->line("Subject: {$this->diligenceRequest->subject}")
            ->line('Please review the details and provide your confidential response directly to Pinpoint IR.')
            ->action('Review Request on Dashboard', route('founder.dashboard'));
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return [
            'type' => 'founder_diligence_requested',
            'diligence_request_id' => $this->diligenceRequest->id,
            'profile_id' => $this->diligenceRequest->profile_id,
            'category' => $this->diligenceRequest->category,
            'subject' => $this->diligenceRequest->subject,
        ];
    }
}
