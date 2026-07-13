import { Link, router, usePage } from '@inertiajs/react';
import { Award, DollarSign, LayoutDashboard, LogOut, Menu, MessageSquare, Settings, UserCog, Users, X } from 'lucide-react';
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
    superadmin: { label: 'Super Admin', className: 'bg-emerald-50 text-emerald-700 border border-emerald-250' },
    analyst: { label: 'Analyst', className: 'bg-[#3A54A5]/10 text-[#3A54A5] border border-[#3A54A5]/25' },
    support: { label: 'Support', className: 'bg-zinc-105 text-zinc-650 border border-zinc-200' },
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
                'group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-all duration-150',
                active
                    ? 'border border-[#3A54A5]/25 bg-[#3A54A5]/10 text-[#3A54A5] shadow-xs'
                    : 'border border-transparent text-zinc-550 hover:bg-zinc-100 hover:text-zinc-950',
            ].join(' ')}
        >
            <Icon className={`size-[18px] shrink-0 transition-colors ${active ? 'text-[#3A54A5]' : 'text-zinc-400 group-hover:text-zinc-650'}`} />
            <span className="flex-1 truncate">{label}</span>
            {badge != null && badge > 0 && (
                <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-[#3A54A5] px-1.5 text-[10px] font-bold text-white">
                    {badge > 99 ? '99+' : badge}
                </span>
            )}
        </Link>
    );
}

function NavSection({ label }: { label: string }) {
    return <p className="mt-4 mb-1 px-3 text-[10px] font-bold tracking-[0.15em] text-zinc-400 uppercase first:mt-0">{label}</p>;
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
        <div className="flex h-full flex-col bg-white">
            {/* Wordmark */}
            <div className="flex items-center gap-3 border-b border-zinc-200 bg-zinc-50/50 px-5 py-4">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-[#3A54A5]/25 bg-[#3A54A5]">
                    <span className="text-sm font-black text-white">P</span>
                </div>
                <div className="min-w-0">
                    <p className="truncate text-sm font-extrabold tracking-tight text-zinc-950">Pinpoint Command</p>
                    <span className={`inline-block rounded-full px-2 py-0.5 text-[9px] font-bold tracking-wider uppercase mt-0.5 ${badge.className}`}>
                        {badge.label}
                    </span>
                </div>
            </div>

            {/* Nav */}
            <nav className="flex-1 overflow-y-auto px-3 py-4">
                <NavSection label="Main" />
                <NavItem href="/admin" icon={LayoutDashboard} label="Dashboard" active={isActive('/admin')} onClick={onNav} />
                <NavItem
                    href="/admin/messages"
                    icon={MessageSquare}
                    label="Messages"
                    active={isActive('/admin/messages')}
                    onClick={onNav}
                    badge={unreadMessages}
                />

                {(isSuperAdmin || isSupport) && (
                    <>
                        <NavSection label="Operations" />
                        <NavItem href="/admin/waitlist" icon={Users} label="Waitlist" active={isActive('/admin/waitlist')} onClick={onNav} />
                    </>
                )}

                {(isSuperAdmin || isAnalyst) && (
                    <>
                        {!isSuperAdmin && <NavSection label="Audits" />}
                        <NavItem href="/admin/founders" icon={Users} label="Founders" active={isActive('/admin/founders')} onClick={onNav} />
                        <NavItem href="/admin/profiles" icon={Award} label="Profiles" active={isActive('/admin/profiles')} onClick={onNav} />
                    </>
                )}

                {isSuperAdmin && (
                    <>
                        <NavSection label="Admin" />
                        <NavItem href="/admin/revenue" icon={DollarSign} label="Revenue" active={isActive('/admin/revenue')} onClick={onNav} />
                        <NavItem href="/admin/users" icon={UserCog} label="Team" active={isActive('/admin/users')} onClick={onNav} />
                        <NavItem href="/admin/settings" icon={Settings} label="Settings" active={isActive('/admin/settings')} onClick={onNav} />
                    </>
                )}
            </nav>

            {/* User footer */}
            <div className="border-t border-zinc-200 bg-zinc-50/50 px-4 py-3">
                <div className="mb-2 flex items-center gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-zinc-200 bg-white text-xs font-bold text-zinc-650 uppercase shadow-xs">
                        {user?.name?.[0] ?? '?'}
                    </div>
                    <div className="min-w-0 flex-1">
                        <p className="truncate text-sm leading-tight font-bold text-zinc-950">{user?.name ?? '—'}</p>
                        <p className="truncate text-[11px] leading-tight text-zinc-500 mt-0.5">{user?.email ?? ''}</p>
                    </div>
                </div>
                <button
                    onClick={logout}
                    className="flex w-full items-center gap-2 rounded-lg border border-zinc-200/60 bg-white px-2.5 py-1.5 text-xs font-semibold text-zinc-650 shadow-xs transition-colors hover:border-zinc-300 hover:bg-zinc-50 hover:text-zinc-950"
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
    const isAnalyst = role === 'analyst';
    const isSupport = role === 'support';

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

    const sidebarProps = { user, role, isSuperAdmin, isAnalyst, isSupport, unreadMessages, isActive, logout };

    return (
        <div className="flex min-h-screen bg-slate-50 text-zinc-900 antialiased selection:bg-[#3A54A5]/20 selection:text-zinc-800">
            {/* ── Desktop sidebar (always visible ≥ lg) ───────────────────── */}
            <aside className="fixed inset-y-0 left-0 z-40 hidden w-60 flex-col border-r border-zinc-200 bg-white lg:flex">
                <SidebarContent {...sidebarProps} />
            </aside>

            {/* ── Mobile sidebar drawer ────────────────────────────────────── */}
            {sidebarOpen && (
                <div className="fixed inset-0 z-50 lg:hidden" aria-modal="true">
                    {/* Backdrop */}
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
                    {/* Drawer */}
                    <aside className="absolute inset-y-0 left-0 flex w-72 flex-col border-r border-zinc-200 bg-white shadow-xl">
                        <button
                            onClick={() => setSidebarOpen(false)}
                            className="absolute top-3 right-3 flex h-8 w-8 items-center justify-center rounded-lg text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700"
                        >
                            <X className="size-4" />
                        </button>
                        <SidebarContent {...sidebarProps} onNav={() => setSidebarOpen(false)} />
                    </aside>
                </div>
            )}

            {/* ── Main content ─────────────────────────────────────────────── */}
            <main className="flex min-h-screen min-w-0 flex-1 flex-col overflow-x-hidden lg:ml-60">
                {/* Mobile top bar */}
                <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-zinc-200 bg-white/90 px-4 backdrop-blur-md lg:hidden">
                    <button
                        onClick={() => setSidebarOpen(true)}
                        className="flex h-9 w-9 items-center justify-center rounded-xl border border-zinc-200 text-zinc-650 bg-white hover:text-zinc-850 hover:bg-zinc-50 shadow-xs"
                        aria-label="Open menu"
                    >
                        <Menu className="size-5" />
                    </button>
                    <span className="text-sm font-extrabold text-zinc-950">Pinpoint Command</span>
                    {unreadMessages > 0 && (
                        <Link
                            href="/admin/messages"
                            className="ml-auto flex items-center gap-1.5 rounded-full border border-[#3A54A5]/25 bg-[#3A54A5]/10 px-2.5 py-1 text-[11px] font-bold text-[#3A54A5]"
                        >
                            <MessageSquare className="size-3.5" />
                            {unreadMessages}
                        </Link>
                    )}
                </header>

                {/* Page content */}
                <div className="min-w-0 flex-1">{children}</div>
            </main>
        </div>
    );
}
