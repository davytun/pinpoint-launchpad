<?php

namespace App\Notifications;

use App\Models\FounderProfile;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class SpotlightPublishedNotification extends Notification implements ShouldQueue
{
    use Queueable;

    /**
     * Create a new notification instance.
     */
    public function __construct(public FounderProfile $profile) {}

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
        return (new MailMessage)->subject('New startup in PIN Spotlight')->line(($this->profile->founder?->company_name ?? 'A new startup').' is now available in PIN Spotlight.')->action('Explore Spotlight', route('investor.spotlight.show', $this->profile->slug));
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return ['type' => 'spotlight_published', 'title' => 'New startup in PIN Spotlight', 'body' => ($this->profile->founder?->company_name ?? 'A new startup').' is now available to explore.', 'destination_url' => route('investor.spotlight.show', $this->profile->slug), 'profile_id' => $this->profile->id];
    }
}
