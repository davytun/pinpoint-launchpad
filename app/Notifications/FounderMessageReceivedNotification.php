<?php

namespace App\Notifications;

use App\Models\Founder;
use App\Models\Message;
use App\Models\MessageThread;
use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;
use Illuminate\Support\Str;

class FounderMessageReceivedNotification extends Notification
{
    use Queueable;

    public function __construct(
        public Founder $founder,
        public Message $message,
        public MessageThread $thread,
    ) {}

    /**
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['database'];
    }

    /**
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        $company = $this->founder->company_name ?: $this->founder->full_name;
        $preview = $this->message->body
            ? Str::limit($this->message->body, 180)
            : 'Sent an attachment.';

        $canOpen = $notifiable instanceof User && $notifiable->canAccessFounder((string) $this->founder->id);

        return [
            'type' => 'founder_message',
            'title' => 'Message from '.$company,
            'body' => $preview,
            'destination_url' => $canOpen
                ? route('admin.messages.show', $this->thread)
                : null,
            'thread_id' => $this->thread->id,
            'founder_id' => $this->founder->id,
        ];
    }
}
