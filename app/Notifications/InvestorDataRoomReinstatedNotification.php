<?php

namespace App\Notifications;

use App\Models\InvestorDataRoomGrant;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class InvestorDataRoomReinstatedNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(public InvestorDataRoomGrant $grant) {}

    /**
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['database', 'mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $company = $this->grant->profile->founder?->company_name ?? 'this startup';

        return (new MailMessage)
            ->subject('Data room access restored')
            ->greeting('Hello '.$notifiable->profile?->full_name.',')
            ->line("Your data room access for {$company} has been reinstated by Pinpoint Investor Relations.")
            ->action('Open data rooms', route('investor.data-rooms.index'));
    }

    /**
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return [
            'type' => 'data_room_access_reinstated',
            'grant_id' => $this->grant->id,
            'profile_id' => $this->grant->profile_id,
        ];
    }
}
