import { InvestorHeader } from '@/components/investor-header';
import AdminLayout from '@/layouts/admin-layout';
import FounderLayout from '@/layouts/founder-layout';
import { cn } from '@/lib/utils';
import { Icon } from '@iconify/react';
import { Head, router } from '@inertiajs/react';
import { CheckCheck } from 'lucide-react';
import { ReactNode, useState } from 'react';

type NotificationItem = {
    id: string;
    type: string;
    data: {
        type?: string;
        title?: string;
        body?: string;
        destination_url?: string | null;
    };
    read_at: string | null;
    created_at: string;
};

type Paginated = {
    data: NotificationItem[];
    current_page?: number;
    last_page?: number;
    total?: number;
};

type Audience = 'admin' | 'founder' | 'investor';

function Shell({
    audience,
    founder,
    children,
}: {
    audience: Audience;
    founder?: { id?: string | number; full_name?: string | null; company_name?: string | null; email?: string };
    children: ReactNode;
}) {
    if (audience === 'founder') {
        return <FounderLayout founder={founder ?? {}}>{children}</FounderLayout>;
    }

    if (audience === 'investor') {
        return (
            <div className="min-h-screen bg-[#f8f9fc] text-zinc-950">
                <InvestorHeader activeTab="notifications" />
                <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">{children}</main>
            </div>
        );
    }

    return <AdminLayout>{children}</AdminLayout>;
}

export default function NotificationsIndex({
    audience = 'admin',
    founder,
    notifications,
    unread_count = 0,
    read_all_url,
    read_url_template,
}: {
    audience?: Audience;
    founder?: { id?: string | number; full_name?: string | null; company_name?: string | null; email?: string };
    notifications: Paginated;
    unread_count?: number;
    read_all_url: string;
    read_url_template: string;
}) {
    const unreadCount = unread_count;
    const [markingAll, setMarkingAll] = useState(false);

    function markAllAsRead() {
        if (unreadCount === 0 || markingAll) return;
        setMarkingAll(true);
        router.patch(read_all_url, {}, { preserveScroll: true, onFinish: () => setMarkingAll(false) });
    }

    function handleNotificationClick(notification: NotificationItem) {
        const visit = () => {
            if (notification.data.destination_url) {
                router.visit(notification.data.destination_url);
            }
        };

        if (!notification.read_at) {
            router.patch(read_url_template.replace('__notification__', notification.id), {}, {
                preserveScroll: true,
                onSuccess: visit,
            });
            return;
        }

        visit();
    }

    return (
        <Shell audience={audience} founder={founder}>
            <Head title="Notifications" />

            <div className={cn(audience === 'admin' ? 'no-scrollbar flex h-full flex-col overflow-y-auto p-4 sm:p-8 lg:p-12' : '')}>
                <div className="mb-8 flex shrink-0 flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
                    <div>
                        <h1 className="text-3xl font-semibold tracking-tight text-zinc-950 sm:text-4xl">Notifications</h1>
                        <p className="mt-2 text-[15px] text-zinc-500">
                            {unreadCount > 0
                                ? `You have ${unreadCount} unread alert${unreadCount === 1 ? '' : 's'}.`
                                : 'You are all caught up. No unread alerts.'}
                        </p>
                    </div>

                    {unreadCount > 0 && (
                        <button
                            type="button"
                            onClick={markAllAsRead}
                            disabled={markingAll}
                            className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-zinc-950 px-4 py-2.5 text-[13px] font-semibold text-white shadow-2xs transition-all hover:bg-zinc-800 disabled:opacity-50"
                        >
                            <CheckCheck className="size-4" />
                            {markingAll ? 'Marking...' : 'Mark all as read'}
                        </button>
                    )}
                </div>

                <div className="flex flex-1 flex-col overflow-hidden rounded-3xl border border-zinc-200/80 bg-white shadow-xs">
                    {notifications.data.length === 0 ? (
                        <div className="flex flex-1 flex-col items-center justify-center p-12 text-center">
                            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-zinc-50 text-zinc-300">
                                <Icon icon="solar:bell-bing-bold-duotone" className="size-8" />
                            </div>
                            <h3 className="mt-4 text-sm font-bold text-zinc-900">No notifications</h3>
                            <p className="mt-1 text-xs text-zinc-500">When you receive alerts, they will appear here.</p>
                        </div>
                    ) : (
                        <div className="no-scrollbar flex-1 divide-y divide-zinc-100 overflow-y-auto">
                            {notifications.data.map((notification) => {
                                const isUnread = !notification.read_at;
                                return (
                                    <button
                                        key={notification.id}
                                        type="button"
                                        onClick={() => handleNotificationClick(notification)}
                                        className={cn(
                                            'group relative flex w-full items-start gap-4 p-5 text-left transition-all duration-200',
                                            isUnread ? 'bg-blue-50/30 hover:bg-blue-50/50' : 'bg-white hover:bg-zinc-50/70',
                                        )}
                                    >
                                        <div className="mt-1.5 flex w-3 shrink-0 items-center justify-center">
                                            {isUnread ? <div className="h-2 w-2 rounded-full bg-[#3A54A5]" /> : null}
                                        </div>
                                        <div className="min-w-0 flex-1 pr-4">
                                            <p className={cn('text-[14px] font-semibold tracking-tight', isUnread ? 'text-zinc-950' : 'text-zinc-700')}>
                                                {notification.data.title ?? 'Platform update'}
                                            </p>
                                            {notification.data.body && (
                                                <p className={cn('mt-1 text-[13px] leading-relaxed', isUnread ? 'text-zinc-600' : 'text-zinc-500')}>
                                                    {notification.data.body}
                                                </p>
                                            )}
                                            <p className="mt-2 text-[11px] font-medium text-zinc-400">
                                                {new Date(notification.created_at).toLocaleString(undefined, {
                                                    dateStyle: 'medium',
                                                    timeStyle: 'short',
                                                })}
                                            </p>
                                        </div>
                                        {notification.data.destination_url && (
                                            <Icon icon="solar:arrow-right-up-linear" className="mt-1 size-4 shrink-0 text-zinc-300 group-hover:text-zinc-500" />
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </Shell>
    );
}
