import { Link } from '@inertiajs/react';
import { Menu, X } from 'lucide-react';
import { useEffect, useState } from 'react';

import LandingCta from '@/components/landing/landing-cta';
import { PinpointLogo } from '@/components/pinpoint-logo';

const NAV_SECTIONS = [
    { label: 'How it works', id: 'blueprint' },
    { label: 'Pricing', id: 'pricing' },
    { label: 'FAQ', id: 'faq' },
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
    const [mobileOpen, setMobileOpen] = useState(false);
    const [isHome, setIsHome] = useState(true);

    useEffect(() => {
        setIsHome(window.location.pathname === '/' || window.location.pathname === '');
    }, []);

    const sectionHref = (id: string) => (isHome ? `#${id}` : `/#${id}`);

    const handleSectionNav = (id: string) => {
        setMobileOpen(false);

        if (isHome) {
            document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
            return;
        }

        window.location.href = `/#${id}`;
    };

    return (
        <>
            <div className="fixed top-4 left-1/2 z-50 w-full max-w-6xl -translate-x-1/2 px-4 font-sans sm:px-6">
                <header className="mx-auto flex h-14 w-full items-center justify-between gap-3 rounded-full border border-white/80 bg-white/40 px-4 backdrop-blur-md sm:px-5 md:h-16 md:px-6">
                    <Link href="/" className="flex shrink-0 items-center">
                        <PinpointLogo height={24} variant="dark" />
                    </Link>

                    <nav className="hidden min-w-0 flex-1 items-center justify-center gap-5 lg:flex xl:gap-6">
                        {NAV_SECTIONS.map((item) => (
                            <a
                                key={item.id}
                                href={sectionHref(item.id)}
                                onClick={(e) => {
                                    if (isHome) {
                                        e.preventDefault();
                                        handleSectionNav(item.id);
                                    }
                                }}
                                className="text-sm font-semibold whitespace-nowrap text-zinc-600 transition-colors hover:text-zinc-950"
                            >
                                {item.label}
                            </a>
                        ))}
                        <Link
                            href="/assessment"
                            className="text-sm font-semibold whitespace-nowrap text-zinc-600 transition-colors hover:text-zinc-950"
                        >
                            Assessment
                        </Link>
                        <Link href="/blog" className="text-sm font-semibold whitespace-nowrap text-zinc-600 transition-colors hover:text-zinc-950">
                            Blog
                        </Link>
                    </nav>

                    <div className="hidden shrink-0 items-center gap-4 lg:flex xl:gap-5">
                        <Link href="/investor" className="text-sm font-semibold whitespace-nowrap text-zinc-500 transition-colors hover:text-zinc-950">
                            For investors
                        </Link>
                        <Link
                            href="/founder/login"
                            className="text-sm font-bold whitespace-nowrap text-zinc-700 transition-colors hover:text-zinc-950"
                        >
                            Founder login
                        </Link>
                        <LandingCta href={cta.href} size="sm" direction="up-right" className="shrink-0">
                            {cta.label}
                        </LandingCta>
                    </div>

                    <button
                        type="button"
                        onClick={() => setMobileOpen(!mobileOpen)}
                        className="flex shrink-0 p-1.5 text-zinc-600 lg:hidden"
                        aria-label="Toggle menu"
                    >
                        {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                    </button>
                </header>

                {mobileOpen && (
                    <div className="absolute top-18 right-4 left-4 z-50 flex flex-col gap-3 rounded-3xl border border-zinc-200/50 bg-white/95 px-6 py-5 shadow-xl backdrop-blur-lg lg:hidden">
                        {NAV_SECTIONS.map((item) => (
                            <a
                                key={item.id}
                                href={sectionHref(item.id)}
                                onClick={(e) => {
                                    if (isHome) {
                                        e.preventDefault();
                                        handleSectionNav(item.id);
                                    } else {
                                        setMobileOpen(false);
                                    }
                                }}
                                className="py-1.5 text-sm font-semibold text-zinc-700"
                            >
                                {item.label}
                            </a>
                        ))}
                        <Link href="/assessment" onClick={() => setMobileOpen(false)} className="py-1.5 text-sm font-semibold text-zinc-700">
                            Assessment
                        </Link>
                        <Link href="/blog" onClick={() => setMobileOpen(false)} className="py-1.5 text-sm font-semibold text-zinc-700">
                            Blog
                        </Link>
                        <Link href="/investor" onClick={() => setMobileOpen(false)} className="py-1.5 text-sm font-semibold text-zinc-700">
                            For investors
                        </Link>
                        <Link
                            href="/founder/login"
                            onClick={() => setMobileOpen(false)}
                            className="rounded-full border border-zinc-200 py-2.5 text-center text-sm font-bold text-zinc-700"
                        >
                            Founder login
                        </Link>
                        <LandingCta href={cta.href} direction="up-right" className="w-full justify-between" onClick={() => setMobileOpen(false)}>
                            {cta.label}
                        </LandingCta>
                    </div>
                )}
            </div>
            <div className="h-[4.5rem] shrink-0 md:h-20" aria-hidden="true" />
        </>
    );
}
