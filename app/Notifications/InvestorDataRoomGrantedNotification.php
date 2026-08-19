<?php

namespace App\Notifications;

use App\Models\FounderProfile;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class InvestorDataRoomGrantedNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(public FounderProfile $profile) {}

    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $companyName = $this->profile->founder->company_name ?? 'A startup';
        
        return (new MailMessage)
                    ->subject('Data Room Access Granted - Pinpoint')
                    ->greeting('Hello ' . $notifiable->profile->full_name . ',')
                    ->line('Your interest request has been approved by ' . $companyName . '.')
                    ->line('You now have secure access to their data room and can review their detailed documents and pitch decks.')
                    ->action('Enter Data Room', url('/data-rooms/' . $this->profile->slug))
                    ->line('Thank you for using the Pinpoint Investment Network.');
    }

    public function toArray(object $notifiable): array
    {
        return [
            'profile_id' => $this->profile->id,
        ];
    }
}
