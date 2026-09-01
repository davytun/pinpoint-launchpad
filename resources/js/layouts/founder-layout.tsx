import { Icon } from '@iconify/react';
import { Link, router, usePage } from '@inertiajs/react';
import { Menu, X } from 'lucide-react';
import { ReactNode, useEffect, useState } from 'react';

import GlobalLoader from '@/components/GlobalLoader';
import { PinpointLogo } from '@/components/pinpoint-logo';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

interface FounderLayoutProps {
    children: ReactNode;
    founder: {
        id?: number | string;
        full_name?: string | null;
        company_name?: string | null;
        email?: string;
    };
}

function NavItem({
    href,
    icon,
    label,
    active,
    badge,
    collapsed,
    onClick,
}: {
    href: string;
    icon: string;
    label: string;
    active: boolean;
    badge?: number;
    collapsed?: boolean;
    onClick?: () => void;
}) {
    const linkContent = (
        <Link
            href={href}
            onClick={onClick}
            className={cn(
                'group relative flex items-center transition-all duration-150',
                collapsed ? 'mx-auto h-10 w-10 justify-center rounded-xl' : 'gap-3.5 rounded-xl px-4 py-2.5 text-[14px]',
                active
                    ? 'bg-[#E3E3E6] font-semibold text-zinc-950 shadow-2xs'
                    : 'font-medium text-zinc-600 hover:bg-[#EAEAEA]/70 hover:text-zinc-950',
            )}
        >
            <div className="relative flex shrink-0 items-center justify-center">
                <Icon
                    icon={icon}
                    className={cn(
                        'size-5 shrink-0 transition-colors',
                        active ? 'stroke-[0.3] text-zinc-950' : 'text-zinc-500 group-hover:text-zinc-900',
                    )}
                />
                {collapsed && badge != null && badge > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-2 w-2 rounded-full bg-blue-600 ring-2 ring-[#F4F4F6]" />
                )}
            </div>

            {!collapsed && (
                <>
                    <span className="flex-1 truncate tracking-tight">{label}</span>
                    {badge != null && badge > 0 && (
                        <span
                            className={cn(
                                'ml-auto rounded-full bg-blue-600 px-2 py-0.2 text-[11px] font-bold text-white transition-colors',
                            )}
                        >
                            {badge > 99 ? '99+' : badge}
                        </span>
                    )}
                </>
            )}
        </Link>
    );

    if (collapsed) {
        return (
            <Tooltip delayDuration={150}>
                <TooltipTrigger asChild>{linkContent}</TooltipTrigger>
                <TooltipContent side="right" sideOffset={12} className="flex items-center gap-2 text-xs font-medium">
                    <span>{label}</span>
                    {badge != null && badge > 0 && (
                        <span className="rounded-full bg-blue-600 px-1.5 py-0.2 text-[10px] font-bold text-white">{badge}</span>
                    )}
                </TooltipContent>
            </Tooltip>
        );
    }

    return linkContent;
}

function NavSection({ label, collapsed }: { label: string; collapsed?: boolean }) {
    if (collapsed) {
        return <p className="mt-4 mb-1 text-[9px] font-extrabold tracking-wider text-zinc-400 uppercase text-center">{label}</p>;
    }
    return <p className="mt-6 mb-2 px-4 text-[10.5px] font-bold tracking-[0.14em] text-zinc-400 uppercase first:mt-2">{label}</p>;
}

