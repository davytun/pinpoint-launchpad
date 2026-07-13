import { Head, Link } from '@inertiajs/react';
import { Inbox, MessageSquare } from 'lucide-react';

import AdminLayout from '@/layouts/admin-layout';
import { cn } from '@/lib/utils';

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
        <AdminLayout>
            <Head title="Message Inbox — Admin" />

            <div className="px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
                <div className="mx-auto max-w-4xl">
                    {/* Header */}
                    <div className="mb-8 flex items-center gap-4">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#3A54A5]/25 bg-[#3A54A5]/10">
                            <Inbox className="size-5 text-[#3A54A5]" />
                        </div>
                        <div>
                            <h1 className="font-display text-2xl font-extrabold text-zinc-950">Message Inbox</h1>
                            <p className="text-sm text-zinc-550 mt-0.5">Founder messages with the analyst team</p>
                        </div>
                        {total_unread > 0 && (
                            <span className="ml-auto inline-flex items-center rounded-full border border-[#3A54A5]/25 bg-[#3A54A5]/10 px-3 py-1 text-xs font-bold text-[#3A54A5]">
                                {total_unread} unread
                            </span>
                        )}
                    </div>

                    {/* Thread list */}
                    {threads.length === 0 ? (
                        <div className="rounded-2xl border border-white/80 bg-white/30 backdrop-blur-md shadow-[0_8px_30px_rgba(0,0,0,0.025)] p-16 text-center">
                            <MessageSquare className="mx-auto mb-4 size-12 text-zinc-400" />
                            <p className="text-sm font-bold text-zinc-900">No messages yet</p>
                            <p className="mt-1 text-xs text-zinc-500">Founder messages will appear here.</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {threads.map((thread) => {
                                const hasUnread = thread.unread_count > 0;
                                return (
                                    <Link
                                        key={thread.id}
                                        href={route('admin.messages.show', { thread: thread.id })}
                                        className={cn(
                                            'group flex items-center gap-4 rounded-2xl border px-5 py-4 transition-all duration-200',
                                            hasUnread
                                                ? 'border-l-[4px] border-l-[#3A54A5] border-[#3A54A5]/20 bg-[#3A54A5]/5 hover:bg-[#3A54A5]/10 shadow-[0_8px_30px_rgba(0,0,0,0.025)]'
                                                : 'border-white/80 bg-white/30 backdrop-blur-md shadow-[0_8px_30px_rgba(0,0,0,0.025)] hover:border-zinc-300 hover:bg-white/50',
                                        )}
                                    >
                                        {/* Avatar */}
                                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#3A54A5]/25 bg-[#3A54A5]/10 text-sm font-extrabold text-[#3A54A5]">
                                            {getInitials(thread.founder_name)}
                                        </div>

                                        {/* Content */}
                                        <div className="min-w-0 flex-1">
                                            <div className="flex items-center gap-2">
                                                <p
                                                    className={cn(
                                                        'truncate text-sm',
                                                        hasUnread ? 'font-extrabold text-zinc-950' : 'font-semibold text-zinc-800',
                                                    )}
                                                >
                                                    {thread.founder_name ?? 'Unknown Founder'}
                                                </p>
                                                <span className="shrink-0 text-xs text-zinc-400">·</span>
                                                <p className="shrink-0 truncate text-xs text-zinc-500">{thread.company_name ?? thread.email}</p>
                                            </div>
                                            <p className="mt-0.5 truncate text-xs text-zinc-450 italic">{thread.last_message_preview}</p>
                                        </div>

                                        {/* Right side */}
                                        <div className="flex shrink-0 flex-col items-end gap-1.5">
                                            {thread.last_message_at && <span className="text-[10px] text-zinc-400">{thread.last_message_at}</span>}
                                            {hasUnread && (
                                                <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-[#3A54A5] px-1.5 text-[10px] font-bold text-white">
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
        </AdminLayout>
    );
}
