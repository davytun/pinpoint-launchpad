<?php

namespace App\Notifications;

use App\Models\InvestorInterest;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class IntroductionCompletedNotification extends Notification implements ShouldQueue
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

        $isFounder = $notifiable instanceof \App\Models\Founder;

        if ($isFounder) {
            return (new MailMessage)
                ->subject("Introduction Call Completed with {$investorName}")
                ->greeting("Hello {$notifiable->full_name},")
                ->line("Your introductory conversation with {$investorName} has been marked as completed.")
                ->line("Pinpoint Investor Relations remains available to support any diligence or follow-up coordination.")
                ->action('View Founder Dashboard', route('founder.dashboard'));
        }

        return (new MailMessage)
            ->subject("Introduction Call Completed with {$company}")
            ->greeting("Hello " . ($notifiable->profile?->full_name ?? 'Investor') . ",")
            ->line("Your introductory conversation with {$company} has been marked as completed.")
            ->line("If you would like to request Data Room access or additional materials, you can manage your requests from your portal.")
            ->action('View Submitted Interests', route('investor.interests.index'));
    }

    /**
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return [
            'type' => 'introduction_completed',
            'interest_id' => $this->interest->id,
            'profile_id' => $this->interest->profile_id,
            'completed_at' => $this->interest->completed_at?->toISOString(),
        ];
    }
}
