<?php

namespace App\Support;

use Illuminate\Notifications\DatabaseNotification;
use Illuminate\Support\Collection;

class NotificationPresenter
{
    /**
     * @return array{id: string, type: string, data: array<string, mixed>, read_at: string|null, created_at: string}
     */
    public static function present(DatabaseNotification $notification): array
    {
        $data = is_array($notification->data) ? $notification->data : [];

        $title = $data['title'] ?? null;
        $body = $data['body'] ?? $data['message'] ?? null;
        $url = $data['destination_url'] ?? $data['action_url'] ?? null;

        if (! $title && isset($data['type']) && is_string($data['type'])) {
            $title = ucfirst(str_replace('_', ' ', $data['type']));
        }

        return [
            'id' => (string) $notification->id,
            'type' => (string) $notification->type,
            'data' => [
                ...$data,
                'title' => $title ?? 'Platform update',
                'body' => $body,
                'destination_url' => $url,
            ],
            'read_at' => $notification->read_at?->toISOString(),
            'created_at' => $notification->created_at?->toISOString() ?? now()->toISOString(),
        ];
    }

    /**
     * @param  Collection<int, DatabaseNotification>  $notifications
     * @return list<array{id: string, type: string, data: array<string, mixed>, read_at: string|null, created_at: string}>
     */
    public static function collection(Collection $notifications): array
    {
        return $notifications->map(fn (DatabaseNotification $n) => self::present($n))->values()->all();
    }
}
