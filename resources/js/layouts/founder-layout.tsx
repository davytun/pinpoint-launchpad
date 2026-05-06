import { Link, router, usePage } from '@inertiajs/react';
import { AnimatePresence, motion } from 'framer-motion';
import {
    ExternalLink,
    FileText,
    LayoutDashboard,
    LogOut,
    Menu,
    MessageSquare,
    X,
} from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { cn } from '@/lib/utils';

import { PinpointLogo } from '@/components/pinpoint-logo';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface FounderLayoutProps {
    children: React.ReactNode;
    founder: {
        full_name?: string | null;
        company_name?: string | null;
        email?: string;
    };
}

interface NavItem {
    icon: React.ElementType;
    label: string;
    href: string;
    disabled: boolean;
    disabledReason?: string;
}

function getInitials(name?: string | null): string {
    if (!name) return 'F';
    return name
        .split(' ')
        .slice(0, 2)
        .map((n) => n[0])
        .join('')
        .toUpperCase();
}

function SidebarContent({
    founder,
    navItems,
    currentUrl,
    onLogout,
    onClose,
    trapRef,
}: {
    founder: FounderLayoutProps['founder'];
    navItems: NavItem[];
    currentUrl: string;
    onLogout: () => void;
    onClose?: () => void;
    trapRef?: React.RefObject<HTMLDivElement | null>;
}) {
    return (
        <div ref={trapRef} className="flex h-full flex-col outline-none" tabIndex={-1}>
            {/* Wordmark */}
            <div className="px-6 pt-7 pb-6">
                <div className="flex items-center justify-between">
                    <PinpointLogo height={22} variant="dark" />
                    {onClose && (
                        <button
                            onClick={onClose}
                            aria-label="Close menu"
                            className="rounded-lg p-1 text-white/30 transition-colors hover:text-white lg:hidden"
                        >
                            <X className="size-5" aria-hidden="true" />
                        </button>
                    )}
                </div>
                <div className="mt-5 px-1">
                    <p className="truncate text-[14px] font-semibold tracking-tight text-[#ECF0F9]">
                        {founder.full_name ?? 'Founder'}
                    </p>
                    <p className="truncate text-[11px] font-medium text-[#576FA8]">
                        {founder.company_name ?? founder.email}
                    </p>
                </div>
            </div>

            <div className="mx-6 h-px bg-white/[0.06]" />

            {/* Nav */}
            <nav className="flex-1 space-y-0.5 px-3 py-4" aria-label="Main navigation">
                <TooltipProvider delayDuration={300}>
                    {navItems.map(({ icon: Icon, label, href, disabled, disabledReason }) => {
                        const isActive = !disabled && currentUrl.startsWith(href);
                        if (disabled) {
                            return (
                                <Tooltip key={label}>
                                    <TooltipTrigger asChild>
                                        <div
                                            role="button"
                                            aria-disabled="true"
                                            aria-label={`${label} — ${disabledReason}`}
                                            className="flex cursor-not-allowed items-center gap-3 rounded-xl px-3 py-2.5 opacity-30"
                                        >
                                            <Icon className="size-4 text-white/50" aria-hidden="true" />
                                            <span className="text-[13px] font-medium text-white/50">{label}</span>
                                        </div>
                                    </TooltipTrigger>
                                    <TooltipContent
                                        side="right"
                                        className="rounded-xl border border-white/[0.08] bg-[#111] text-[11px] text-white/60 shadow-xl"
                                    >
                                        {disabledReason ?? 'Coming soon'}
                                    </TooltipContent>
                                </Tooltip>
                            );
                        }
                        return (
                            <Link
                                key={label}
                                href={href}
                                onClick={onClose}
                                aria-current={isActive ? 'page' : undefined}
                                className={cn(
                                    'group flex items-center gap-3 rounded-xl px-4 py-2.5 transition-all duration-300',
                                    isActive
                                        ? 'bg-[#1B294B]/40 text-[#ECF0F9] shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)] ring-1 ring-[#4468BB]/30'
                                        : 'text-[#576FA8] hover:bg-white/[0.03] hover:text-[#ECF0F9]'
                                )}
                            >
                                <Icon className={cn(
                                    "size-4 shrink-0 transition-colors duration-300",
                                    isActive ? "text-[#4468BB]" : "text-[#576FA8] group-hover:text-[#788CBA]"
                                )} aria-hidden="true" />
                                <span className="text-[13.5px] font-medium tracking-tight">{label}</span>
                                {isActive && (
                                    <motion.div
                                        layoutId="active-pill"
                                        className="ml-auto h-1 w-1 rounded-full bg-[#4468BB] shadow-[0_0_8px_#4468BB]"
                                    />
                                )}
                            </Link>
                        );
                    })}
                </TooltipProvider>
            </nav>

            {/* Logout */}
            <div className="px-3 pb-6">
                <div className="mb-3 h-px bg-white/[0.06]" />
                <button
                    onClick={onLogout}
                    className="group flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-[#576FA8] transition-all duration-300 hover:bg-red-500/[0.06] hover:text-red-400"
                >
                    <LogOut className="size-4 shrink-0 transition-colors group-hover:text-red-400" aria-hidden="true" />
                    <span className="text-[13.5px] font-medium tracking-tight">Logout</span>
                </button>
            </div>
        </div>
    );
}

