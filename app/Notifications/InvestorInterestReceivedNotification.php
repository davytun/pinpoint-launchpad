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
        return ['database', 'mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $investorName = $this->interest->investor->profile->full_name ?? 'An investor';

        return (new MailMessage)
            ->subject('New Investor Engagement Request - Pinpoint')
            ->greeting('Hello '.$notifiable->full_name.',')
            ->line('Pinpoint Investor Relations is coordinating a new investor engagement request for your venture.')
            ->line('Investor: '.$investorName)
            ->line('Request Type: '.ucwords(str_replace('_', ' ', $this->interest->type)))
            ->line('Message: '.($this->interest->message ?: 'No additional message provided.'))
            ->action('Review Request with Pinpoint', route('founder.dashboard'))
            ->line('Please review and provide your authorization or confirmation in your Founder Dashboard.');
    }

    public function toArray(object $notifiable): array
    {
        $investorName = $this->interest->investor->profile->full_name ?? 'An investor';
        $requestType = ucwords(str_replace('_', ' ', $this->interest->type));

        return [
            'type' => 'investor_interest_received',
            'title' => 'New investor engagement request',
            'body' => "{$investorName} requested {$requestType}. Review and respond in your dashboard.",
            'destination_url' => route('founder.dashboard'),
            'interest_id' => $this->interest->id,
            'investor_id' => $this->interest->investor_id,
            'profile_id' => $this->interest->profile_id,
        ];
    }
}
