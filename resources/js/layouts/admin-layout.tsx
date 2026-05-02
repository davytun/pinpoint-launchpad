import { Link, router, usePage } from '@inertiajs/react';
import {
    Award,
    DollarSign,
    LayoutDashboard,
    LogOut,
    Menu,
    MessageSquare,
    Settings,
    UserCog,
    Users,
    X,
} from 'lucide-react';
import { ReactNode, useEffect, useState } from 'react';

interface AdminUser {
    id: number;
    name: string;
    email: string;
    role: 'superadmin' | 'analyst' | 'support';
}

interface AdminLayoutProps {
    children: ReactNode;
}

const roleBadge: Record<string, { label: string; className: string }> = {
    superadmin: { label: 'Super Admin', className: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' },
    analyst:    { label: 'Analyst',     className: 'bg-blue-500/20 text-blue-400 border border-blue-500/30' },
    support:    { label: 'Support',     className: 'bg-slate-500/20 text-slate-400 border border-slate-500/30' },
};

function NavItem({
    href,
    icon: Icon,
    label,
    active,
    badge,
    onClick,
}: {
    href: string;
    icon: React.ElementType;
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
                'group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-150',
                active
                    ? 'bg-[#1B294B] text-[#ECF0F9] border border-[#4468BB]/20'
                    : 'text-[#788CBA] hover:bg-[#1B294B] hover:text-[#ECF0F9] border border-transparent',
            ].join(' ')}
        >
            <Icon className={`size-[18px] shrink-0 transition-colors ${active ? 'text-[#4468BB]' : 'text-[#576FA8] group-hover:text-[#788CBA]'}`} />
            <span className="flex-1 truncate">{label}</span>
            {badge != null && badge > 0 && (
                <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-[#4468BB] px-1.5 text-[10px] font-bold text-white shadow-lg shadow-[#4468BB]/20">
                    {badge > 99 ? '99+' : badge}
                </span>
            )}
        </Link>
    );
}

