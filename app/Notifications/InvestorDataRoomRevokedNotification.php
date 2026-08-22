<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use App\Models\InvestorDataRoomGrant;
use Illuminate\Notifications\Notification;

class InvestorDataRoomRevokedNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(public InvestorDataRoomGrant $grant) {}

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
        $company = $this->grant->profile->founder?->company_name ?? 'this startup';

        return (new MailMessage)
            ->subject('Data room access updated')
            ->greeting('Hello '.$notifiable->profile?->full_name.',')
            ->line("Your data room access for {$company} is no longer active.")
            ->action('View your interests', route('investor.interests.index'));
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return ['type' => 'data_room_access_revoked', 'grant_id' => $this->grant->id, 'profile_id' => $this->grant->profile_id];
    }
}