export default function FounderLayout({ children, founder }: FounderLayoutProps) {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const { url } = usePage();
    const trapRef = useRef<HTMLDivElement | null>(null);

    const navItems = useMemo<NavItem[]>(() => [
        { icon: LayoutDashboard, label: 'Dashboard',       href: route('founder.dashboard'), disabled: false },
        { icon: FileText,        label: 'Documents',        href: route('founder.documents.index'), disabled: false },
        { icon: MessageSquare,   label: 'Messages',         href: route('founder.messages.index'), disabled: false },
        { icon: ExternalLink,    label: 'My Investor Page', href: '#',                        disabled: true,  disabledReason: 'Available after PARAGON certification' },
    ], []);

    // Focus trap for mobile sidebar
    useEffect(() => {
        if (!sidebarOpen) return;
        const container = trapRef.current;
        if (container) container.focus();

        function handleKeyDown(e: KeyboardEvent) {
            if (e.key === 'Escape') { setSidebarOpen(false); return; }
            if (e.key !== 'Tab' || !container) return;
            const focusable = container.querySelectorAll<HTMLElement>(
                'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
            );
            const first = focusable[0];
            const last  = focusable[focusable.length - 1];
            if (e.shiftKey) {
                if (document.activeElement === first) { e.preventDefault(); last?.focus(); }
            } else {
                if (document.activeElement === last)  { e.preventDefault(); first?.focus(); }
            }
        }
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [sidebarOpen]);

    function handleLogout() {
        router.post(route('founder.logout'));
    }

    return (
        <div className="relative min-h-screen overflow-x-hidden bg-[#050505] text-white antialiased">

            {/* ── Background treatment (same as DiagnosticLayout) ── */}
            <div className="waitlist-shell pointer-events-none fixed inset-0 z-0" />
            <div className="waitlist-grid  pointer-events-none fixed inset-0 z-0" />
            <div className="waitlist-wireframe pointer-events-none fixed -left-[15%] top-[15%] z-0 aspect-square w-[110vw] max-w-[600px] opacity-20 mix-blend-overlay md:-left-[5%] md:top-[20%]" />
            <div className="waitlist-wireframe waitlist-float-delay pointer-events-none fixed -right-[15%] top-[40%] z-0 aspect-square w-[90vw] max-w-[500px] opacity-15 mix-blend-overlay md:-right-[5%] md:top-[45%]" />
            <div
                className="pointer-events-none fixed inset-x-0 top-0 z-0 h-[400px]"
                style={{ background: 'radial-gradient(ellipse 70% 45% at 50% 0%, rgba(37,99,235,0.10) 0%, transparent 70%)' }}
            />

            {/* ── Desktop sidebar ── */}
            <aside className="fixed inset-y-0 left-0 z-30 hidden w-[260px] flex-col border-r border-[#232C43] bg-[#0B0E14] lg:flex">
                <SidebarContent
                    founder={founder}
                    navItems={navItems}
                    currentUrl={url}
                    onLogout={handleLogout}
                />
            </aside>

            {/* ── Mobile sidebar overlay ── */}
            <AnimatePresence>
                {sidebarOpen && (
                    <>
                        <motion.div
                            key="backdrop"
                            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            onClick={() => setSidebarOpen(false)}
                            aria-hidden="true"
                        />
                        <motion.aside
                            key="mobile-sidebar"
                            role="dialog"
                            aria-modal="true"
                            aria-label="Navigation menu"
                            className="fixed inset-y-0 left-0 z-50 w-[260px] border-r border-[#232C43] bg-[#0B0E14] lg:hidden"
                            initial={{ x: -260 }}
                            animate={{ x: 0 }}
                            exit={{ x: -260 }}
                            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                        >
                            <SidebarContent
                                founder={founder}
                                navItems={navItems}
                                currentUrl={url}
                                onLogout={handleLogout}
                                onClose={() => setSidebarOpen(false)}
                                trapRef={trapRef}
                            />
                        </motion.aside>
                    </>
                )}
            </AnimatePresence>

            {/* ── Mobile top bar ── */}
            <header className="fixed inset-x-0 top-0 z-30 flex h-14 items-center justify-between border-b border-white/[0.06] bg-[#050505]/80 px-4 backdrop-blur-md lg:hidden">
                <button
                    onClick={() => setSidebarOpen(true)}
                    aria-label="Open navigation menu"
                    aria-expanded={sidebarOpen}
                    className="rounded-lg p-1.5 text-white/30 transition-colors hover:text-white"
                >
                    <Menu className="size-5" aria-hidden="true" />
                </button>
                <PinpointLogo height={20} variant="dark" />
                <div
                    aria-hidden="true"
                    className="flex h-7 w-7 items-center justify-center rounded-full border border-white/[0.12] bg-blue-600/20 text-[10px] font-bold text-blue-400"
                >
                    {getInitials(founder.full_name)}
                </div>
            </header>

            {/* ── Main content ── */}
            <main className="relative z-10 min-h-screen pt-14 lg:ml-[260px] lg:pt-0">
                {children}
            </main>
        </div>
    );
}
