import { PinpointLogo } from '@/components/pinpoint-logo';
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useNotificationPolling } from '@/hooks/use-notification-polling';
import { cn } from '@/lib/utils';
import { PageProps } from '@inertiajs/core';
import { Icon } from '@iconify/react';
import { Link, router, usePage } from '@inertiajs/react';

type Notification = {
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

interface CustomPageProps extends PageProps {
    auth?: {
        investor?: {
            id: number;
            email: string;
            account_status: string;
            kyc_status?: 'not_submitted' | 'pending' | 'approved' | 'rejected';
        } | null;
    };
    platform_unread_notifications?: {
        investor?: number;
    };
    platform_recent_notifications?: {
        investor?: Notification[];
    };
}

export function InvestorHeader({
    activeTab = 'spotlight',
}: {
    activeTab?: 'home' | 'spotlight' | 'interests' | 'data-rooms' | 'diligence' | 'kyc' | 'notifications';
}) {
    const page = usePage<CustomPageProps>();
    const unreadNotifications = page.props.platform_unread_notifications?.investor ?? 0;
    const recentNotifications = page.props.platform_recent_notifications?.investor ?? [];
    const kycStatus = page.props.auth?.investor?.kyc_status;
    const kycRestricted = kycStatus != null && kycStatus !== 'approved';

    useNotificationPolling(true);

    function handleNotificationClick(notification: Notification) {
        const visit = () => {
            if (notification.data.destination_url) {
                router.visit(notification.data.destination_url);
            }
        };

        if (!notification.read_at) {
            router.patch(route('investor.notifications.read', notification.id), {}, {
                preserveScroll: true,
                onSuccess: visit,
            });
            return;
        }

        visit();
    }

    function markAllAsRead() {
        if (unreadNotifications === 0) return;
        router.patch(route('investor.notifications.read-all'), {}, { preserveScroll: true });
    }

    return (
        <header className="sticky top-0 z-40 border-b border-zinc-200/80 bg-white/80 backdrop-blur-xl">
            {kycRestricted && (
                <div className="border-b border-amber-200/80 bg-amber-50 px-4 py-2.5 text-center text-[12px] font-medium text-amber-900 sm:px-6">
                    {kycStatus === 'pending'
                        ? 'Identity verification is pending. You can browse Spotlight, but interest, diligence, data rooms, and pitch decks stay locked until approval.'
                        : kycStatus === 'rejected'
                          ? 'Identity verification was not approved. Update your documents to unlock protected investor actions.'
                          : 'Complete identity verification to unlock interest, diligence, data rooms, and pitch decks.'}{' '}
                    <Link href={route('investor.kyc.create')} className="font-bold underline underline-offset-2 hover:text-amber-950">
                        {kycStatus === 'pending' ? 'View status' : 'Verify identity'}
                    </Link>
                </div>
            )}
            <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
                <div className="flex items-center gap-10">
                    <Link href={route('investor.dashboard')} className="transition-opacity hover:opacity-80">
                        <PinpointLogo height={24} />
                    </Link>
                    <nav className="hidden items-center gap-1.5 md:flex">
                        <Link
                            href={route('investor.dashboard')}
                            className={cn(
                                'rounded-lg px-3 py-2 text-[13px] transition-colors',
                                activeTab === 'home'
                                    ? 'bg-zinc-100 font-semibold text-zinc-950'
                                    : 'font-medium text-zinc-500 hover:bg-zinc-50 hover:text-zinc-950',
                            )}
                        >
                            Home
                        </Link>
                        <Link
                            href={route('investor.spotlight.index')}
                            className={cn(
                                'rounded-lg px-3 py-2 text-[13px] transition-colors',
                                activeTab === 'spotlight'
                                    ? 'bg-zinc-100 font-semibold text-zinc-950'
                                    : 'font-medium text-zinc-500 hover:bg-zinc-50 hover:text-zinc-950',
                            )}
                        >
                            Spotlight
                        </Link>
                        <Link
                            href={route('investor.interests.index')}
                            className={cn(
                                'rounded-lg px-3 py-2 text-[13px] transition-colors',
                                activeTab === 'interests'
                                    ? 'bg-zinc-100 font-semibold text-zinc-950'
                                    : 'font-medium text-zinc-500 hover:bg-zinc-50 hover:text-zinc-950',
                            )}
                        >
                            My Interests
                        </Link>
                        <Link
                            href={route('investor.data-rooms.index')}
                            className={cn(
                                'rounded-lg px-3 py-2 text-[13px] transition-colors',
                                activeTab === 'data-rooms'
                                    ? 'bg-zinc-100 font-semibold text-zinc-950'
                                    : 'font-medium text-zinc-500 hover:bg-zinc-50 hover:text-zinc-950',
                            )}
                        >
                            Data Rooms
                        </Link>
                        <Link
                            href={route('investor.diligence.index')}
                            className={cn(
                                'rounded-lg px-3 py-2 text-[13px] transition-colors',
                                activeTab === 'diligence'
                                    ? 'bg-zinc-100 font-semibold text-zinc-950'
                                    : 'font-medium text-zinc-500 hover:bg-zinc-50 hover:text-zinc-950',
                            )}
                        >
                            Diligence
                        </Link>
                    </nav>
                </div>

                <div className="flex items-center gap-4">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <button
                                type="button"
                                className={cn(
                                    'relative flex size-8 items-center justify-center rounded-full transition-colors',
                                    'text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900',
                                )}
                            >
                                <Icon icon="solar:bell-bing-linear" className="size-5" />
                                {unreadNotifications > 0 && (
                                    <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full border-2 border-white bg-blue-600 px-1 text-[9px] font-bold text-white">
                                        {unreadNotifications > 99 ? '99+' : unreadNotifications}
                                    </span>
                                )}
                            </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-80 overflow-hidden rounded-2xl border-zinc-200 p-0 shadow-xl">
                            <div className="flex items-center justify-between border-b border-zinc-100 bg-zinc-50/50 px-4 py-3">
                                <span className="text-sm font-semibold text-zinc-900">Notifications</span>
                                <div className="flex items-center gap-3">
                                    {unreadNotifications > 0 && (
                                        <button
                                            type="button"
                                            onClick={markAllAsRead}
                                            className="text-[11px] font-semibold text-[#3A54A5] hover:underline"
                                        >
                                            Mark all as read
                                        </button>
                                    )}
                                    <Link
                                        href={route('investor.notifications.index')}
                                        className="text-[11px] font-semibold text-zinc-500 hover:text-zinc-900 hover:underline"
                                    >
                                        View all
                                    </Link>
                                </div>
                            </div>

                            {recentNotifications.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-8 text-center">
                                    <Icon icon="solar:bell-off-linear" className="mb-2 size-8 text-zinc-200" />
                                    <p className="text-sm font-medium text-zinc-900">No new alerts</p>
                                    <p className="text-xs text-zinc-500">You're all caught up!</p>
                                </div>
                            ) : (
                                <div className="no-scrollbar flex max-h-[400px] flex-col overflow-y-auto">
                                    {recentNotifications.map((notification) => {
                                        const isUnread = !notification.read_at;
                                        return (
                                            <button
                                                key={notification.id}
                                                type="button"
                                                onClick={() => handleNotificationClick(notification)}
                                                className={cn(
                                                    'flex items-start gap-3 border-b border-zinc-50 p-4 text-left transition-colors last:border-0 hover:bg-zinc-50',
                                                    isUnread ? 'bg-blue-50/30' : 'bg-white',
                                                )}
                                            >
                                                <div className="mt-1 flex w-2 shrink-0 justify-center">
                                                    {isUnread && <div className="size-1.5 rounded-full bg-blue-600" />}
                                                </div>
                                                <div className="flex-1">
                                                    <p
                                                        className={cn(
                                                            'text-[13px] font-semibold tracking-tight',
                                                            isUnread ? 'text-zinc-900' : 'text-zinc-700',
                                                        )}
                                                    >
                                                        {notification.data.title ??
                                                            notification.data.type?.replaceAll('_', ' ') ??
                                                            'Platform update'}
                                                    </p>
                                                    {notification.data.body && (
                                                        <p className="mt-0.5 line-clamp-2 text-[12px] leading-relaxed text-zinc-500">
                                                            {notification.data.body}
                                                        </p>
                                                    )}
                                                    <p className="mt-1.5 text-[10px] font-medium text-zinc-400">
                                                        {new Date(notification.created_at).toLocaleString(undefined, {
                                                            month: 'short',
                                                            day: 'numeric',
                                                            hour: 'numeric',
                                                            minute: '2-digit',
                                                        })}
                                                    </p>
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>
                            )}
                        </DropdownMenuContent>
                    </DropdownMenu>

                    <div className="h-4 w-px bg-zinc-200" />

                    <button
                        type="button"
                        onClick={() => router.post(route('investor.logout'))}
                        className="inline-flex items-center gap-2 text-[13px] font-medium text-zinc-500 transition-colors hover:text-zinc-900"
                    >
                        <Icon icon="solar:logout-2-linear" className="size-4" />
                        <span>Sign Out</span>
                    </button>
                </div>
            </div>
        </header>
    );
}