function SidebarContent({
    founder,
    unreadMessages,
    unreadNotifications,
    isActive,
    collapsed,
    toggleCollapse,
    logout,
    onNav,
}: {
    founder: FounderLayoutProps['founder'];
    unreadMessages: number;
    unreadNotifications: number;
    isActive: (path: string) => boolean;
    collapsed: boolean;
    toggleCollapse: () => void;
    logout: () => void;
    onNav?: () => void;
}) {
    const initials = founder?.full_name
        ? founder.full_name
              .split(' ')
              .map((n) => n[0])
              .join('')
              .toUpperCase()
              .slice(0, 2)
        : 'F';

    return (
        <TooltipProvider delayDuration={150}>
            <div className="flex h-full flex-col justify-between">
                <div>
                    {/* Brand Header */}
                    <div
                        className={cn(
                            'group mb-3 flex cursor-pointer items-center transition-all',
                            collapsed ? 'justify-center py-2' : 'justify-between gap-3 rounded-2xl px-3.5 py-2.5 hover:bg-[#EAEAEA]/70',
                        )}
                        onClick={collapsed ? toggleCollapse : undefined}
                    >
                        {collapsed ? (
                            <Tooltip delayDuration={150}>
                                <TooltipTrigger asChild>
                                    <button
                                        type="button"
                                        onClick={toggleCollapse}
                                        className="flex h-9 w-9 items-center justify-center rounded-xl transition-colors hover:bg-[#EAEAEA]/70"
                                    >
                                        <img src="/favicon.ico" alt="Pinpoint" className="h-6.5 w-6.5 rounded-full object-contain shadow-2xs" />
                                    </button>
                                </TooltipTrigger>
                                <TooltipContent side="right" sideOffset={12}>
                                    <p className="text-xs font-semibold">Expand Sidebar (⌘B / Ctrl+B)</p>
                                </TooltipContent>
                            </Tooltip>
                        ) : (
                            <>
                                <PinpointLogo height={24} />
                                <button
                                    type="button"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        toggleCollapse?.();
                                    }}
                                    title="Collapse sidebar (⌘B / Ctrl+B)"
                                    className="flex h-7 w-7 items-center justify-center rounded-lg text-zinc-400 transition-colors hover:bg-[#E1E1E4] hover:text-zinc-900"
                                >
                                    <Icon icon="solar:sidebar-minimalistic-linear" className="size-4" />
                                </button>
                            </>
                        )}
                    </div>

                    {/* Navigation Stream */}
                    <nav className="space-y-0.5" aria-label="Main Navigation">
                        <NavItem
                            href={route('founder.dashboard')}
                            icon="solar:widget-2-linear"
                            label="Dashboard"
                            active={isActive('/founder/dashboard')}
                            collapsed={collapsed}
                            onClick={onNav}
                        />

                        <NavItem
                            href={route('founder.documents.index')}
                            icon="solar:document-text-linear"
                            label="Documents"
                            active={isActive('/founder/documents')}
                            collapsed={collapsed}
                            onClick={onNav}
                        />

                        <NavItem
                            href={route('founder.messages.index')}
                            icon="solar:chat-round-dots-linear"
                            label="Messages"
                            active={isActive('/founder/messages')}
                            collapsed={collapsed}
                            onClick={onNav}
                            badge={unreadMessages}
                        />

                        <NavItem
                            href={route('founder.notifications.index')}
                            icon="solar:bell-bing-linear"
                            label="Alerts"
                            active={isActive('/founder/notifications')}
                            collapsed={collapsed}
                            onClick={onNav}
                            badge={unreadNotifications}
                        />


                        <NavItem
                            href={route('founder.spotlight.edit')}
                            icon="solar:crown-star-linear"
                            label="Spotlight Profile"
                            active={isActive('/founder/spotlight')}
                            collapsed={collapsed}
                            onClick={onNav}
                        />
                    </nav>
                </div>

                {/* Bottom Founder Profile Card */}
                <div className="mt-auto shrink-0 border-t border-zinc-200/60 pt-2 pb-1">
                    {collapsed ? (
                        <Tooltip delayDuration={150}>
                            <TooltipTrigger asChild>
                                <button
                                    onClick={logout}
                                    className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-zinc-950 text-xs font-bold text-white shadow-2xs transition-opacity hover:opacity-85"
                                >
                                    {initials}
                                </button>
                            </TooltipTrigger>
                            <TooltipContent side="right" sideOffset={12} className="flex flex-col gap-0.5">
                                <p className="text-xs font-bold">{founder.full_name ?? 'Founder'}</p>
                                <p className="text-[10px] text-zinc-400">{founder.company_name ?? founder.email}</p>
                                <p className="mt-1 text-[10px] font-semibold text-red-400">Click to Sign Out</p>
                            </TooltipContent>
                        </Tooltip>
                    ) : (
                        <div className="group flex items-center justify-between gap-3 rounded-2xl px-3 py-2.5 transition-colors hover:bg-[#EAEAEA]/70">
                            <div className="flex min-w-0 items-center gap-3">
                                <div className="flex h-8.5 w-8.5 shrink-0 items-center justify-center rounded-full bg-zinc-950 text-xs font-bold text-white shadow-2xs">
                                    {initials}
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className="truncate text-[13.5px] leading-tight font-semibold text-zinc-950">
                                        {founder.full_name ?? 'Founder'}
                                    </p>
                                    <p className="mt-0.5 truncate text-[11px] leading-none font-medium text-zinc-400">
                                        {founder.company_name ?? founder.email}
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={logout}
                                title="Sign Out"
                                className="flex h-7.5 w-7.5 shrink-0 items-center justify-center rounded-lg text-zinc-400 transition-colors hover:bg-[#E1E1E4] hover:text-zinc-900"
                            >
                                <Icon icon="solar:logout-2-linear" className="size-4" />
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </TooltipProvider>
    );
}

