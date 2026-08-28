<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use App\Models\InvestorDataRoomGrant;
use App\Models\InvestorInterest;
use Illuminate\Notifications\Notification;

class DealflowAdminNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(public string $event, public ?InvestorInterest $interest = null, public ?string $decision = null, public ?InvestorDataRoomGrant $grant = null) {}

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
        $company = $this->interest?->profile?->founder?->company_name ?? $this->grant?->profile?->founder?->company_name ?? 'a startup';
        $investor = $this->interest?->investor?->profile?->full_name ?? $this->grant?->investor?->profile?->full_name ?? 'an investor';

        return match ($this->event) {
            'interest_submitted' => (new MailMessage)->subject('New investor interest')->line("{$investor} submitted an interest request for {$company}.")->action('Open Dealflow Log', route('admin.dealflow.interests.index')),
            'founder_authorized', 'founder_responded' => (new MailMessage)->subject('Founder authorized investor request')->line("{$company} provided authorization for {$investor}'s request. Admin action required.")->action('Open Dealflow Log', route('admin.dealflow.interests.index')),
            'founder_declined' => (new MailMessage)->subject('Founder declined investor request')->line("{$company} declined {$investor}'s investor request.")->action('Open Dealflow Log', route('admin.dealflow.interests.index')),
            'data_room_granted' => (new MailMessage)->subject('Data room access granted')->line("Data room access for {$investor} at {$company} was granted by Pinpoint.")->action('Open Access Log', route('admin.dealflow.data-rooms.index')),
            'access_revoked' => (new MailMessage)->subject('Data room access revoked')->line("Data room access for {$investor} at {$company} was revoked.")->action('Open Access Log', route('admin.dealflow.data-rooms.index')),
            'introduction_scheduled' => (new MailMessage)->subject('Founder Call Scheduled')->line("An introductory call between {$investor} and {$company} was scheduled by Pinpoint IR.")->action('Open Dealflow Log', route('admin.dealflow.interests.index')),
            'introduction_completed' => (new MailMessage)->subject('Founder Call Completed')->line("The introductory call between {$investor} and {$company} was marked completed.")->action('Open Dealflow Log', route('admin.dealflow.interests.index')),
            default => (new MailMessage)->subject('Dealflow status update')->line("{$company} {$this->decision} {$investor}'s investor request.")->action('Open Dealflow Log', route('admin.dealflow.interests.index')),
        };
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return ['type' => 'dealflow_'.$this->event, 'interest_id' => $this->interest?->id, 'profile_id' => $this->interest?->profile_id ?? $this->grant?->profile_id, 'grant_id' => $this->grant?->id, 'decision' => $this->decision];
    }
}
