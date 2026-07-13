import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';

import { PinpointLogo } from '@/components/pinpoint-logo';
import SideRays from '@/components/SideRays';

interface DiagnosticLayoutProps {
    children: React.ReactNode;
    /** Pass true on the quiz page which renders its own wordmark */
    hideWordmark?: boolean;
    /** Subtle tint color for the ambient top glow, e.g. '#2563EB'. Defaults to primary blue. */
    glowColor?: string;
}

export default function DiagnosticLayout({ children, hideWordmark = false, glowColor = '#3A54A5' }: DiagnosticLayoutProps) {
    // Key changes on route so AnimatePresence remounts on navigation
    const [routeKey, setRouteKey] = useState(() => (typeof window !== 'undefined' ? window.location.pathname : '/'));

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
                    background: `radial-gradient(circle at top, ${glowColor}, transparent 70%)`,
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
