import { cn } from '@/lib/utils';
import { Link, router, usePage } from '@inertiajs/react';
import { AnimatePresence, motion } from 'framer-motion';
import { ExternalLink, FileText, LayoutDashboard, LogOut, Menu, MessageSquare, X } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';

import { PinpointLogo } from '@/components/pinpoint-logo';
import SideRays from '@/components/SideRays';
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
                    <PinpointLogo height={22} />
                    {onClose && (
                        <button
                            onClick={onClose}
                            aria-label="Close menu"
                            className="hover:text-zinc-650 rounded-lg p-1 text-zinc-400 transition-colors lg:hidden"
                        >
                            <X className="size-5" aria-hidden="true" />
                        </button>
                    )}
                </div>
                <div className="mt-5 px-1">
                    <p className="truncate text-[14px] font-extrabold tracking-tight text-zinc-950">{founder.full_name ?? 'Founder'}</p>
                    <p className="truncate text-[11px] font-medium text-zinc-500">{founder.company_name ?? founder.email}</p>
                </div>
            </div>

            <div className="mx-6 h-px bg-zinc-200" />

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
                                            className="flex cursor-not-allowed items-center gap-3 rounded-xl px-3 py-2.5 opacity-40"
                                        >
                                            <Icon className="size-4 text-zinc-400" aria-hidden="true" />
                                            <span className="text-[13px] font-medium text-zinc-400">{label}</span>
                                        </div>
                                    </TooltipTrigger>
                                    <TooltipContent
                                        side="right"
                                        className="rounded-xl border border-zinc-200 bg-white px-3 py-2 text-[11px] text-zinc-500 shadow-md"
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
                                        ? 'bg-[#3A54A5]/10 text-[#3A54A5] shadow-xs ring-1 ring-[#3A54A5]/25'
                                        : 'text-zinc-550 hover:bg-zinc-100 hover:text-zinc-900',
                                )}
                            >
                                <Icon
                                    className={cn(
                                        'size-4 shrink-0 transition-colors duration-300',
                                        isActive ? 'text-[#3A54A5]' : 'group-hover:text-zinc-650 text-zinc-400',
                                    )}
                                    aria-hidden="true"
                                />
                                <span className="text-[13.5px] font-semibold tracking-tight">{label}</span>
                                {isActive && <motion.div layoutId="active-pill" className="ml-auto h-1 w-1 rounded-full bg-[#3A54A5]" />}
                            </Link>
                        );
                    })}
                </TooltipProvider>
            </nav>

            {/* Logout */}
            <div className="px-3 pb-6">
                <div className="mb-3 h-px bg-zinc-200" />
                <button
                    onClick={onLogout}
                    className="group text-zinc-550 hover:text-red-650 flex w-full items-center gap-3 rounded-xl px-4 py-2.5 transition-all duration-300 hover:bg-red-50"
                >
                    <LogOut className="text-zinc-450 group-hover:text-red-650 size-4 shrink-0 transition-colors" aria-hidden="true" />
                    <span className="text-[13.5px] font-semibold tracking-tight">Logout</span>
                </button>
            </div>
        </div>
    );
}

export default function FounderLayout({ children, founder }: FounderLayoutProps) {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const { url } = usePage();
    const trapRef = useRef<HTMLDivElement | null>(null);

    const navItems = useMemo<NavItem[]>(
        () => [
            { icon: LayoutDashboard, label: 'Dashboard', href: route('founder.dashboard'), disabled: false },
            { icon: FileText, label: 'Documents', href: route('founder.documents.index'), disabled: false },
            { icon: MessageSquare, label: 'Messages', href: route('founder.messages.index'), disabled: false },
            { icon: ExternalLink, label: 'My Investor Page', href: '#', disabled: true, disabledReason: 'Available after PARAGON certification' },
        ],
        [],
    );

    // Focus trap for mobile sidebar
    useEffect(() => {
        if (!sidebarOpen) return;
        const container = trapRef.current;
        if (container) container.focus();

        function handleKeyDown(e: KeyboardEvent) {
            if (e.key === 'Escape') {
                setSidebarOpen(false);
                return;
            }
            if (e.key !== 'Tab' || !container) return;
            const focusable = container.querySelectorAll<HTMLElement>('a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])');
            const first = focusable[0];
            const last = focusable[focusable.length - 1];
            if (e.shiftKey) {
                if (document.activeElement === first) {
                    e.preventDefault();
                    last?.focus();
                }
            } else {
                if (document.activeElement === last) {
                    e.preventDefault();
                    first?.focus();
                }
            }
        }
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [sidebarOpen]);

    function handleLogout() {
        router.post(route('founder.logout'));
    }

    return (
        <div className="relative min-h-screen overflow-x-hidden bg-linear-to-b from-[#f1f4ff] via-[#f5f8ff] to-white font-sans text-zinc-900 antialiased">
            {/* Background SideRays */}
            <div className="pointer-events-none fixed inset-0 z-0">
                <SideRays
                    rayColor1="#3A54A5"
                    rayColor2="#93C5FD"
                    origin="top-left"
                    speed={1.8}
                    intensity={1.2}
                    spread={2}
                    tilt={0}
                    saturation={1.5}
                    blend={0.35}
                    falloff={2.3}
                    opacity={0.35}
                />
            </div>

            {/* Ambient top glow */}
            <div
                className="pointer-events-none fixed inset-x-0 top-0 z-0 h-[400px] opacity-15"
                style={{
                    background: 'radial-gradient(circle at top, #3A54A5, transparent 70%)',
                }}
            />

            {/* ── Desktop sidebar ── */}
            <aside className="fixed inset-y-0 left-0 z-30 hidden w-[260px] flex-col border-r border-zinc-200 bg-white/40 backdrop-blur-md lg:flex">
                <SidebarContent founder={founder} navItems={navItems} currentUrl={url} onLogout={handleLogout} />
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
                            className="fixed inset-y-0 left-0 z-50 w-[260px] border-r border-zinc-200 bg-white/60 backdrop-blur-md lg:hidden"
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
            <header className="fixed inset-x-0 top-0 z-30 flex h-14 items-center justify-between border-b border-zinc-200 bg-white/60 px-4 backdrop-blur-md lg:hidden">
                <button
                    onClick={() => setSidebarOpen(true)}
                    aria-label="Open navigation menu"
                    aria-expanded={sidebarOpen}
                    className="hover:text-zinc-650 rounded-lg p-1.5 text-zinc-400 transition-colors"
                >
                    <Menu className="size-5" aria-hidden="true" />
                </button>
                <PinpointLogo height={20} />
                <div
                    aria-hidden="true"
                    className="flex h-7 w-7 items-center justify-center rounded-full border border-[#3A54A5]/20 bg-[#3A54A5]/10 text-[10px] font-bold text-[#3A54A5]"
                >
                    {getInitials(founder.full_name)}
                </div>
            </header>

            {/* ── Main content ── */}
            <main className="relative z-10 min-h-screen pt-14 lg:ml-[260px] lg:pt-0">{children}</main>
        </div>
    );
}