export default function FounderLayout({ children, founder }: FounderLayoutProps) {
    const { url } = usePage();
    const unreadNotifications =
        usePage<{ platform_unread_notifications?: { founder?: number } }>().props.platform_unread_notifications?.founder ?? 0;
    const unreadMessages = usePage<{ unread_messages_count?: number }>().props.unread_messages_count ?? 0;

    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [collapsed, setCollapsed] = useState<boolean>(() => {
        try {
            return localStorage.getItem('founder_sidebar_collapsed') === 'true';
        } catch {
            return false;
        }
    });

    function toggleCollapse() {
        setCollapsed((prev) => {
            const next = !prev;
            try {
                localStorage.setItem('founder_sidebar_collapsed', next ? 'true' : 'false');
            } catch {
                /* ignore */
            }
            return next;
        });
    }

    // Keyboard shortcut handler: ⌘B / Ctrl+B
    useEffect(() => {
        function handleKeyDown(e: KeyboardEvent) {
            if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'b') {
                e.preventDefault();
                toggleCollapse();
            }
        }
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    useEffect(() => {
        setSidebarOpen(false);
    }, [url]);

    function logout() {
        router.post(route('founder.logout'));
    }

    function isActive(path: string) {
        if (path === '/founder/dashboard' || path === '/founder' || path === '/founder/') {
            return url === '/founder/dashboard' || url === '/founder' || url === '/founder/';
        }
        return url === path || url.startsWith(path + '/') || url.startsWith(path + '?');
    }

    const sidebarProps = {
        founder,
        unreadMessages,
        unreadNotifications,
        isActive,
        collapsed,
        toggleCollapse,
        logout,
    };

    return (
        <div className="flex h-screen max-h-screen flex-col gap-3.5 overflow-hidden bg-[#F4F4F6] p-3 text-zinc-900 antialiased selection:bg-zinc-900 selection:text-white lg:flex-row lg:p-3.5">
            <GlobalLoader />

            {/* ── Desktop Sidebar ── */}
            <aside
                className={cn(
                    'no-scrollbar hidden h-full max-h-full shrink-0 flex-col justify-between overflow-hidden py-2 transition-all duration-200 ease-in-out select-none lg:flex',
                    collapsed ? 'w-16 px-1' : 'w-72 px-1.5',
                )}
            >
                <SidebarContent {...sidebarProps} />
            </aside>

            {/* ── Mobile Sidebar Drawer ── */}
            {sidebarOpen && (
                <div className="fixed inset-0 z-50 lg:hidden" aria-modal="true">
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-xs" onClick={() => setSidebarOpen(false)} />
                    <aside className="no-scrollbar absolute inset-y-0 left-0 flex w-80 flex-col border-r border-zinc-200/80 bg-[#F4F4F6] p-4 shadow-2xl">
                        <button
                            onClick={() => setSidebarOpen(false)}
                            className="absolute top-4 right-4 flex h-8 w-8 items-center justify-center rounded-xl text-zinc-400 hover:bg-zinc-200 hover:text-zinc-700"
                        >
                            <X className="size-4" />
                        </button>
                        <SidebarContent {...sidebarProps} collapsed={false} onNav={() => setSidebarOpen(false)} />
                    </aside>
                </div>
            )}

            {/* ── Mobile Header ── */}
            <header className="flex h-12 shrink-0 items-center justify-between rounded-2xl bg-white px-4 shadow-xs lg:hidden">
                <button
                    onClick={() => setSidebarOpen(true)}
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-600 hover:bg-zinc-100"
                >
                    <Menu className="size-5" />
                </button>
                <PinpointLogo height={20} />
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-zinc-950 text-xs font-bold text-white">
                    {founder?.full_name?.[0] ?? 'F'}
                </div>
            </header>

            {/* ── Main Canvas Content Region (Strictly h-full, zero outer scroll) ─── */}
            <main className="relative flex h-full max-h-full min-w-0 flex-1 flex-col">
                {/* ── Expand Sidebar Button (Floating on Left Edge) ── */}
                {collapsed && (
                    <div className="absolute top-6 -left-4 z-50 hidden lg:flex">
                        <TooltipProvider>
                            <Tooltip delayDuration={150}>
                                <TooltipTrigger asChild>
                                    <button
                                        onClick={toggleCollapse}
                                        className="flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-200/80 bg-white text-zinc-600 shadow-sm ring-4 ring-[#F4F4F6] transition-all hover:bg-zinc-50 hover:text-zinc-900"
                                    >
                                        <Icon icon="solar:sidebar-minimalistic-linear" className="size-4.5" />
                                    </button>
                                </TooltipTrigger>
                                <TooltipContent side="right">Expand Sidebar (⌘B / Ctrl+B)</TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    </div>
                )}

                <div className="no-scrollbar relative flex h-full max-h-full min-w-0 flex-1 flex-col overflow-hidden rounded-[24px] bg-white p-6 shadow-[0_1px_3px_rgba(0,0,0,0.03)] lg:p-8">
                    {children}
                </div>
            </main>
        </div>
    );
}
