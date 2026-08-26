import { Icon } from '@iconify/react';
import { Link, router, usePage } from '@inertiajs/react';
import { Menu, X } from 'lucide-react';
import { ReactNode, useEffect, useState } from 'react';

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
    onClick,
}: {
    href: string;
    icon: string;
    label: string;
    active: boolean;
    badge?: number;
    onClick?: () => void;
}) {
    return (
        <Link
            href={href}
            onClick={onClick}
            className={[
                'group relative flex items-center gap-3.5 rounded-xl px-4 py-2.5 text-[14px] transition-all duration-150',
                active
                    ? 'bg-[#E3E3E6] text-zinc-950 font-semibold shadow-2xs'
                    : 'text-zinc-600 hover:text-zinc-950 hover:bg-[#EAEAEA]/70 font-medium',
            ].join(' ')}
        >
            <Icon
                icon={icon}
                className={`size-5 shrink-0 transition-colors ${
                    active ? 'text-zinc-950' : 'text-zinc-500 group-hover:text-zinc-900'
                }`}
            />
            <span className="flex-1 truncate tracking-tight">{label}</span>
            {badge != null && badge > 0 && (
                <span
                    className={`ml-auto text-[13px] tabular-nums font-normal transition-colors ${
                        active ? 'text-zinc-800 font-medium' : 'text-zinc-400 group-hover:text-zinc-600'
                    }`}
                >
                    {badge > 99 ? '99+' : badge}
                </span>
            )}
        </Link>
    );
}

