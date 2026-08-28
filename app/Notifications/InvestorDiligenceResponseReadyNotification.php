<?php

namespace App\Notifications;

use App\Models\DiligenceRequest;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class InvestorDiligenceResponseReadyNotification extends Notification implements ShouldQueue
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
        $company = $this->diligenceRequest->profile?->founder?->company_name ?? 'the startup';

        return (new MailMessage)
            ->subject('Pinpoint Diligence Update: Response Available')
            ->greeting('Hello ' . ($notifiable->profile?->full_name ?? 'Investor') . ',')
            ->line("Pinpoint Investor Relations has prepared and released a verified response to your diligence inquiry regarding {$company}.")
            ->line("Subject: {$this->diligenceRequest->subject}")
            ->action('View Approved Response', route('investor.interests.index'));
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return [
            'type' => 'investor_diligence_response_ready',
            'diligence_request_id' => $this->diligenceRequest->id,
            'profile_id' => $this->diligenceRequest->profile_id,
            'subject' => $this->diligenceRequest->subject,
            'status' => $this->diligenceRequest->status,
        ];
    }
}
