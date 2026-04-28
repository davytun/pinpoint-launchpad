<?php

namespace App\Services;

use App\Models\Founder;
use App\Models\Message;
use App\Models\MessageThread;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
use Symfony\Component\HttpFoundation\StreamedResponse;

class MessageService
{
    private const ALLOWED_MIMES = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'text/csv',
        'application/vnd.ms-powerpoint',
        'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        'image/jpeg',
        'image/png',
    ];

    private const ALLOWED_EXTENSIONS = [
        'pdf', 'doc', 'docx', 'xls', 'xlsx', 'csv', 'ppt', 'pptx', 'jpg', 'jpeg', 'png',
    ];

    private const MAX_SIZE = 10485760; // 10MB

    public function getOrCreateThread(Founder $founder): MessageThread
    {
        return MessageThread::firstOrCreate(
            ['founder_id' => $founder->id]
        );
    }

    public function sendMessage(
        MessageThread $thread,
        string $senderType,
        int $senderId,
        ?string $body,
        ?UploadedFile $attachment = null
    ): Message {
        if (empty(trim((string) $body)) && $attachment === null) {
            throw ValidationException::withMessages([
                'body' => 'Please enter a message or attach a file.',
            ]);
        }

        $storedName = null;
        $path       = null;

        if ($attachment !== null) {
            $this->validateAttachment($attachment);

            $storedName = Str::uuid() . '.' . $attachment->getClientOriginalExtension();
            $path       = 'message-attachments/' . $thread->id . '/' . $storedName;

            Storage::disk('local')->putFileAs(
                'message-attachments/' . $thread->id,
                $attachment,
                $storedName
            );
        }

        $cleanBody = $body !== null ? Str::limit(strip_tags(trim($body)), 2000) : null;

        $message = Message::create([
            'thread_id'               => $thread->id,
            'sender_type'             => $senderType,
            'sender_id'               => $senderId,
            'body'                    => $cleanBody,
            'has_attachment'          => $attachment !== null,
            'attachment_filename'     => $attachment?->getClientOriginalName(),
            'attachment_stored_name'  => $storedName,
            'attachment_path'         => $path,
            'attachment_mime_type'    => $attachment?->getMimeType(),
            'attachment_size'         => $attachment?->getSize(),
        ]);

        $thread->update(['last_message_at' => now()]);

        if ($senderType === 'founder') {
            $thread->incrementAdminUnread();
        } else {
            $thread->incrementFounderUnread();
        }

        return $message;
    }

    public function validateAttachment(UploadedFile $file): void
    {
        if (!\in_array($file->getMimeType(), self::ALLOWED_MIMES)) {
            throw ValidationException::withMessages([
                'attachment' => 'This file type is not allowed.',
            ]);
        }

        $extension = strtolower($file->getClientOriginalExtension());
        if (!\in_array($extension, self::ALLOWED_EXTENSIONS)) {
            throw ValidationException::withMessages([
                'attachment' => 'This file extension is not permitted.',
            ]);
        }

        if ($file->getSize() > self::MAX_SIZE) {
            throw ValidationException::withMessages([
                'attachment' => 'File size must not exceed 10MB.',
            ]);
        }
    }

    public function downloadAttachment(Message $message): StreamedResponse
    {
        if (!$message->has_attachment || !$message->attachment_path) {
            abort(404);
        }

        /** @var \Illuminate\Filesystem\FilesystemAdapter $disk */
        $disk = Storage::disk('local');
        return $disk->download(
            $message->attachment_path,
            $message->attachment_filename
        );
    }

    public function markThreadRead(MessageThread $thread, string $readerType): void
    {
        if ($readerType === 'founder') {
            $thread->markReadByFounder();
        } else {
            $thread->markReadByAdmin();
        }
    }
}
