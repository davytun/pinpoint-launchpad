import { Icon } from '@iconify/react';
import { Link, router, usePage } from '@inertiajs/react';
import { Menu, X } from 'lucide-react';
import { ReactNode, useEffect, useState } from 'react';

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
                collapsed
                    ? 'h-10 w-10 justify-center rounded-xl mx-auto'
                    : 'gap-3.5 rounded-xl px-4 py-2.5 text-[14px]',
                active
                    ? 'bg-[#E3E3E6] text-zinc-950 font-semibold shadow-2xs'
                    : 'text-zinc-600 hover:text-zinc-950 hover:bg-[#EAEAEA]/70 font-medium',
            )}
        >
            <div className="relative flex items-center justify-center shrink-0">
                <Icon
                    icon={icon}
                    className={cn(
                        'size-5 shrink-0 transition-colors',
                        active ? 'text-zinc-950 stroke-[0.3]' : 'text-zinc-500 group-hover:text-zinc-900',
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
                                'ml-auto text-[13px] tabular-nums font-normal transition-colors',
                                active ? 'text-zinc-800 font-medium' : 'text-zinc-400 group-hover:text-zinc-600',
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
                <TooltipContent side="right" sideOffset={12} className="flex items-center gap-2 font-medium text-xs">
                    <span>{label}</span>
                    {badge != null && badge > 0 && (
                        <span className="rounded-full bg-blue-600 px-1.5 py-0.2 text-[10px] font-bold text-white">
                            {badge}
                        </span>
                    )}
                </TooltipContent>
            </Tooltip>
        );
    }

    return linkContent;
}

function NavSection({ label, collapsed }: { label: string; collapsed?: boolean }) {
    if (collapsed) {
        return <div className="my-2 border-t border-zinc-200/60 mx-2" />;
    }
    return (
        <p className="mt-6 mb-2 px-4 text-[10.5px] font-bold tracking-[0.14em] text-zinc-400 uppercase first:mt-2">
            {label}
        </p>
    );
}

function SidebarContent({
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
    onNav,
}: {
    user: AdminUser | null;
    role: string;
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
            <div className="flex h-full flex-col justify-between">
                {/* Top Workspace Header */}
                <div>
                    <div
                        className={cn(
                            'group mb-5 flex items-center transition-all cursor-pointer',
                            collapsed
                                ? 'justify-center py-2'
                                : 'justify-between gap-3 rounded-2xl px-3.5 py-2.5 hover:bg-[#EAEAEA]/70',
                        )}
                        onClick={collapsed ? toggleCollapse : undefined}
                    >
                        {collapsed ? (
                            <Tooltip delayDuration={150}>
                                <TooltipTrigger asChild>
                                    <button
                                        onClick={toggleCollapse}
                                        className="flex h-9 w-9 items-center justify-center rounded-xl hover:bg-[#EAEAEA]/70 transition-colors"
                                    >
                                        <img
                                            src="/favicon.ico"
                                            alt="Pinpoint"
                                            className="h-6.5 w-6.5 rounded-lg object-contain shadow-2xs"
                                        />
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
                                        className="flex h-7 w-7 items-center justify-center rounded-lg text-zinc-400 hover:bg-[#E1E1E4] hover:text-zinc-900 transition-colors"
                                    >
                                        <Icon icon="solar:sidebar-minimalistic-linear" className="size-4" />
                                    </button>
                                </div>
                            </>
                        )}
                    </div>

                    {/* Navigation Links with Clean Linear Icons */}
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
                                    href="/admin/investors"
                                    icon="solar:clipboard-list-linear"
                                    label="Applications"
                                    active={isActive('/admin/investors')}
                                    collapsed={collapsed}
                                    onClick={onNav}
                                />
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

                {/* Bottom User Area */}
                <div className="mt-6 pt-2 pb-1">
                    {collapsed ? (
                        <Tooltip delayDuration={150}>
                            <TooltipTrigger asChild>
                                <button
                                    onClick={logout}
                                    className="flex h-10 w-10 mx-auto items-center justify-center rounded-full bg-zinc-950 text-xs font-bold text-white shadow-2xs hover:opacity-85 transition-opacity"
                                >
                                    {user?.name?.[0] ?? 'A'}
                                </button>
                            </TooltipTrigger>
                            <TooltipContent side="right" sideOffset={12} className="flex flex-col gap-0.5">
                                <p className="font-bold text-xs">{user?.name ?? 'Admin'}</p>
                                <p className="text-[10px] text-zinc-400">{user?.email ?? ''}</p>
                                <p className="text-[10px] text-red-400 font-semibold mt-1">Click to Sign Out</p>
                            </TooltipContent>
                        </Tooltip>
                    ) : (
                        <div className="group flex items-center justify-between gap-3 rounded-2xl px-3 py-2.5 transition-colors hover:bg-[#EAEAEA]/70">
                            <div className="flex min-w-0 items-center gap-3">
                                <div className="flex h-8.5 w-8.5 shrink-0 items-center justify-center rounded-full bg-zinc-950 text-xs font-bold text-white shadow-2xs">
                                    {user?.name?.[0] ?? 'A'}
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className="truncate text-[13.5px] font-semibold leading-tight text-zinc-950">
                                        {user?.name ?? 'Admin'}
                                    </p>
                                    <p className="mt-0.5 truncate text-[11px] font-medium leading-none text-zinc-400">
                                        {user?.email ?? ''}
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
            } catch {}
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
        <div className="h-screen max-h-screen overflow-hidden bg-[#F4F4F6] text-zinc-900 antialiased selection:bg-zinc-900 selection:text-white flex flex-col lg:flex-row p-3 lg:p-3.5 gap-3.5">
            {/* ── Desktop Sidebar (Strictly bounded height) ── */}
            <aside
                className={cn(
                    'hidden lg:flex shrink-0 flex-col justify-between py-2 select-none transition-all duration-200 ease-in-out h-full max-h-full overflow-y-auto',
                    collapsed ? 'w-16 px-1' : 'w-72 px-1.5',
                )}
            >
                <SidebarContent {...sidebarProps} />
            </aside>

            {/* ── Mobile Sidebar Drawer ────────────────────────────────────── */}
            {sidebarOpen && (
                <div className="fixed inset-0 z-50 lg:hidden" aria-modal="true">
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-xs" onClick={() => setSidebarOpen(false)} />
                    <aside className="absolute inset-y-0 left-0 flex w-80 flex-col bg-[#F4F4F6] p-4 shadow-2xl border-r border-zinc-200/80">
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
            <main className="flex-1 min-w-0 h-full max-h-full flex flex-col overflow-hidden">
                {/* Mobile top bar */}
                <header className="mb-3 flex h-14 items-center gap-3 rounded-2xl border border-zinc-200/80 bg-white px-5 shadow-2xs lg:hidden shrink-0">
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
                <div className="flex-1 min-w-0 h-full max-h-full flex flex-col overflow-hidden">{children}</div>
            </main>
        </div>
    );
}
