<?php

namespace App\Notifications;

use App\Models\DiligenceRequest;
use App\Models\InvestorDataRoomGrant;
use App\Models\InvestorInterest;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class DealflowAdminNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(
        public string $event,
        public ?InvestorInterest $interest = null,
        public ?string $decision = null,
        public ?InvestorDataRoomGrant $grant = null,
        public ?DiligenceRequest $diligenceRequest = null,
    ) {}

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
        $company = $this->diligenceRequest?->profile?->founder?->company_name
            ?? $this->interest?->profile?->founder?->company_name
            ?? $this->grant?->profile?->founder?->company_name
            ?? 'a startup';

        $investor = $this->diligenceRequest?->investor?->profile?->full_name
            ?? $this->interest?->investor?->profile?->full_name
            ?? $this->grant?->investor?->profile?->full_name
            ?? 'an investor';

        return match ($this->event) {
            'interest_submitted' => (new MailMessage)->subject('New investor interest')->line("{$investor} submitted an interest request for {$company}.")->action('Open Dealflow Log', route('admin.dealflow.interests.index')),
            'founder_authorized', 'founder_responded' => (new MailMessage)->subject('Founder authorized investor request')->line("{$company} provided authorization for {$investor}'s request. Admin action required.")->action('Open Dealflow Log', route('admin.dealflow.interests.index')),
            'founder_declined' => (new MailMessage)->subject('Founder declined investor request')->line("{$company} declined {$investor}'s investor request.")->action('Open Dealflow Log', route('admin.dealflow.interests.index')),
            'data_room_granted' => (new MailMessage)->subject('Data room access granted')->line("Data room access for {$investor} at {$company} was granted by Pinpoint.")->action('Open Access Log', route('admin.dealflow.data-rooms.index')),
            'access_revoked' => (new MailMessage)->subject('Data room access revoked')->line("Data room access for {$investor} at {$company} was revoked.")->action('Open Access Log', route('admin.dealflow.data-rooms.index')),
            'introduction_scheduled' => (new MailMessage)->subject('Founder Call Scheduled')->line("An introductory call between {$investor} and {$company} was scheduled by Pinpoint IR.")->action('Open Dealflow Log', route('admin.dealflow.interests.index')),
            'introduction_completed' => (new MailMessage)->subject('Founder Call Completed')->line("The introductory call between {$investor} and {$company} was marked completed.")->action('Open Dealflow Log', route('admin.dealflow.interests.index')),
            'diligence_submitted' => (new MailMessage)->subject('New Diligence Request Submitted')->line("{$investor} submitted a post-introduction diligence inquiry for {$company}.")->action('Open Diligence Orchestration', route('admin.dealflow.diligence.index')),
            'diligence_founder_responded' => (new MailMessage)->subject('Founder Diligence Response Received')->line("{$company} submitted confidential responses to Pinpoint for {$investor}'s diligence request. Admin review required.")->action('Open Diligence Orchestration', route('admin.dealflow.diligence.index')),
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
        $company = $this->diligenceRequest?->profile?->founder?->company_name
            ?? $this->interest?->profile?->founder?->company_name
            ?? $this->grant?->profile?->founder?->company_name
            ?? 'a startup';

        $investor = $this->diligenceRequest?->investor?->profile?->full_name
            ?? $this->interest?->investor?->profile?->full_name
            ?? $this->grant?->investor?->profile?->full_name
            ?? 'an investor';

        [$title, $body, $url] = match ($this->event) {
            'interest_submitted' => ['New investor interest', "{$investor} submitted an interest request for {$company}.", route('admin.dealflow.interests.index')],
            'founder_authorized', 'founder_responded' => ['Founder authorization received', "{$company} authorized {$investor}'s request. Admin action required.", route('admin.dealflow.interests.index')],
            'founder_declined' => ['Founder declined request', "{$company} declined {$investor}'s investor request.", route('admin.dealflow.interests.index')],
            'data_room_granted' => ['Data room access granted', "Data room access for {$investor} at {$company} was granted.", route('admin.dealflow.data-rooms.index')],
            'access_revoked' => ['Data room access revoked', "Data room access for {$investor} at {$company} was revoked.", route('admin.dealflow.data-rooms.index')],
            'introduction_scheduled' => ['Founder call scheduled', "Introductory call between {$investor} and {$company} was scheduled.", route('admin.dealflow.interests.index')],
            'introduction_completed' => ['Founder call completed', "Introductory call between {$investor} and {$company} was marked completed.", route('admin.dealflow.interests.index')],
            'diligence_submitted' => ['New diligence request', "{$investor} submitted a diligence inquiry for {$company}.", route('admin.dealflow.diligence.index')],
            'diligence_founder_responded' => ['Founder diligence response', "{$company} submitted a diligence response for {$investor}. Review required.", route('admin.dealflow.diligence.index')],
            default => ['Dealflow update', "{$company}: {$this->decision} for {$investor}.", route('admin.dealflow.interests.index')],
        };

        return [
            'type' => 'dealflow_'.$this->event,
            'title' => $title,
            'body' => $body,
            'destination_url' => $url,
            'interest_id' => $this->interest?->id,
            'profile_id' => $this->interest?->profile_id ?? $this->grant?->profile_id ?? $this->diligenceRequest?->profile_id,
            'grant_id' => $this->grant?->id,
            'diligence_request_id' => $this->diligenceRequest?->id,
            'decision' => $this->decision,
        ];
    }
}
