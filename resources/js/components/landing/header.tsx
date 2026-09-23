import { PinpointLogo } from '@/components/pinpoint-logo';
import { motion } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import { useEffect, useState } from 'react';

const NAV_ITEMS = [
    { label: 'How it works', id: 'blueprint' },
    { label: 'PARAGON', id: 'paragon-model' },
    { label: 'Assessment', href: '/assessment' },
    { label: 'Pricing', id: 'pricing' },
    { label: 'FAQ', id: 'faq' },
    { label: 'Blog', href: '/blog' },
] as const;

const DEFAULT_CTA = {
    label: 'Start Self-Scan',
    href: '/diagnostic',
};

interface HeaderProps {
    cta?: {
        label: string;
        href: string;
    };
}

export default function Header({ cta = DEFAULT_CTA }: HeaderProps) {
    const dense = cta.label.length > 18;
    const [scrolled, setScrolled] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
    const [isHome, setIsHome] = useState(true);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        setIsHome(window.location.pathname === '/' || window.location.pathname === '');
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const sectionHref = (id: string) => (isHome ? `#${id}` : `/#${id}`);

    const handleSectionNav = (id: string) => {
        setMobileOpen(false);

        if (isHome) {
            const el = document.getElementById(id);
            if (el) {
                el.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
            return;
        }

        window.location.href = `/#${id}`;
    };

    return (
        <div className={`fixed top-4 left-1/2 z-50 w-full -translate-x-1/2 px-4 font-sans ${dense ? 'max-w-7xl' : 'max-w-6xl'}`}>
            <header
                className={`flex h-15 w-full items-center justify-between rounded-full border border-white/80 bg-white/30 px-6 py-2 backdrop-blur-md transition-all duration-300 md:h-16 ${
                    scrolled ? 'border-white bg-white/50 shadow-[0_12px_40px_rgba(58,84,165,0.06)]' : 'shadow-[0_4px_20px_rgba(58,84,165,0.02)]'
                }`}
            >
                {/* Logo */}
                <a href="/" className="flex shrink-0 items-center gap-2">
                    <PinpointLogo height={25} variant="dark" />
                </a>

                {/* Desktop Nav Items with sliding background capsule */}
                <div className={`hidden shrink-0 items-center lg:flex ${dense ? 'gap-0.5' : 'gap-1.5'}`} onMouseLeave={() => setHoveredIndex(null)}>
                    {NAV_ITEMS.map((item, idx) =>
                        'href' in item && item.href ? (
                            <a
                                key={item.label}
                                href={item.href}
                                onMouseEnter={() => setHoveredIndex(idx)}
                                className={`text-zinc-650 relative cursor-pointer rounded-full py-1.5 font-semibold tracking-wide whitespace-nowrap transition-colors outline-none hover:text-zinc-950 ${dense ? 'px-2.5 text-[13px] xl:px-3.5 xl:text-[14px]' : 'px-4 text-[14.5px]'}`}
                            >
                                {hoveredIndex === idx && (
                                    <motion.span
                                        layoutId="nav-hover-pill"
                                        className="absolute inset-0 -z-10 rounded-full bg-zinc-200/50"
                                        transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                                    />
                                )}
                                <span className="relative z-10 whitespace-nowrap">{item.label}</span>
                            </a>
                        ) : (
                            <a
                                key={'id' in item ? item.id : item.label}
                                href={sectionHref('id' in item ? item.id : '')}
                                onMouseEnter={() => setHoveredIndex(idx)}
                                onClick={(e) => {
                                    if (isHome && 'id' in item) {
                                        e.preventDefault();
                                        handleSectionNav(item.id);
                                    }
                                }}
                                className={`text-zinc-650 relative cursor-pointer rounded-full py-1.5 font-semibold tracking-wide whitespace-nowrap transition-colors outline-none hover:text-zinc-950 ${dense ? 'px-2.5 text-[13px] xl:px-3.5 xl:text-[14px]' : 'px-4 text-[14.5px]'}`}
                            >
                                {hoveredIndex === idx && (
                                    <motion.span
                                        layoutId="nav-hover-pill"
                                        className="absolute inset-0 -z-10 rounded-full bg-zinc-200/50"
                                        transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                                    />
                                )}
                                <span className="relative z-10 whitespace-nowrap">{item.label}</span>
                            </a>
                        ),
                    )}
                </div>

                {/* Desktop Actions */}
                <div className={`hidden shrink-0 items-center md:flex ${dense ? 'gap-2' : 'gap-3'}`}>
                    <a
                        href="/investor"
                        className={`font-bold tracking-wide whitespace-nowrap text-zinc-600 transition-colors hover:text-zinc-950 ${dense ? 'text-[13px] xl:text-[14.5px]' : 'text-[14.5px]'}`}
                    >
                        For Investors
                    </a>
                    <a
                        href="/founder/login"
                        className={`hidden font-bold tracking-wide whitespace-nowrap text-zinc-500 transition-colors hover:text-zinc-950 xl:inline ${dense ? 'text-[13px] xl:text-[14.5px]' : 'text-[14.5px]'}`}
                    >
                        Founder Portal
                    </a>
                    <a
                        href={cta.href}
                        className={`inline-flex h-10 items-center justify-center rounded-full bg-[#3A54A5] font-bold tracking-wide whitespace-nowrap text-white transition-all duration-200 hover:bg-[#2D4182] active:scale-[0.98] ${dense ? 'px-4 text-[13px] xl:px-5 xl:text-[14px]' : 'px-5 text-[14px]'}`}
                    >
                        {cta.label}
                    </a>
                </div>

                {/* Mobile Menu Toggle */}
                <button
                    type="button"
                    onClick={() => setMobileOpen(!mobileOpen)}
                    className="flex items-center justify-center p-1.5 text-zinc-600 hover:text-zinc-900 focus:outline-none md:hidden"
                    aria-label="Toggle menu"
                >
                    {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                </button>
            </header>

            {/* Mobile Navigation Dropdown */}
            {mobileOpen && (
                <div className="animate-in slide-in-from-top-2 absolute top-16 right-4 left-4 flex flex-col gap-4 rounded-3xl border border-zinc-200/50 bg-white/95 px-6 py-6 shadow-xl backdrop-blur-lg duration-200 md:hidden">
                    {NAV_ITEMS.map((item) =>
                        'href' in item && item.href ? (
                            <a
                                key={item.label}
                                href={item.href}
                                className="text-zinc-650 border-b border-zinc-100 py-1.5 text-left text-sm font-semibold hover:text-[#3A54A5]"
                            >
                                {item.label}
                            </a>
                        ) : (
                            <a
                                key={'id' in item ? item.id : item.label}
                                href={sectionHref('id' in item ? item.id : '')}
                                onClick={(e) => {
                                    if (isHome && 'id' in item) {
                                        e.preventDefault();
                                        handleSectionNav(item.id);
                                    } else {
                                        setMobileOpen(false);
                                    }
                                }}
                                className="text-zinc-650 border-b border-zinc-100 py-1.5 text-left text-sm font-semibold hover:text-[#3A54A5]"
                            >
                                {item.label}
                            </a>
                        ),
                    )}
                    <div className="flex flex-col gap-3 pt-2">
                        <a
                            href="/investor"
                            className="rounded-full border border-zinc-200 py-2.5 text-center text-sm font-bold text-zinc-700 hover:text-zinc-900"
                        >
                            For Investors
                        </a>
                        <a
                            href="/founder/login"
                            className="rounded-full border border-zinc-200 py-2.5 text-center text-sm font-bold text-zinc-700 hover:text-zinc-900"
                        >
                            Founder Portal
                        </a>
                        <a
                            href={cta.href}
                            onClick={() => setMobileOpen(false)}
                            className="rounded-full bg-[#3A54A5] py-2.5 text-center text-sm font-bold text-white shadow-xs hover:bg-[#2D4182]"
                        >
                            {cta.label}
                        </a>
                    </div>
                </div>
            )}
        </div>
    );
}
