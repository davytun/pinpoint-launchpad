import { Magnetic } from '@/components/landing/animations';
import { PinpointLogo } from '@/components/pinpoint-logo';
import { motion } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import { useEffect, useState } from 'react';

const NAV_ITEMS = [
    { label: 'Why Pinpoint', id: 'why-pinpoint' },
    { label: 'PARAGON Model', id: 'paragon-model' },
    { label: 'Blueprint', id: 'blueprint' },
    { label: 'Assessment', id: '', href: '/assessment' },
    { label: 'Pricing', id: 'pricing' },
    { label: 'FAQ', id: 'faq' },
    { label: 'Blog', id: '', href: '/blog' },
];

export default function Header() {
    const [scrolled, setScrolled] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const handleScrollTo = (id: string) => {
        setMobileOpen(false);
        const el = document.getElementById(id);
        if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    };

    return (
        <div className="fixed top-4 left-1/2 z-50 w-full max-w-5xl -translate-x-1/2 px-4 font-sans">
            <header
                className={`flex h-14 w-full items-center justify-between rounded-full border border-white/80 bg-white/30 px-6 py-2 backdrop-blur-md transition-all duration-300 ${
                    scrolled ? 'border-white bg-white/50 shadow-[0_12px_40px_rgba(58,84,165,0.06)]' : 'shadow-[0_4px_20px_rgba(58,84,165,0.02)]'
                }`}
            >
                {/* Logo */}
                <a href="#" className="flex shrink-0 items-center gap-2">
                    <PinpointLogo height={20} variant="dark" />
                </a>

                {/* Desktop Nav Items with sliding background capsule */}
                <div className="hidden items-center gap-1 md:flex" onMouseLeave={() => setHoveredIndex(null)}>
                    {NAV_ITEMS.map((item, idx) =>
                        item.href ? (
                            <a
                                key={item.label}
                                href={item.href}
                                onMouseEnter={() => setHoveredIndex(idx)}
                                className="text-zinc-650 relative cursor-pointer rounded-full px-3.5 py-1.5 text-[11px] font-semibold tracking-wide transition-colors outline-none hover:text-zinc-950"
                            >
                                {hoveredIndex === idx && (
                                    <motion.span
                                        layoutId="nav-hover-pill"
                                        className="absolute inset-0 -z-10 rounded-full bg-zinc-200/50"
                                        transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                                    />
                                )}
                                <span className="relative z-10">{item.label}</span>
                            </a>
                        ) : (
                            <button
                                key={item.id}
                                type="button"
                                onMouseEnter={() => setHoveredIndex(idx)}
                                onClick={() => handleScrollTo(item.id)}
                                className="text-zinc-650 relative cursor-pointer rounded-full px-3.5 py-1.5 text-[11px] font-semibold tracking-wide transition-colors outline-none hover:text-zinc-950"
                            >
                                {hoveredIndex === idx && (
                                    <motion.span
                                        layoutId="nav-hover-pill"
                                        className="absolute inset-0 -z-10 rounded-full bg-zinc-200/50"
                                        transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                                    />
                                )}
                                <span className="relative z-10">{item.label}</span>
                            </button>
                        ),
                    )}
                </div>

                {/* Desktop Actions */}
                <div className="hidden shrink-0 items-center gap-5 md:flex">
                    <a href="/founder/login" className="text-[11px] font-bold tracking-wide text-zinc-500 transition-colors hover:text-zinc-950">
                        Founder Portal
                    </a>
                    <Magnetic strength={0.2} range={30}>
                        <a
                            href="/diagnostic"
                            className="inline-flex h-9 items-center justify-center rounded-full bg-[#3A54A5] px-5 text-[11px] font-bold tracking-wide text-white transition-all duration-200 hover:bg-[#2D4182] active:scale-[0.98]"
                        >
                            Start Diagnostic
                        </a>
                    </Magnetic>
                </div>

                {/* Mobile Menu Toggle */}
                <button
                    type="button"
                    onClick={() => setMobileOpen(!mobileOpen)}
                    className="flex items-center justify-center p-1.5 text-zinc-500 hover:text-zinc-900 focus:outline-none md:hidden"
                    aria-label="Toggle menu"
                >
                    {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                </button>
            </header>

            {/* Mobile Navigation Dropdown */}
            {mobileOpen && (
                <div className="animate-in slide-in-from-top-2 absolute top-16 right-4 left-4 flex flex-col gap-4 rounded-3xl border border-zinc-200/50 bg-white/95 px-6 py-6 shadow-xl backdrop-blur-lg duration-200 md:hidden">
                    {NAV_ITEMS.map((item) =>
                        item.href ? (
                            <a
                                key={item.label}
                                href={item.href}
                                className="text-zinc-650 border-b border-zinc-100 py-1 text-left text-xs font-semibold hover:text-[#3A54A5]"
                            >
                                {item.label}
                            </a>
                        ) : (
                            <button
                                key={item.id}
                                type="button"
                                onClick={() => handleScrollTo(item.id)}
                                className="text-zinc-650 border-b border-zinc-100 py-1 text-left text-xs font-semibold hover:text-[#3A54A5]"
                            >
                                {item.label}
                            </button>
                        ),
                    )}
                    <div className="flex flex-col gap-3 pt-2">
                        <a
                            href="/founder/login"
                            className="rounded-full border border-zinc-200 py-2.5 text-center text-xs font-bold text-zinc-600 hover:text-zinc-900"
                        >
                            Founder Portal
                        </a>
                        <a
                            href="/diagnostic"
                            className="rounded-full bg-[#3A54A5] py-2.5 text-center text-xs font-bold text-white shadow-xs hover:bg-[#2D4182]"
                        >
                            Start Diagnostic
                        </a>
                    </div>
                </div>
            )}
        </div>
    );
}
