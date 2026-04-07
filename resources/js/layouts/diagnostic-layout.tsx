import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';

import { PinpointLogo } from '@/components/pinpoint-logo';
import { Badge } from '@/components/ui/badge';

interface DiagnosticLayoutProps {
    children: React.ReactNode;
    /** Pass true on the quiz page which renders its own wordmark */
    hideWordmark?: boolean;
    /** Subtle tint color for the ambient top glow, e.g. '#2563EB'. Defaults to primary blue. */
    glowColor?: string;
}

export default function DiagnosticLayout({
    children,
    hideWordmark = false,
    glowColor = '#2563EB',
}: DiagnosticLayoutProps) {
    // Key changes on route so AnimatePresence remounts on navigation
    const [routeKey, setRouteKey] = useState(() =>
        typeof window !== 'undefined' ? window.location.pathname : '/',
    );

    useEffect(() => {
        const handler = () => setRouteKey(window.location.pathname);
        window.addEventListener('popstate', handler);
        // Inertia fires this event after each visit
        document.addEventListener('inertia:finish', handler as EventListener);
        return () => {
            window.removeEventListener('popstate', handler);
            document.removeEventListener('inertia:finish', handler as EventListener);
        };
    }, []);

    return (
        <div className="relative min-h-screen overflow-x-hidden bg-[#050505] antialiased text-white">
            <div className="waitlist-shell pointer-events-none fixed inset-0 z-0" />
            <div className="waitlist-grid pointer-events-none fixed inset-0 z-0" />
            <div className="waitlist-wireframe pointer-events-none absolute -left-[15%] top-[15%] z-0 aspect-square w-[110vw] max-w-[600px] opacity-40 mix-blend-overlay md:-left-[5%] md:top-[20%]" />
            <div className="waitlist-wireframe waitlist-float-delay pointer-events-none absolute -right-[15%] top-[40%] z-0 aspect-square w-[90vw] max-w-[500px] opacity-30 mix-blend-overlay md:-right-[5%] md:top-[45%]" />

            {/* ── Ambient top glow ── */}
            <div
                className="pointer-events-none absolute inset-x-0 top-0 z-0 h-[400px]"
                style={{
                    background: `radial-gradient(ellipse 70% 45% at 50% 0%, ${glowColor}25 0%, transparent 70%)`,
                }}
            />

            {/* ── Wordmark header ── */}
            {!hideWordmark && (
                <header className="relative z-10 flex items-center justify-between px-5 pt-8 sm:px-8">
                    <div className="flex items-center gap-3">
                        <PinpointLogo height={26} variant="dark" />
                    </div>
                </header>
            )}

            {/* ── Page content with enter animation ── */}
            <AnimatePresence mode="wait">
                <motion.main
                    key={routeKey}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{
                        duration: 0.35,
                        ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
                    }}
                    className="relative z-10"
                >
                    {children}
                </motion.main>
            </AnimatePresence>
        </div>
    );
}
