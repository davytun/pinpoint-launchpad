import { Icon } from '@iconify/react';
import { Link, router, usePage } from '@inertiajs/react';
import { Menu, X } from 'lucide-react';
import { ReactNode, useEffect, useState } from 'react';

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useNotificationPolling } from '@/hooks/use-notification-polling';
import { cn } from '@/lib/utils';

type AdminRole = 'superadmin' | 'analyst' | 'support' | 'compliance' | 'investor_relations';
type AdminDesk = 'platform' | 'founder' | 'investors';

interface AdminUser {
    id: number;
    name: string;
    email: string;
    role: AdminRole;
}

interface AdminLayoutProps {
    children: ReactNode;
}

function resolveDesk(url: string, role: AdminRole): AdminDesk {
    if (url.startsWith('/admin/founder')) {
        return 'founder';
    }
    if (url.startsWith('/admin/investors')) {
        return 'investors';
    }

    // Shared alerts live outside desk prefixes — keep specialists on their shell.
    if (url.startsWith('/admin/notifications')) {
        if (role === 'analyst') {
            return 'founder';
        }
        if (role === 'compliance' || role === 'investor_relations') {
            return 'investors';
        }
    }

    return 'platform';
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
                                'ml-auto text-[13px] font-normal tabular-nums transition-colors',
                                active ? 'font-medium text-zinc-800' : 'text-zinc-400 group-hover:text-zinc-600',
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
                        <span className="py-0.2 rounded-full bg-blue-600 px-1.5 text-[10px] font-bold text-white">{badge}</span>
                    )}
                </TooltipContent>
            </Tooltip>
        );
    }

    return linkContent;
}

function NavSection({ label, collapsed }: { label: string; collapsed?: boolean }) {
    if (collapsed) {
        return <div className="mx-2 my-2 border-t border-zinc-200/60" />;
    }
    return <p className="mt-6 mb-2 px-4 text-[10.5px] font-bold tracking-[0.14em] text-zinc-400 uppercase first:mt-2">{label}</p>;
}

function DeskSwitcher({
    desk,
    collapsed,
    onNav,
}: {
    desk: AdminDesk;
    collapsed?: boolean;
    onNav?: () => void;
}) {
    const desks: { id: AdminDesk; href: string; label: string; short: string }[] = [
        { id: 'platform', href: '/admin', label: 'Platform', short: 'P' },
        { id: 'founder', href: '/admin/founder', label: 'Founder', short: 'F' },
        { id: 'investors', href: '/admin/investors', label: 'Investors', short: 'I' },
    ];

    if (collapsed) {
        return (
            <div className="mb-2 flex flex-col items-center gap-1">
                {desks.map((item) => (
                    <Tooltip key={item.id} delayDuration={150}>
                        <TooltipTrigger asChild>
                            <Link
                                href={item.href}
                                onClick={onNav}
                                className={cn(
                                    'flex h-8 w-8 items-center justify-center rounded-lg text-[11px] font-bold transition-colors',
                                    desk === item.id
                                        ? 'bg-zinc-950 text-white'
                                        : 'bg-zinc-200/70 text-zinc-600 hover:bg-zinc-300/80 hover:text-zinc-900',
                                )}
                            >
                                {item.short}
                            </Link>
                        </TooltipTrigger>
                        <TooltipContent side="right" sideOffset={12}>
                            {item.label} desk
                        </TooltipContent>
                    </Tooltip>
                ))}
            </div>
        );
    }

    return (
        <div className="mb-3 grid grid-cols-3 gap-1 rounded-xl bg-zinc-200/50 p-1">
            {desks.map((item) => (
                <Link
                    key={item.id}
                    href={item.href}
                    onClick={onNav}
                    className={cn(
                        'rounded-lg px-1.5 py-1.5 text-center text-[11px] font-semibold transition-colors',
                        desk === item.id
                            ? 'bg-white text-zinc-950 shadow-2xs'
                            : 'text-zinc-500 hover:text-zinc-800',
                    )}
                >
                    {item.label}
                </Link>
            ))}
        </div>
    );
}

