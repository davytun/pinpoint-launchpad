import { Head, Link } from '@inertiajs/react';
import { Inbox, MessageSquare } from 'lucide-react';

interface Thread {
    id: number;
    founder_name: string | null;
    company_name: string | null;
    email: string;
    unread_count: number;
    total_messages: number;
    last_message_at: string | null;
    last_message_preview: string;
}

interface PageProps {
    threads: Thread[];
    total_unread: number;
}

function getInitials(name?: string | null): string {
    if (!name) return '?';
    return name
        .split(' ')
        .slice(0, 2)
        .map((n) => n[0])
        .join('')
        .toUpperCase();
}

export default function AdminMessagesInbox({ threads, total_unread }: PageProps) {
    return (
        <>
            <Head title="Message Inbox — Admin" />

            <div className="min-h-screen bg-[#050505] px-6 py-8 text-white antialiased">
                <div className="mx-auto max-w-4xl">

                    {/* Header */}
                    <div className="mb-8 flex items-center gap-4">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/[0.08] bg-blue-500/10">
                            <Inbox className="size-5 text-blue-400" />
                        </div>
                        <div>
                            <h1 className="font-display text-2xl font-bold text-white">Message Inbox</h1>
                            <p className="text-sm text-slate-400">Founder messages with the analyst team</p>
                        </div>
                        {total_unread > 0 && (
                            <span className="ml-auto inline-flex items-center rounded-full bg-blue-500/20 px-3 py-1 text-xs font-bold text-blue-300 border border-blue-500/30">
                                {total_unread} unread
                            </span>
                        )}
                    </div>

                    {/* Thread list */}
                    {threads.length === 0 ? (
                        <div className="rounded-3xl border border-white/[0.06] bg-[#0A0A0A] p-16 text-center shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
                            <MessageSquare className="mx-auto mb-4 size-12 text-slate-600" />
                            <p className="text-sm font-semibold text-slate-400">No messages yet</p>
                            <p className="mt-1 text-xs text-slate-600">Founder messages will appear here.</p>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {threads.map((thread) => {
                                const hasUnread = thread.unread_count > 0;
                                return (
                                    <Link
                                        key={thread.id}
                                        href={route('admin.messages.show', { thread: thread.id })}
                                        className={[
                                            'group flex items-center gap-4 rounded-2xl border px-5 py-4 transition-all duration-200',
                                            hasUnread
                                                ? 'border-l-[3px] border-l-blue-500 border-white/[0.08] bg-[#0D1017] hover:bg-[#111926]'
                                                : 'border-white/[0.06] bg-[#0A0A0A] hover:border-white/[0.1] hover:bg-white/[0.02]',
                                        ].join(' ')}
                                    >
                                        {/* Avatar */}
                                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-blue-500/20 bg-blue-500/20 text-sm font-bold text-blue-400">
                                            {getInitials(thread.founder_name)}
                                        </div>

                                        {/* Content */}
                                        <div className="min-w-0 flex-1">
                                            <div className="flex items-center gap-2">
                                                <p className={`truncate text-sm ${hasUnread ? 'font-bold text-white' : 'font-medium text-white/80'}`}>
                                                    {thread.founder_name ?? 'Unknown Founder'}
                                                </p>
                                                <span className="shrink-0 text-xs text-slate-600">·</span>
                                                <p className="shrink-0 truncate text-xs text-slate-400">
                                                    {thread.company_name ?? thread.email}
                                                </p>
                                            </div>
                                            <p className="mt-0.5 truncate text-xs italic text-slate-500">
                                                {thread.last_message_preview}
                                            </p>
                                        </div>

                                        {/* Right side */}
                                        <div className="flex shrink-0 flex-col items-end gap-1.5">
                                            {thread.last_message_at && (
                                                <span className="text-[10px] text-slate-500">{thread.last_message_at}</span>
                                            )}
                                            {hasUnread && (
                                                <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-blue-500 px-1.5 text-[10px] font-bold text-white">
                                                    {thread.unread_count}
                                                </span>
                                            )}
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
