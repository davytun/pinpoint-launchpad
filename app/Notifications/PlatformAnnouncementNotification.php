<?php

namespace App\Notifications;

use App\Models\PlatformAnnouncement;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class PlatformAnnouncementNotification extends Notification implements ShouldQueue
{
    use Queueable;

    /**
     * Create a new notification instance.
     */
    public function __construct(public PlatformAnnouncement $announcement) {}

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
        $mail = (new MailMessage)->subject($this->announcement->title)->line($this->announcement->body);
        return $this->announcement->destination_url ? $mail->action('View update', $this->announcement->destination_url) : $mail;
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return ['type' => 'platform_announcement', 'announcement_id' => $this->announcement->id, 'title' => $this->announcement->title, 'body' => $this->announcement->body, 'destination_url' => $this->announcement->destination_url, 'announcement_type' => $this->announcement->type];
    }
}
