<?php

namespace App\Http\Controllers\Founder;

use App\Http\Controllers\Controller;
use App\Mail\NewMessageAdminMail;
use App\Models\Message;
use App\Services\MessageService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Mail;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

class FounderMessageController extends Controller
{
    public function __construct(private readonly MessageService $messageService) {}

    public function index(): Response
    {
        /** @var \App\Models\Founder $founder */
        $founder = Auth::guard('founder')->user();
        $thread  = $this->messageService->getOrCreateThread($founder);

        $this->messageService->markThreadRead($thread, 'founder');

        $messages = $thread->messages()
            ->visible()
            ->oldest()
            ->get()
            ->map(fn ($msg) => [
                'id'                  => $msg->id,
                'sender_type'         => $msg->sender_type,
                'sender_name'         => $msg->senderName($founder),
                'body'                => $msg->body,
                'has_attachment'      => $msg->has_attachment,
                'attachment_filename' => $msg->attachment_filename,
                'attachment_size'     => $msg->has_attachment ? $msg->attachmentSizeForHumans() : null,
                'created_at'          => $msg->created_at->format('d M Y, H:i'),
                'created_at_date'     => $msg->created_at->format('Y-m-d'),
                'is_from_founder'     => $msg->isFromFounder(),
            ]);

        return Inertia::render('Founder/Messages/Index', [
            'messages'      => $messages,
            'thread_id'     => $thread->id,
            'founder_name'  => $founder->full_name,
            'unread_count'  => 0,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'body'       => ['nullable', 'string', 'max:2000'],
            'attachment' => ['nullable', 'file'],
        ]);

        if (empty(trim((string) $request->input('body'))) && !$request->hasFile('attachment')) {
            return back()->withErrors(['body' => 'Please enter a message or attach a file.']);
        }

        /** @var \App\Models\Founder $founder */
        $founder = Auth::guard('founder')->user();
        $thread  = $this->messageService->getOrCreateThread($founder);

        try {
            $message = $this->messageService->sendMessage(
                $thread,
                'founder',
                $founder->id,
                $request->input('body'),
                $request->hasFile('attachment') ? $request->file('attachment') : null
            );
        } catch (\Illuminate\Validation\ValidationException $e) {
            return back()->withErrors($e->errors());
        }

        Mail::to(config('mail.admin_address'))->queue(
            new NewMessageAdminMail($founder, $message, $thread)
        );

        return back()->with('success', 'Message sent.');
    }

    public function downloadAttachment(Message $message): StreamedResponse
    {
        /** @var \App\Models\Founder $founder */
        $founder = Auth::guard('founder')->user();

        if ($message->thread->founder_id !== $founder->id) {
            abort(403);
        }

        return $this->messageService->downloadAttachment($message);
    }
}
