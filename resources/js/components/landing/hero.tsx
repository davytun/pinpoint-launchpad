import { Magnetic } from '@/components/landing/animations';
import { SlidingButton } from '@/components/ui/sliding-button';
import { Link } from '@inertiajs/react';
import React from 'react';

const KEYWORDS = ['Convert Valuation', 'De-risk Venture', 'Investor-Ready', 'Instant Proof', 'Institutional Trust', 'Minutes, Not Months'];

interface HeroProps {
    title?: string;
    description?: string;
    ctaPrimaryText?: string;
    ctaPrimaryRoute?: string;
    ctaSecondaryText?: string;
    ctaSecondaryRoute?: string;
}

export default function Hero({
    title = "Fundraising is broken. We're fixing the proof problem.",
    ctaPrimaryText = 'Complete Self-Scan Free',
    ctaPrimaryRoute = 'diagnostic.index',
}: HeroProps) {
    return (
        <section className="relative isolate flex flex-col items-center justify-center px-6 pt-36 pb-20 text-center md:pt-48 md:pb-32">
            {/* Background Morphing Glass Bubbles */}
            <div className="hero-bubble absolute top-[18%] left-[12%] -z-10 opacity-70 max-sm:top-[12%] max-sm:left-[5%]" />
            <div className="hero-bubble absolute right-[15%] bottom-[22%] -z-10 opacity-60 max-sm:right-[8%] max-sm:bottom-[15%]" />

            {/* Eyebrow Tag */}
            <div className="mb-6 hidden items-center gap-2 rounded-lg border border-[#3A54A5]/20 bg-[#3A54A5]/10 px-4 py-1.5 text-xs font-semibold tracking-wider text-[#3A54A5] uppercase sm:inline-flex">
                Spring 2026 &middot; Now accepting early access
            </div>

            {/* Title */}
            <h1 className="font-display mx-auto max-w-4xl px-4 text-4xl font-bold tracking-tight text-zinc-950 sm:px-0 sm:text-5xl md:text-6xl md:leading-[1.15]">
                {title}
            </h1>

            {/* Description */}
            <p className="mx-auto mt-6 max-w-2xl px-4 text-base leading-relaxed text-zinc-500 sm:px-0 sm:text-lg">
                Investors don't say no because your idea is bad. They say no because they can't verify it fast enough to say yes.{' '}
                <strong className="font-bold text-zinc-950">PARAGON</strong> turns your venture into a credential they can trust in minutes, not
                months.
            </p>

            <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
                {/* Primary Pink Button */}
                <Magnetic strength={0.3} range={35}>
                    <Link href={route(ctaPrimaryRoute)} className="inline-flex">
                        <SlidingButton type="button">{ctaPrimaryText}</SlidingButton>
                    </Link>
                </Magnetic>
            </div>

            {/* Keyword Ticker */}
            <div
                className="relative left-1/2 mt-28 w-screen -translate-x-1/2 overflow-hidden bg-transparent py-12"
                style={{
                    maskImage: 'linear-gradient(to right, transparent, black 15%, black 85%, transparent)',
                    WebkitMaskImage: 'linear-gradient(to right, transparent, black 15%, black 85%, transparent)',
                }}
            >
                <div className="flex gap-16 overflow-hidden whitespace-nowrap select-none sm:gap-24">
                    <div className="animate-marquee flex min-w-full shrink-0 items-center justify-around gap-16 sm:gap-24">
                        {KEYWORDS.map((item, i) => (
                            <React.Fragment key={i}>
                                <span className="font-sans text-5xl font-bold tracking-tight text-[#3A54A5]/60 uppercase sm:text-7xl md:text-[90px]">
                                    {item}
                                </span>
                                <span className="h-2 w-10 rounded-full bg-[#3A54A5]/60 sm:h-3.5 sm:w-16" />
                            </React.Fragment>
                        ))}
                    </div>
                    {/* Duplicate for seamless looping */}
                    <div className="animate-marquee flex min-w-full shrink-0 items-center justify-around gap-16 sm:gap-24" aria-hidden="true">
                        {KEYWORDS.map((item, i) => (
                            <React.Fragment key={`dup-${i}`}>
                                <span className="font-sans text-5xl font-bold tracking-tight text-[#3A54A5]/60 uppercase sm:text-7xl md:text-[90px]">
                                    {item}
                                </span>
                                <span className="h-2 w-10 rounded-full bg-[#3A54A5]/60 sm:h-3.5 sm:w-16" />
                            </React.Fragment>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
