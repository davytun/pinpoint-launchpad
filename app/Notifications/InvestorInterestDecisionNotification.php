<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use App\Models\InvestorInterest;
use Illuminate\Notifications\Notification;

class InvestorInterestDecisionNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(public InvestorInterest $interest, public string $status, public bool $dataRoomGranted) {}

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
        $company = $this->interest->profile->founder?->company_name ?? 'the startup';
        $accepted = $this->status === 'approved';
        $message = (new MailMessage)
            ->subject($accepted ? 'Your investor request was approved' : 'Your investor request was not approved')
            ->greeting('Hello '.$notifiable->profile?->full_name.',');

        if ($this->dataRoomGranted) {
            return $message
                ->line("{$company} approved your data room request.")
                ->action('Open secure data room', route('investor.data-rooms.show', $this->interest->profile->slug));
        }

        return $message
            ->line($accepted ? "{$company} accepted your request. Pinpoint Investor Relations will coordinate the next step." : "{$company} did not approve your request at this time.")
            ->action('View your interests', route('investor.interests.index'));
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return ['type' => 'investor_interest_decision', 'interest_id' => $this->interest->id, 'profile_id' => $this->interest->profile_id, 'status' => $this->status, 'data_room_granted' => $this->dataRoomGranted];
    }
}