function NavSection({ label }: { label: string }) {
    return (
        <p className="mb-1 mt-4 px-3 text-[10px] font-bold uppercase tracking-[0.15em] text-[#576FA8] first:mt-0">
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
    unreadMessages,
    isActive,
    logout,
    onNav,
}: {
    user: AdminUser | null;
    role: string;
    isSuperAdmin: boolean;
    isAnalyst: boolean;
    isSupport: boolean;
    unreadMessages: number;
    isActive: (path: string) => boolean;
    logout: () => void;
    onNav?: () => void;
}) {
    const badge = roleBadge[role] ?? roleBadge.support;

    return (
        <div className="flex h-full flex-col">
            {/* Wordmark */}
            <div className="flex items-center gap-3 border-b border-[#232C43] px-5 py-4 bg-[#080B11]/50">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#1B294B] border border-[#4468BB]/20">
                    <span className="text-sm font-black text-[#ECF0F9]">P</span>
                </div>
                <div className="min-w-0">
                    <p className="truncate text-sm font-bold tracking-tight text-[#ECF0F9]">Pinpoint Command</p>
                    <span className={`inline-block rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider ${badge.className}`}>
                        {badge.label}
                    </span>
                </div>
            </div>

            {/* Nav */}
            <nav className="flex-1 overflow-y-auto px-3 py-4">
                <NavSection label="Main" />
                <NavItem href="/admin"          icon={LayoutDashboard} label="Dashboard" active={isActive('/admin')}          onClick={onNav} />
                <NavItem href="/admin/messages" icon={MessageSquare}   label="Messages"  active={isActive('/admin/messages')} onClick={onNav} badge={unreadMessages} />

                {(isSuperAdmin || isSupport) && (
                    <>
                        <NavSection label="Operations" />
                        <NavItem href="/admin/waitlist" icon={Users} label="Waitlist" active={isActive('/admin/waitlist')} onClick={onNav} />
                    </>
                )}

                {(isSuperAdmin || isAnalyst) && (
                    <>
                        {!isSuperAdmin && <NavSection label="Audits" />}
                        <NavItem href="/admin/founders" icon={Users}  label="Founders" active={isActive('/admin/founders')} onClick={onNav} />
                        <NavItem href="/admin/profiles" icon={Award}  label="Profiles" active={isActive('/admin/profiles')} onClick={onNav} />
                    </>
                )}

                {isSuperAdmin && (
                    <>
                        <NavSection label="Admin" />
                        <NavItem href="/admin/revenue"  icon={DollarSign} label="Revenue"  active={isActive('/admin/revenue')}  onClick={onNav} />
                        <NavItem href="/admin/users"    icon={UserCog}    label="Team"     active={isActive('/admin/users')}    onClick={onNav} />
                        <NavItem href="/admin/settings" icon={Settings}   label="Settings" active={isActive('/admin/settings')} onClick={onNav} />
                    </>
                )}
            </nav>

            {/* User footer */}
            <div className="border-t border-[#232C43] px-4 py-3 bg-[#080B11]/50">
                <div className="mb-2 flex items-center gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#101623] border border-[#232C43] text-xs font-bold text-[#788CBA] uppercase">
                        {user?.name?.[0] ?? '?'}
                    </div>
                    <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-[#ECF0F9] leading-tight">{user?.name ?? '—'}</p>
                        <p className="truncate text-[11px] text-[#576FA8] leading-tight">{user?.email ?? ''}</p>
                    </div>
                </div>
                <button
                    onClick={logout}
                    className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-xs font-medium text-[#788CBA] transition-colors hover:bg-[#1B294B] hover:text-[#ECF0F9] border border-transparent hover:border-[#232C43]"
                >
                    <LogOut className="size-3.5" />
                    Secure Sign Out
                </button>
            </div>
        </div>
    );
}

export default function AdminLayout({ children }: AdminLayoutProps) {
    const { auth, admin_unread_messages } = usePage<{
        auth: { user: AdminUser };
        admin_unread_messages?: number;
    }>().props;

    const user = auth?.user ?? null;
    const currentUrl = usePage().url as string;
    const role = user?.role ?? 'support';
    const unreadMessages = admin_unread_messages ?? 0;

    const isSuperAdmin = role === 'superadmin';
    const isAnalyst    = role === 'analyst';
    const isSupport    = role === 'support';

    const [sidebarOpen, setSidebarOpen] = useState(false);

    // Close sidebar on route change
    useEffect(() => {
        setSidebarOpen(false);
    }, [currentUrl]);

    // Prevent body scroll when sidebar open on mobile
    useEffect(() => {
        if (sidebarOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => { document.body.style.overflow = ''; };
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

    const sidebarProps = { user, role, isSuperAdmin, isAnalyst, isSupport, unreadMessages, isActive, logout };

    return (
        <div className="flex min-h-screen bg-[#080B11] text-[#ECF0F9] antialiased selection:bg-[#4468BB]/30 selection:text-white">

            {/* ── Desktop sidebar (always visible ≥ lg) ───────────────────── */}
            <aside className="fixed inset-y-0 left-0 z-40 hidden w-60 flex-col border-r border-[#232C43] bg-[#101623] lg:flex">
                <SidebarContent {...sidebarProps} />
            </aside>

            {/* ── Mobile sidebar drawer ────────────────────────────────────── */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 z-50 lg:hidden"
                    aria-modal="true"
                >
                    {/* Backdrop */}
                    <div
                        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
                        onClick={() => setSidebarOpen(false)}
                    />
                    {/* Drawer */}
                    <aside className="absolute inset-y-0 left-0 flex w-72 flex-col border-r border-[#232C43] bg-[#101623] shadow-2xl">
                        <button
                            onClick={() => setSidebarOpen(false)}
                            className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-lg text-[#576FA8] hover:bg-[#1B294B] hover:text-[#ECF0F9]"
                        >
                            <X className="size-4" />
                        </button>
                        <SidebarContent {...sidebarProps} onNav={() => setSidebarOpen(false)} />
                    </aside>
                </div>
            )}

            {/* ── Main content ─────────────────────────────────────────────── */}
            <main className="flex min-h-screen flex-1 flex-col lg:ml-60">

                {/* Mobile top bar */}
                <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-[#232C43] bg-[#101623]/90 px-4 backdrop-blur-md lg:hidden">
                    <button
                        onClick={() => setSidebarOpen(true)}
                        className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#232C43] text-[#788CBA] hover:text-[#ECF0F9]"
                        aria-label="Open menu"
                    >
                        <Menu className="size-5" />
                    </button>
                    <span className="text-sm font-bold text-[#ECF0F9]">Pinpoint Command</span>
                    {unreadMessages > 0 && (
                        <Link href="/admin/messages" className="ml-auto flex items-center gap-1.5 rounded-full bg-[#1B294B] px-2.5 py-1 text-[11px] font-bold text-[#4468BB] border border-[#4468BB]/20">
                            <MessageSquare className="size-3.5" />
                            {unreadMessages}
                        </Link>
                    )}
                </header>

                {/* Page content */}
                <div className="flex-1">
                    {children}
                </div>
            </main>
        </div>
    );
}
