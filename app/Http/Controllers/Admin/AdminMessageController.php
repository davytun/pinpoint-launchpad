<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Mail\NewMessageFounderMail;
use App\Models\Message;
use App\Models\MessageThread;
use App\Services\MessageService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

class AdminMessageController extends Controller
{
    public function __construct(private readonly MessageService $messageService) {}

    public function inbox(Request $request): Response
    {
        $threads = $this->getThreadsData();
        $selectedThreadId = $request->query('thread');
        $founderId = $request->query('founder_id');

        $activeThreadModel = null;
        if ($founderId) {
            $targetFounder = \App\Models\Founder::find($founderId);
            if ($targetFounder) {
                $thread = $this->messageService->getOrCreateThread($targetFounder);
                $selectedThreadId = $thread->id;
                // Refresh threads to include the newly created thread if necessary
                $threads = $this->getThreadsData();
            }
        }

        if ($selectedThreadId) {
            $activeThreadModel = MessageThread::with(['founder.diagnosticSession', 'founder.payment'])->find($selectedThreadId);
        }

        if (!$activeThreadModel && $threads->isNotEmpty()) {
            $firstId = $threads->first()['id'];
            $activeThreadModel = MessageThread::with(['founder.diagnosticSession', 'founder.payment'])->find($firstId);
        }

        $activeThreadData = null;
        $messagesData = [];
        $founderData = null;

        if ($activeThreadModel) {
            $this->messageService->markThreadRead($activeThreadModel, 'admin');
            $founder = $activeThreadModel->founder;
            $activeThreadData = [
                'id'           => $activeThreadModel->id,
                'founder_id'   => $founder?->id,
                'founder_name' => $founder?->full_name ?? 'Deleted Founder',
                'company_name' => $founder?->company_name ?? 'N/A',
                'email'        => $founder?->email ?? 'N/A',
            ];
            $messagesData = $this->getMessagesData($activeThreadModel, $founder);
            $founderData = $founder ? [
                'id'                 => $founder->id,
                'full_name'          => $founder->full_name ?? 'Deleted Founder',
                'company_name'       => $founder->company_name ?? 'N/A',
                'email'              => $founder->email ?? 'N/A',
                'phone'              => $founder->phone ?? null,
                'tier'               => $founder->payment?->tier ?? 'foundation',
                'diagnostic_score'   => $founder->diagnosticSession?->overall_score ?? null,
                'diagnostic_status'  => $founder->diagnosticSession?->status ?? 'pending',
                'created_at'         => $founder->created_at?->format('d M Y'),
            ] : null;
        }

        return Inertia::render('Admin/Messages/Inbox', [
            'threads'       => $threads,
            'active_thread' => $activeThreadData,
            'messages'      => $messagesData,
            'founder'       => $founderData,
            'total_unread'  => MessageThread::sum('admin_unread_count'),
        ]);
    }

    public function show(MessageThread $thread): Response
    {
        $threads = $this->getThreadsData();
        $thread->load(['founder.diagnosticSession', 'founder.payment']);
        $founder = $thread->founder;

        $this->messageService->markThreadRead($thread, 'admin');

        $activeThreadData = [
            'id'           => $thread->id,
            'founder_id'   => $founder?->id,
            'founder_name' => $founder?->full_name ?? 'Deleted Founder',
            'company_name' => $founder?->company_name ?? 'N/A',
            'email'        => $founder?->email ?? 'N/A',
        ];
        $messagesData = $this->getMessagesData($thread, $founder);
        $founderData = $founder ? [
            'id'                 => $founder->id,
            'full_name'          => $founder->full_name ?? 'Deleted Founder',
            'company_name'       => $founder->company_name ?? 'N/A',
            'email'              => $founder->email ?? 'N/A',
            'phone'              => $founder->phone ?? null,
            'tier'               => $founder->payment?->tier ?? 'foundation',
            'diagnostic_score'   => $founder->diagnosticSession?->overall_score ?? null,
            'diagnostic_status'  => $founder->diagnosticSession?->status ?? 'pending',
            'created_at'         => $founder->created_at?->format('d M Y'),
        ] : null;

        return Inertia::render('Admin/Messages/Inbox', [
            'threads'       => $threads,
            'active_thread' => $activeThreadData,
            'messages'      => $messagesData,
            'founder'       => $founderData,
            'total_unread'  => MessageThread::sum('admin_unread_count'),
        ]);
    }

    private function getThreadsData()
    {
        return MessageThread::with(['founder:id,full_name,company_name,email'])
            ->withCount(['messages as total_messages'])
            ->orderBy('last_message_at', 'desc')
            ->get()
            ->map(fn (MessageThread $thread) => [
                'id'                   => $thread->id,
                'founder_name'         => $thread->founder?->full_name ?? 'Deleted Founder',
                'company_name'         => $thread->founder?->company_name ?? 'N/A',
                'email'                => $thread->founder?->email ?? 'N/A',
                'unread_count'         => $thread->admin_unread_count,
                'total_messages'       => $thread->total_messages,
                'last_message_at'      => $thread->last_message_at?->diffForHumans(),
                'last_message_preview' => Str::limit(
                    $thread->messages()->visible()->latest()->value('body') ?? 'Attachment',
                    60
                ),
            ]);
    }

    private function getMessagesData(MessageThread $thread, $founder)
    {
        return $thread->messages()
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
                'created_at'          => $msg->created_at->format('d M, H:i'),
                'created_at_date'     => $msg->created_at->format('Y-m-d'),
                'is_from_founder'     => $msg->isFromFounder(),
            ]);
    }

    public function reply(Request $request, MessageThread $thread): RedirectResponse
    {
        $user = Auth::user();

        if ($user->isAnalyst() && !$user->canAccessFounder($thread->founder_id)) {
            abort(403, 'You are not assigned to this founder.');
        }

        $request->validate([
            'body'       => ['nullable', 'string', 'max:2000'],
            'attachment' => ['nullable', 'file'],
        ]);

        if (empty(trim((string) $request->input('body'))) && !$request->hasFile('attachment')) {
            return back()->withErrors(['body' => 'Please enter a message or attach a file.']);
        }

        try {
            $message = $this->messageService->sendMessage(
                $thread,
                'admin',
                Auth::id(),
                $request->input('body'),
                $request->hasFile('attachment') ? $request->file('attachment') : null
            );
        } catch (\Illuminate\Validation\ValidationException $e) {
            return back()->withErrors($e->errors());
        }

        $thread->load('founder');

        if (!$thread->founder) {
            return back()->withErrors(['body' => 'Cannot reply to this thread as the founder no longer exists.']);
        }

        Mail::to($thread->founder->email)->queue(
            new NewMessageFounderMail($thread->founder, $message)
        );

        return back()->with('success', 'Reply sent.');
    }

    public function downloadAttachment(Message $message): StreamedResponse
    {
        return $this->messageService->downloadAttachment($message);
    }
}
