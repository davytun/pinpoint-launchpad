import { Icon } from '@iconify/react';
import { Link, router, usePage } from '@inertiajs/react';
import { Menu, X } from 'lucide-react';
import { ReactNode, useEffect, useState } from 'react';

import GlobalLoader from '@/components/GlobalLoader';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

interface AdminUser {
    id: number;
    name: string;
    email: string;
    role: 'superadmin' | 'analyst' | 'support' | 'compliance' | 'investor_relations';
}

interface AdminLayoutProps {
    children: ReactNode;
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

function SidebarContent({
    user,
    isSuperAdmin,
    isAnalyst,
    isSupport,
    isCompliance,
    isInvestorRelations,
    unreadMessages,
    unreadNotifications,
    isActive,
    collapsed,
    toggleCollapse,
    logout,
    onNav,
}: {
    user: AdminUser | null;
    isSuperAdmin: boolean;
    isAnalyst: boolean;
    isSupport: boolean;
    isCompliance: boolean;
    isInvestorRelations: boolean;
    unreadMessages: number;
    unreadNotifications: number;
    isActive: (path: string) => boolean;
    collapsed?: boolean;
    toggleCollapse?: () => void;
    logout: () => void;
    onNav?: () => void;
}) {
    return (
        <TooltipProvider>
            <div className="flex h-full min-h-0 flex-col justify-between overflow-hidden">
                {/* Top Workspace Header (Fixed) */}
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
                </div>

                {/* Navigation Links (Scrollable without visible scrollbars) */}
                <div className="no-scrollbar min-h-0 flex-1 overflow-y-auto py-1">
                    <nav className="flex flex-col space-y-1">
                        <NavSection label="Main" collapsed={collapsed} />
                        <NavItem
                            href="/admin"
                            icon="solar:widget-2-linear"
                            label="Dashboard"
                            active={isActive('/admin')}
                            collapsed={collapsed}
                            onClick={onNav}
                        />
                        <NavItem
                            href="/admin/messages"
                            icon="solar:inbox-linear"
                            label="Messages"
                            active={isActive('/admin/messages')}
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

                        {(isSuperAdmin || isSupport) && (
                            <>
                                <NavSection label="Operations" collapsed={collapsed} />
                                <NavItem
                                    href="/admin/waitlist"
                                    icon="solar:users-group-rounded-linear"
                                    label="Waitlist"
                                    active={isActive('/admin/waitlist')}
                                    collapsed={collapsed}
                                    onClick={onNav}
                                />
                                <NavItem
                                    href="/admin/investor-accounts"
                                    icon="solar:clipboard-list-linear"
                                    label="Applications"
                                    active={isActive('/admin/investor-accounts')}
                                    collapsed={collapsed}
                                    onClick={onNav}
                                />
                                {isSuperAdmin && (
                                    <NavItem
                                        href="/admin/pia-requests"
                                        icon="solar:document-add-linear"
                                        label="PIA Requests"
                                        active={isActive('/admin/pia-requests')}
                                        collapsed={collapsed}
                                        onClick={onNav}
                                    />
                                )}
                            </>
                        )}

                        {(isSuperAdmin || isInvestorRelations || isCompliance) && (
                            <>
                                <NavSection label="Investors" collapsed={collapsed} />
                                <NavItem
                                    href="/admin/investor-accounts?kyc_status=pending"
                                    icon="solar:shield-check-linear"
                                    label="KYC Reviews"
                                    active={isActive('/admin/investor-accounts')}
                                    collapsed={collapsed}
                                    onClick={onNav}
                                />
                            </>
                        )}

                        {(isSuperAdmin || isInvestorRelations) && (
                            <>
                                <NavSection label="Dealflow" collapsed={collapsed} />
                                <NavItem
                                    href="/admin/spotlight"
                                    icon="solar:crown-star-linear"
                                    label="Spotlight"
                                    active={isActive('/admin/spotlight')}
                                    collapsed={collapsed}
                                    onClick={onNav}
                                />
                                <NavItem
                                    href="/admin/dealflow/interests"
                                    icon="solar:hand-money-linear"
                                    label="Interests"
                                    active={isActive('/admin/dealflow/interests')}
                                    collapsed={collapsed}
                                    onClick={onNav}
                                />
                                <NavItem
                                    href="/admin/dealflow/data-rooms"
                                    icon="solar:folder-with-files-linear"
                                    label="Data Rooms"
                                    active={isActive('/admin/dealflow/data-rooms')}
                                    collapsed={collapsed}
                                    onClick={onNav}
                                />
                            </>
                        )}

                        {(isSuperAdmin || isAnalyst) && (
                            <>
                                {!isSuperAdmin && <NavSection label="Audits" />}
                                <NavItem
                                    href="/admin/founders"
                                    icon="solar:user-speak-linear"
                                    label="Founders"
                                    active={isActive('/admin/founders')}
                                    collapsed={collapsed}
                                    onClick={onNav}
                                />
                                <NavItem
                                    href="/admin/profiles"
                                    icon="solar:medal-ribbons-star-linear"
                                    label="Profiles"
                                    active={isActive('/admin/profiles')}
                                    collapsed={collapsed}
                                    onClick={onNav}
                                />
                            </>
                        )}

                        {isSuperAdmin && (
                            <>
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
                    </nav>
                </div>

                {/* Bottom User Area (Fixed) */}
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
    const role = user?.role ?? 'support';
    const unreadMessages = admin_unread_messages ?? 0;
    const unreadNotifications = platform_unread_notifications?.admin ?? 0;

    const isSuperAdmin = role === 'superadmin';
    const isAnalyst = role === 'analyst';
    const isSupport = role === 'support';
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

    function isActive(path: string) {
        if (path === '/admin' || path === '/admin/') {
            return currentUrl === '/admin' || currentUrl === '/admin/';
        }
        return currentUrl === path || currentUrl.startsWith(path + '/') || currentUrl.startsWith(path + '?');
    }

    const sidebarProps = {
        user,
        role,
        isSuperAdmin,
        isAnalyst,
        isSupport,
        isCompliance,
        isInvestorRelations,
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
            {/* ── Desktop Sidebar (Strictly bounded height, no scrollbar visible) ── */}
            <aside
                className={cn(
                    'no-scrollbar hidden h-full max-h-full shrink-0 flex-col justify-between overflow-hidden py-2 transition-all duration-200 ease-in-out select-none lg:flex',
                    collapsed ? 'w-16 px-1' : 'w-72 px-1.5',
                )}
            >
                <SidebarContent {...sidebarProps} />
            </aside>

            {/* ── Mobile Sidebar Drawer ────────────────────────────────────── */}
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

                {/* Mobile top bar */}
                <header className="mb-3 flex h-14 shrink-0 items-center gap-3 rounded-2xl border border-zinc-200/80 bg-white px-5 shadow-2xs lg:hidden">
                    <button
                        onClick={() => setSidebarOpen(true)}
                        className="flex h-9 w-9 items-center justify-center rounded-xl border border-zinc-200 bg-zinc-50 text-zinc-700 hover:bg-zinc-100"
                        aria-label="Open menu"
                    >
                        <Menu className="size-5" />
                    </button>
                    <img src="/pinpoint-logo.png" alt="Pinpoint" className="h-5 w-auto object-contain" />
                    {unreadMessages > 0 && (
                        <Link
                            href="/admin/messages"
                            className="ml-auto flex items-center gap-1.5 rounded-full bg-zinc-900 px-2.5 py-0.5 text-[11px] font-bold text-white"
                        >
                            <Icon icon="solar:inbox-linear" className="size-3.5" />
                            {unreadMessages}
                        </Link>
                    )}
                </header>

                {/* Page content strictly bounded */}
                <div className="relative z-0 flex h-full max-h-full min-w-0 flex-1 flex-col overflow-hidden">{children}</div>
            </main>
        </div>
    );
}