function SidebarContent({
    user,
    desk,
    isSuperAdmin,
    isAnalyst,
    isCompliance,
    isInvestorRelations,
    unreadMessages,
    unreadNotifications,
    isActive,
    isExactActive,
    collapsed,
    toggleCollapse,
    logout,
    onNav,
}: {
    user: AdminUser | null;
    desk: AdminDesk;
    isSuperAdmin: boolean;
    isAnalyst: boolean;
    isCompliance: boolean;
    isInvestorRelations: boolean;
    unreadMessages: number;
    unreadNotifications: number;
    isActive: (path: string) => boolean;
    isExactActive: (path: string) => boolean;
    collapsed?: boolean;
    toggleCollapse?: () => void;
    logout: () => void;
    onNav?: () => void;
}) {
    const showFounderNav = desk === 'founder' && (isSuperAdmin || isAnalyst);
    const showInvestorNav = desk === 'investors' && (isSuperAdmin || isCompliance || isInvestorRelations);
    const showPlatformNav = desk === 'platform' && isSuperAdmin;

    return (
        <TooltipProvider>
            <div className="flex h-full min-h-0 flex-col justify-between overflow-hidden">
                <div className="shrink-0">
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
                                        onClick={toggleCollapse}
                                        className="flex h-9 w-9 items-center justify-center rounded-xl transition-colors hover:bg-[#EAEAEA]/70"
                                    >
                                        <img src="/favicon.ico" alt="Pinpoint" className="h-6.5 w-6.5 rounded-lg object-contain shadow-2xs" />
                                    </button>
                                </TooltipTrigger>
                                <TooltipContent side="right" sideOffset={12}>
                                    <p className="text-xs font-semibold">Expand Sidebar (⌘B / Ctrl+B)</p>
                                </TooltipContent>
                            </Tooltip>
                        ) : (
                            <>
                                <img
                                    src="/pinpoint-logo.png"
                                    alt="Pinpoint Launchpad"
                                    className="h-6.5 w-auto max-w-37.5 object-contain select-none"
                                />
                                <div className="flex items-center gap-1">
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            toggleCollapse?.();
                                        }}
                                        title="Collapse sidebar (⌘B / Ctrl+B)"
                                        className="flex h-7 w-7 items-center justify-center rounded-lg text-zinc-400 transition-colors hover:bg-[#E1E1E4] hover:text-zinc-900"
                                    >
                                        <Icon icon="solar:sidebar-minimalistic-linear" className="size-4" />
                                    </button>
                                </div>
                            </>
                        )}
                    </div>

                    {isSuperAdmin && <DeskSwitcher desk={desk} collapsed={collapsed} onNav={onNav} />}
                </div>

                <div className="no-scrollbar min-h-0 flex-1 overflow-y-auto py-1">
                    <nav className="flex flex-col space-y-1">
                        {showPlatformNav && (
                            <>
                                <NavSection label="Platform" collapsed={collapsed} />
                                <NavItem
                                    href="/admin"
                                    icon="solar:widget-2-linear"
                                    label="Dashboard"
                                    active={isExactActive('/admin')}
                                    collapsed={collapsed}
                                    onClick={onNav}
                                />
                                <NavItem
                                    href="/admin/notifications"
                                    icon="solar:bell-bing-linear"
                                    label="Alerts"
                                    active={isActive('/admin/notifications')}
                                    collapsed={collapsed}
                                    onClick={onNav}
                                    badge={unreadNotifications}
                                />
                                <NavSection label="Operations" collapsed={collapsed} />
                                <NavItem
                                    href="/admin/pia-requests"
                                    icon="solar:document-add-linear"
                                    label="PIA Requests"
                                    active={isActive('/admin/pia-requests')}
                                    collapsed={collapsed}
                                    onClick={onNav}
                                />
                                <NavSection label="Admin" collapsed={collapsed} />
                                <NavItem
                                    href="/admin/revenue"
                                    icon="solar:wallet-money-linear"
                                    label="Revenue"
                                    active={isActive('/admin/revenue')}
                                    collapsed={collapsed}
                                    onClick={onNav}
                                />
                                <NavItem
                                    href="/admin/blog"
                                    icon="solar:document-text-linear"
                                    label="Blog"
                                    active={isActive('/admin/blog')}
                                    collapsed={collapsed}
                                    onClick={onNav}
                                />
                                <NavItem
                                    href="/admin/users"
                                    icon="solar:shield-user-linear"
                                    label="Team"
                                    active={isActive('/admin/users')}
                                    collapsed={collapsed}
                                    onClick={onNav}
                                />
                                <NavItem
                                    href="/admin/settings"
                                    icon="solar:settings-linear"
                                    label="Settings"
                                    active={isActive('/admin/settings')}
                                    collapsed={collapsed}
                                    onClick={onNav}
                                />
                            </>
                        )}

                        {showFounderNav && (
                            <>
                                <NavSection label="Founder desk" collapsed={collapsed} />
                                <NavItem
                                    href="/admin/founder"
                                    icon="solar:widget-2-linear"
                                    label="Dashboard"
                                    active={isExactActive('/admin/founder')}
                                    collapsed={collapsed}
                                    onClick={onNav}
                                />
                                <NavItem
                                    href="/admin/founder/pia-requests"
                                    icon="solar:card-send-linear"
                                    label="PIA Requests"
                                    active={isActive('/admin/founder/pia-requests')}
                                    collapsed={collapsed}
                                    onClick={onNav}
                                />
                                <NavItem
                                    href="/admin/founder/messages"
                                    icon="solar:inbox-linear"
                                    label="Messages"
                                    active={isActive('/admin/founder/messages')}
                                    collapsed={collapsed}
                                    onClick={onNav}
                                    badge={unreadMessages}
                                />
                                <NavItem
                                    href="/admin/notifications"
                                    icon="solar:bell-bing-linear"
                                    label="Alerts"
                                    active={isActive('/admin/notifications')}
                                    collapsed={collapsed}
                                    onClick={onNav}
                                    badge={unreadNotifications}
                                />
                                <NavSection label="Audits" collapsed={collapsed} />
                                <NavItem
                                    href="/admin/founder/founders"
                                    icon="solar:user-speak-linear"
                                    label="Founders"
                                    active={isActive('/admin/founder/founders')}
                                    collapsed={collapsed}
                                    onClick={onNav}
                                />
                                <NavItem
                                    href="/admin/founder/profiles"
                                    icon="solar:medal-ribbons-star-linear"
                                    label="Profiles"
                                    active={isActive('/admin/founder/profiles')}
                                    collapsed={collapsed}
                                    onClick={onNav}
                                />
                                <NavItem
                                    href="/admin/founder/questions"
                                    icon="solar:question-circle-linear"
                                    label="Questions"
                                    active={isActive('/admin/founder/questions')}
                                    collapsed={collapsed}
                                    onClick={onNav}
                                />
                            </>
                        )}

                        {showInvestorNav && (
                            <>
                                <NavSection label="Investor desk" collapsed={collapsed} />
                                <NavItem
                                    href="/admin/investors"
                                    icon="solar:widget-2-linear"
                                    label="Dashboard"
                                    active={isExactActive('/admin/investors')}
                                    collapsed={collapsed}
                                    onClick={onNav}
                                />
                                <NavItem
                                    href="/admin/notifications"
                                    icon="solar:bell-bing-linear"
                                    label="Alerts"
                                    active={isActive('/admin/notifications')}
                                    collapsed={collapsed}
                                    onClick={onNav}
                                    badge={unreadNotifications}
                                />
                                <NavSection label="Accounts" collapsed={collapsed} />
                                <NavItem
                                    href="/admin/investors/accounts"
                                    icon="solar:clipboard-list-linear"
                                    label="Applications"
                                    active={isActive('/admin/investors/accounts')}
                                    collapsed={collapsed}
                                    onClick={onNav}
                                />
                                {(isSuperAdmin || isCompliance) && (
                                    <NavItem
                                        href="/admin/investors/accounts?kyc_status=pending"
                                        icon="solar:shield-check-linear"
                                        label="KYC Reviews"
                                        active={isActive('/admin/investors/accounts')}
                                        collapsed={collapsed}
                                        onClick={onNav}
                                    />
                                )}
                                {(isSuperAdmin || isInvestorRelations) && (
                                    <>
                                        <NavSection label="Dealflow" collapsed={collapsed} />
                                        <NavItem
                                            href="/admin/investors/spotlight"
                                            icon="solar:crown-star-linear"
                                            label="Spotlight"
                                            active={isActive('/admin/investors/spotlight')}
                                            collapsed={collapsed}
                                            onClick={onNav}
                                        />
                                        <NavItem
                                            href="/admin/investors/dealflow/interests"
                                            icon="solar:hand-money-linear"
                                            label="Interests"
                                            active={isActive('/admin/investors/dealflow/interests')}
                                            collapsed={collapsed}
                                            onClick={onNav}
                                        />
                                        <NavItem
                                            href="/admin/investors/dealflow/data-rooms"
                                            icon="solar:folder-with-files-linear"
                                            label="Data Rooms"
                                            active={isActive('/admin/investors/dealflow/data-rooms')}
                                            collapsed={collapsed}
                                            onClick={onNav}
                                        />
                                        <NavItem
                                            href="/admin/investors/dealflow/diligence"
                                            icon="solar:document-medicine-linear"
                                            label="Diligence"
                                            active={isActive('/admin/investors/dealflow/diligence')}
                                            collapsed={collapsed}
                                            onClick={onNav}
                                        />
                                        <NavItem
                                            href="/admin/investors/announcements"
                                            icon="solar:megaphone-linear"
                                            label="Announcements"
                                            active={isActive('/admin/investors/announcements')}
                                            collapsed={collapsed}
                                            onClick={onNav}
                                        />
                                    </>
                                )}
                            </>
                        )}
                    </nav>
                </div>

                <div className="mt-auto shrink-0 border-t border-zinc-200/60 pt-2 pb-1">
                    {collapsed ? (
                        <Tooltip delayDuration={150}>
                            <TooltipTrigger asChild>
                                <button
                                    onClick={logout}
                                    className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-zinc-950 text-xs font-bold text-white shadow-2xs transition-opacity hover:opacity-85"
                                >
                                    {user?.name?.[0] ?? 'A'}
                                </button>
                            </TooltipTrigger>
                            <TooltipContent side="right" sideOffset={12} className="flex flex-col gap-0.5">
                                <p className="text-xs font-bold">{user?.name ?? 'Admin'}</p>
                                <p className="text-[10px] text-zinc-400">{user?.email ?? ''}</p>
                                <p className="mt-1 text-[10px] font-semibold text-red-400">Click to Sign Out</p>
                            </TooltipContent>
                        </Tooltip>
                    ) : (
                        <div className="group flex items-center justify-between gap-3 rounded-2xl px-3 py-2.5 transition-colors hover:bg-[#EAEAEA]/70">
                            <div className="flex min-w-0 items-center gap-3">
                                <div className="flex h-8.5 w-8.5 shrink-0 items-center justify-center rounded-full bg-zinc-950 text-xs font-bold text-white shadow-2xs">
                                    {user?.name?.[0] ?? 'A'}
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className="truncate text-[13.5px] leading-tight font-semibold text-zinc-950">{user?.name ?? 'Admin'}</p>
                                    <p className="mt-0.5 truncate text-[11px] leading-none font-medium text-zinc-400">{user?.email ?? ''}</p>
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

export default function AdminLayout({ children }: AdminLayoutProps) {
    const { auth, admin_unread_messages, platform_unread_notifications } = usePage<{
        auth: { user: AdminUser };
        admin_unread_messages?: number;
        platform_unread_notifications?: { admin?: number };
    }>().props;

    const user = auth?.user ?? null;
    const currentUrl = usePage().url as string;
    const role = user?.role ?? 'analyst';
    const unreadMessages = admin_unread_messages ?? 0;
    const unreadNotifications = platform_unread_notifications?.admin ?? 0;
    const desk = resolveDesk(currentUrl, role);

    useNotificationPolling(Boolean(user));

    const isSuperAdmin = role === 'superadmin';
    const isAnalyst = role === 'analyst';
    const isCompliance = role === 'compliance';
    const isInvestorRelations = role === 'investor_relations';

    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [collapsed, setCollapsed] = useState<boolean>(() => {
        try {
            return localStorage.getItem('admin_sidebar_collapsed') === 'true';
        } catch {
            return false;
        }
    });

    function toggleCollapse() {
        setCollapsed((prev) => {
            const next = !prev;
            try {
                localStorage.setItem('admin_sidebar_collapsed', next ? 'true' : 'false');
            } catch {
                // Ignore localStorage errors
            }
            return next;
        });
    }

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
    }, [currentUrl]);

    useEffect(() => {
        if (sidebarOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [sidebarOpen]);

    function logout() {
        router.post('/logout');
    }

    function isExactActive(path: string) {
        const clean = currentUrl.split('?')[0].replace(/\/$/, '') || '/';
        const target = path.replace(/\/$/, '') || '/';
        return clean === target;
    }

    function isActive(path: string) {
        if (path === '/admin' || path === '/admin/') {
            return isExactActive('/admin');
        }
        if (path === '/admin/founder' || path === '/admin/investors') {
            return isExactActive(path);
        }
        return currentUrl === path || currentUrl.startsWith(path + '/') || currentUrl.startsWith(path + '?');
    }

    const sidebarProps = {
        user,
        desk,
        isSuperAdmin,
        isAnalyst,
        isCompliance,
        isInvestorRelations,
        unreadMessages,
        unreadNotifications,
        isActive,
        isExactActive,
        collapsed,
        toggleCollapse,
        logout,
    };

    const showMobileMessages = desk === 'founder' && (isSuperAdmin || isAnalyst);

    return (
        <div className="flex h-screen max-h-screen flex-col gap-3.5 overflow-hidden bg-[#F4F4F6] p-3 text-zinc-900 antialiased selection:bg-zinc-900 selection:text-white lg:flex-row lg:p-3.5">
            <aside
                className={cn(
                    'no-scrollbar hidden h-full max-h-full shrink-0 flex-col justify-between overflow-hidden py-2 transition-all duration-200 ease-in-out select-none lg:flex',
                    collapsed ? 'w-16 px-1' : 'w-72 px-1.5',
                )}
            >
                <SidebarContent {...sidebarProps} />
            </aside>

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

            <main className="relative flex h-full max-h-full min-w-0 flex-1 flex-col">
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

                <header className="mb-3 flex h-14 shrink-0 items-center gap-3 rounded-2xl border border-zinc-200/80 bg-white px-5 shadow-2xs lg:hidden">
                    <button
                        onClick={() => setSidebarOpen(true)}
                        className="flex h-9 w-9 items-center justify-center rounded-xl border border-zinc-200 bg-zinc-50 text-zinc-700 hover:bg-zinc-100"
                        aria-label="Open menu"
                    >
                        <Menu className="size-5" />
                    </button>
                    <img src="/pinpoint-logo.png" alt="Pinpoint" className="h-5 w-auto object-contain" />
                    {showMobileMessages && unreadMessages > 0 && (
                        <Link
                            href="/admin/founder/messages"
                            className="ml-auto flex items-center gap-1.5 rounded-full bg-zinc-900 px-2.5 py-0.5 text-[11px] font-bold text-white"
                        >
                            <Icon icon="solar:inbox-linear" className="size-3.5" />
                            {unreadMessages}
                        </Link>
                    )}
                </header>

                <div className="relative z-0 flex h-full max-h-full min-w-0 flex-1 flex-col overflow-hidden">{children}</div>
            </main>
        </div>
    );
}
