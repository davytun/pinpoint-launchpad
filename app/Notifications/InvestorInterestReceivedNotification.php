<?php

namespace App\Notifications;

use App\Models\InvestorInterest;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class InvestorInterestReceivedNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(public InvestorInterest $interest) {}

    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $investorName = $this->interest->investor->profile->full_name ?? 'An investor';
        
        return (new MailMessage)
                    ->subject('New Investor Interest - Pinpoint')
                    ->greeting('Hello ' . $notifiable->full_name . ',')
                    ->line($investorName . ' has expressed interest in your startup.')
                    ->line('Type: ' . ucwords(str_replace('_', ' ', $this->interest->type)))
                    ->line('Message: ' . ($this->interest->message ?: 'No additional message provided.'))
                    ->action('Review Request', url('/founder'))
                    ->line('You can approve this request in your Founder Dashboard to grant them access to your data room.');
    }

    public function toArray(object $notifiable): array
    {
        return [
            'interest_id' => $this->interest->id,
            'investor_id' => $this->interest->investor_id,
        ];
    }
}
