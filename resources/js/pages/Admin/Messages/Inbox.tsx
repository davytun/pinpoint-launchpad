import { Head, Link } from '@inertiajs/react';
import { Inbox, MessageSquare } from 'lucide-react';

import AdminLayout from '@/layouts/admin-layout';

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
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#4468BB]/30 bg-[#1B294B]">
                            <Inbox className="size-5 text-[#4468BB]" />
                        </div>
                        <div>
                            <h1 className="font-display text-2xl font-bold text-[#ECF0F9]">Message Inbox</h1>
                            <p className="text-sm text-[#788CBA]">Founder messages with the analyst team</p>
                        </div>
                        {total_unread > 0 && (
                            <span className="ml-auto inline-flex items-center rounded-full bg-[#1B294B] px-3 py-1 text-xs font-bold text-[#4468BB] border border-[#4468BB]/30">
                                {total_unread} unread
                            </span>
                        )}
                    </div>

                    {/* Thread list */}
                    {threads.length === 0 ? (
                        <div className="rounded-xl border border-[#232C43] bg-[#101623] p-16 text-center">
                            <MessageSquare className="mx-auto mb-4 size-12 text-[#576FA8]" />
                            <p className="text-sm font-semibold text-[#788CBA]">No messages yet</p>
                            <p className="mt-1 text-xs text-[#576FA8]">Founder messages will appear here.</p>
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
                                            'group flex items-center gap-4 rounded-xl border px-5 py-4 transition-all duration-200',
                                            hasUnread
                                                ? 'border-[#4468BB]/50 border-l-[3px] border-l-[#4468BB] bg-[#0C1427] hover:bg-[#1B294B]'
                                                : 'border-[#232C43] bg-[#101623] hover:border-[#4468BB]/30 hover:bg-[#1B294B]',
                                        ].join(' ')}
                                    >
                                        {/* Avatar */}
                                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#4468BB]/30 bg-[#1B294B] text-sm font-bold text-[#4468BB]">
                                            {getInitials(thread.founder_name)}
                                        </div>

                                        {/* Content */}
                                        <div className="min-w-0 flex-1">
                                            <div className="flex items-center gap-2">
                                                <p className={`truncate text-sm ${hasUnread ? 'font-bold text-[#ECF0F9]' : 'font-medium text-[#788CBA]'}`}>
                                                    {thread.founder_name ?? 'Unknown Founder'}
                                                </p>
                                                <span className="shrink-0 text-xs text-[#576FA8]">·</span>
                                                <p className="shrink-0 truncate text-xs text-[#788CBA]">
                                                    {thread.company_name ?? thread.email}
                                                </p>
                                            </div>
                                            <p className="mt-0.5 truncate text-xs italic text-[#576FA8]">
                                                {thread.last_message_preview}
                                            </p>
                                        </div>

                                        {/* Right side */}
                                        <div className="flex shrink-0 flex-col items-end gap-1.5">
                                            {thread.last_message_at && (
                                                <span className="text-[10px] text-[#576FA8]">{thread.last_message_at}</span>
                                            )}
                                            {hasUnread && (
                                                <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-[#4468BB] px-1.5 text-[10px] font-bold text-white">
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
