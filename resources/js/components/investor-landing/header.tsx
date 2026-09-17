import { Link } from '@inertiajs/react';
import { Menu, X } from 'lucide-react';
import { useState } from 'react';

import { PinpointLogo } from '@/components/pinpoint-logo';

interface Props {
    cta: { label: string; url: string; enabled: boolean };
}

export default function InvestorLandingHeader({ cta }: Props) {
    const [mobileOpen, setMobileOpen] = useState(false);

    return (
        <div className="relative z-50 w-full px-4 pt-4 font-sans sm:px-6">
            <header className="mx-auto flex h-14 w-full max-w-5xl items-center justify-between rounded-full border border-white/80 bg-white/40 px-5 backdrop-blur-md md:h-16 md:px-6">
                <Link href="/" className="flex shrink-0 items-center">
                    <PinpointLogo height={24} variant="dark" />
                </Link>

                <nav className="hidden items-center gap-6 md:flex">
                    <a href="#how-it-works" className="text-sm font-semibold text-zinc-600 transition-colors hover:text-zinc-950">
                        How it works
                    </a>
                    <a href="#what-you-see" className="text-sm font-semibold text-zinc-600 transition-colors hover:text-zinc-950">
                        What you review
                    </a>
                    <a href="#faq" className="text-sm font-semibold text-zinc-600 transition-colors hover:text-zinc-950">
                        FAQ
                    </a>
                    <Link href="/" className="text-sm font-semibold text-zinc-500 transition-colors hover:text-zinc-950">
                        For founders
                    </Link>
                    <Link href={route('investor.login')} className="text-sm font-bold text-zinc-700 transition-colors hover:text-zinc-950">
                        Log in
                    </Link>
                    {cta.enabled ? (
                        <a
                            href={cta.url}
                            className="inline-flex h-10 items-center justify-center rounded-full bg-[#3A54A5] px-5 text-sm font-bold text-white transition-colors hover:bg-[#2D4182]"
                        >
                            {cta.label}
                        </a>
                    ) : null}
                </nav>

                <button
                    type="button"
                    onClick={() => setMobileOpen(!mobileOpen)}
                    className="flex p-1.5 text-zinc-600 md:hidden"
                    aria-label="Toggle menu"
                >
                    {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                </button>
            </header>

            {mobileOpen && (
                <div className="absolute top-18 right-4 left-4 z-50 flex flex-col gap-3 rounded-3xl border border-zinc-200/50 bg-white/95 px-6 py-5 shadow-xl backdrop-blur-lg md:hidden">
                    <a href="#how-it-works" onClick={() => setMobileOpen(false)} className="py-1.5 text-sm font-semibold text-zinc-700">
                        How it works
                    </a>
                    <a href="#what-you-see" onClick={() => setMobileOpen(false)} className="py-1.5 text-sm font-semibold text-zinc-700">
                        What you review
                    </a>
                    <a href="#faq" onClick={() => setMobileOpen(false)} className="py-1.5 text-sm font-semibold text-zinc-700">
                        FAQ
                    </a>
                    <Link href="/" onClick={() => setMobileOpen(false)} className="py-1.5 text-sm font-semibold text-zinc-700">
                        For founders
                    </Link>
                    <Link href={route('investor.login')} onClick={() => setMobileOpen(false)} className="rounded-full border border-zinc-200 py-2.5 text-center text-sm font-bold text-zinc-700">
                        Log in
                    </Link>
                    {cta.enabled ? (
                        <a
                            href={cta.url}
                            onClick={() => setMobileOpen(false)}
                            className="rounded-full bg-[#3A54A5] py-2.5 text-center text-sm font-bold text-white"
                        >
                            {cta.label}
                        </a>
                    ) : null}
                </div>
            )}
        </div>
    );
}
