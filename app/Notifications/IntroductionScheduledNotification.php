<?php

namespace App\Notifications;

use App\Models\InvestorInterest;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class IntroductionScheduledNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(public InvestorInterest $interest) {}

    /**
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['database', 'mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $company = $this->interest->profile->founder?->company_name ?? 'the startup';
        $investorName = $this->interest->investor?->profile?->full_name ?? 'the investor';
        $scheduledTime = $this->interest->scheduled_at?->format('F j, Y \a\t g:i A T') ?? 'a coordinated time';

        $isFounder = $notifiable instanceof \App\Models\Founder;

        if ($isFounder) {
            $message = (new MailMessage)
                ->subject("Founder Call Scheduled with {$investorName}")
                ->greeting("Hello {$notifiable->full_name},")
                ->line("Your introductory call with {$investorName} has been scheduled for {$scheduledTime}.")
                ->line("Coordinated by Pinpoint Investor Relations.");

            if ($this->interest->meeting_link) {
                $message->line("Meeting Details: {$this->interest->meeting_link}");
            }

            return $message->action('View Founder Dashboard', route('founder.dashboard'));
        }

        $message = (new MailMessage)
            ->subject("Founder Call Scheduled with {$company}")
            ->greeting("Hello " . ($notifiable->profile?->full_name ?? 'Investor') . ",")
            ->line("Your introductory call with the founders of {$company} has been scheduled for {$scheduledTime}.")
            ->line("Coordinated by Pinpoint Investor Relations.");

        if ($this->interest->meeting_link) {
            $message->line("Meeting Details: {$this->interest->meeting_link}");
        }

        return $message->action('View Submitted Interests', route('investor.interests.index'));
    }

    /**
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return [
            'type' => 'introduction_scheduled',
            'interest_id' => $this->interest->id,
            'profile_id' => $this->interest->profile_id,
            'scheduled_at' => $this->interest->scheduled_at?->toISOString(),
            'meeting_link' => $this->interest->meeting_link,
        ];
    }
}