function NavSection({ label }: { label: string }) {
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
    logout: () => void;
    onNav?: () => void;
}) {
    return (
        <div className="flex h-full flex-col justify-between">
            {/* Top Workspace Header using full Pinpoint Logo */}
            <div>
                <div className="group mb-5 flex items-center justify-between gap-3 rounded-2xl px-3.5 py-2.5 transition-colors hover:bg-[#EAEAEA]/70 cursor-pointer">
                    <img
                        src="/pinpoint-logo.png"
                        alt="Pinpoint Launchpad"
                        className="h-6.5 w-auto max-w-37.5 object-contain select-none"
                    />
                    <Icon
                        icon="solar:alt-arrow-down-bold"
                        className="size-3.5 shrink-0 text-zinc-400 transition-colors group-hover:text-zinc-700"
                    />
                </div>

                {/* Navigation Links with Crisp Solid Icons */}
                <nav className="flex flex-col space-y-1">
                    <NavSection label="Main" />
                    <NavItem
                        href="/admin"
                        icon="solar:widget-2-bold"
                        label="Dashboard"
                        active={isActive('/admin')}
                        onClick={onNav}
                    />
                    <NavItem
                        href="/admin/messages"
                        icon="solar:inbox-bold"
                        label="Messages"
                        active={isActive('/admin/messages')}
                        onClick={onNav}
                        badge={unreadMessages}
                    />
                    <NavItem
                        href="/admin/notifications"
                        icon="solar:bell-bing-bold"
                        label="Alerts"
                        active={isActive('/admin/notifications')}
                        onClick={onNav}
                        badge={unreadNotifications}
                    />

                    {(isSuperAdmin || isSupport) && (
                        <>
                            <NavSection label="Operations" />
                            <NavItem
                                href="/admin/waitlist"
                                icon="solar:users-group-rounded-bold"
                                label="Waitlist"
                                active={isActive('/admin/waitlist')}
                                onClick={onNav}
                            />
                            <NavItem
                                href="/admin/investors"
                                icon="solar:clipboard-list-bold"
                                label="Applications"
                                active={isActive('/admin/investors')}
                                onClick={onNav}
                            />
                        </>
                    )}

                    {(isSuperAdmin || isInvestorRelations || isCompliance) && (
                        <>
                            <NavSection label="Investors" />
                            <NavItem
                                href="/admin/investor-accounts?kyc_status=pending"
                                icon="solar:shield-check-bold"
                                label="KYC Reviews"
                                active={isActive('/admin/investor-accounts')}
                                onClick={onNav}
                            />
                        </>
                    )}

                    {(isSuperAdmin || isInvestorRelations) && (
                        <>
                            <NavSection label="Dealflow" />
                            <NavItem
                                href="/admin/spotlight"
                                icon="solar:crown-star-bold"
                                label="Spotlight"
                                active={isActive('/admin/spotlight')}
                                onClick={onNav}
                            />
                            <NavItem
                                href="/admin/dealflow/interests"
                                icon="solar:hand-money-bold"
                                label="Interests"
                                active={isActive('/admin/dealflow/interests')}
                                onClick={onNav}
                            />
                            <NavItem
                                href="/admin/dealflow/data-rooms"
                                icon="solar:folder-with-files-bold"
                                label="Data Rooms"
                                active={isActive('/admin/dealflow/data-rooms')}
                                onClick={onNav}
                            />
                        </>
                    )}

                    {(isSuperAdmin || isAnalyst) && (
                        <>
                            {!isSuperAdmin && <NavSection label="Audits" />}
                            <NavItem
                                href="/admin/founders"
                                icon="solar:user-speak-bold"
                                label="Founders"
                                active={isActive('/admin/founders')}
                                onClick={onNav}
                            />
                            <NavItem
                                href="/admin/profiles"
                                icon="solar:medal-ribbons-star-bold"
                                label="Profiles"
                                active={isActive('/admin/profiles')}
                                onClick={onNav}
                            />
                        </>
                    )}

                    {isSuperAdmin && (
                        <>
                            <NavSection label="Admin" />
                            <NavItem
                                href="/admin/revenue"
                                icon="solar:wallet-money-bold"
                                label="Revenue"
                                active={isActive('/admin/revenue')}
                                onClick={onNav}
                            />
                            <NavItem
                                href="/admin/blog"
                                icon="solar:document-text-bold"
                                label="Blog"
                                active={isActive('/admin/blog')}
                                onClick={onNav}
                            />
                            <NavItem
                                href="/admin/users"
                                icon="solar:shield-user-bold"
                                label="Team"
                                active={isActive('/admin/users')}
                                onClick={onNav}
                            />
                            <NavItem
                                href="/admin/settings"
                                icon="solar:settings-bold"
                                label="Settings"
                                active={isActive('/admin/settings')}
                                onClick={onNav}
                            />
                        </>
                    )}
                </nav>
            </div>

            {/* Bottom User Area — Clean 2-Line Layout */}
            <div className="mt-6 pt-2 pb-1">
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
                        <Icon icon="solar:logout-2-bold" className="size-4" />
                    </button>
                </div>
            </div>
        </div>
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
        logout,
    };

    return (
        <div className="min-h-screen bg-[#F4F4F6] text-zinc-900 antialiased selection:bg-zinc-900 selection:text-white flex flex-col lg:flex-row p-3 lg:p-3.5 gap-3.5">
            {/* ── Desktop Sidebar (Directly on Paper Canvas) ───────────────────── */}
            <aside className="hidden lg:flex w-72 shrink-0 flex-col justify-between py-2 px-1.5 select-none">
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
                        <SidebarContent {...sidebarProps} onNav={() => setSidebarOpen(false)} />
                    </aside>
                </div>
            )}

            {/* ── Main Content Container (Elevated Surface Card) ────────────── */}
            <main className="flex-1 min-w-0 bg-white rounded-2xl lg:rounded-[22px] border border-zinc-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.03)] overflow-hidden flex flex-col min-h-[calc(100vh-1.75rem)]">
                {/* Mobile top bar */}
                <header className="flex h-14 items-center gap-3 border-b border-zinc-100 bg-white px-5 lg:hidden shrink-0">
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
                            <Icon icon="solar:inbox-bold" className="size-3.5" />
                            {unreadMessages}
                        </Link>
                    )}
                </header>

                {/* Page content */}
                <div className="min-w-0 flex-1 overflow-y-auto">{children}</div>
            </main>
        </div>
    );
}
