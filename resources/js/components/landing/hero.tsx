import { SlidingButton } from '@/components/ui/sliding-button';
import { Link } from '@inertiajs/react';

interface HeroProps {
    title?: string;
    description?: string;
    ctaPrimaryText?: string;
    ctaPrimaryRoute?: string;
    ctaSecondaryText?: string;
    ctaSecondaryHref?: string;
}

export default function Hero({
    title = 'Prove your startup is ready for investment.',
    ctaPrimaryText = 'Start Self-Scan',
    ctaPrimaryRoute = 'diagnostic.index',
    ctaSecondaryText = 'For investors',
    ctaSecondaryHref = '/investor',
}: HeroProps) {
    return (
        <section className="relative isolate flex flex-col items-center justify-center px-6 pt-36 pb-16 text-center md:pt-48 md:pb-24">
            {/* Background Morphing Glass Bubbles */}
            <div className="hero-bubble absolute top-[18%] left-[12%] -z-10 opacity-70 max-sm:top-[12%] max-sm:left-[5%]" />
            <div className="hero-bubble absolute right-[15%] bottom-[22%] -z-10 opacity-60 max-sm:right-[8%] max-sm:bottom-[15%]" />

            {/* Title */}
            <h1 className="font-display mx-auto max-w-4xl px-4 text-4xl font-bold tracking-tight text-zinc-950 sm:px-0 sm:text-5xl md:text-6xl md:leading-[1.15]">
                {title}
            </h1>

            {/* Description */}
            <p className="mx-auto mt-6 max-w-2xl px-4 text-base leading-relaxed text-zinc-500 sm:px-0 sm:text-lg">
                Pinpoint helps founders verify their business information, find gaps, and build a profile investors can review on the same platform.
                Start with a free Self-Scan, then deepen with an analyst Assessment when you are ready.
            </p>

            <div className="mt-10 flex w-full max-w-xl flex-col items-stretch justify-center gap-3 px-4 sm:max-w-none sm:flex-row sm:items-center sm:justify-center sm:gap-4 sm:px-0">
                <Link href={route(ctaPrimaryRoute)} className="inline-flex w-full justify-center sm:w-auto">
                    <SlidingButton type="button" className="w-full min-w-0 sm:w-fit sm:min-w-[280px]">
                        {ctaPrimaryText}
                    </SlidingButton>
                </Link>
                <a
                    href={ctaSecondaryHref}
                    className="inline-flex h-12 w-full items-center justify-center rounded-xl border border-[#3A54A5]/30 bg-white/50 px-6 text-sm font-semibold text-[#3A54A5] backdrop-blur-sm transition-colors hover:border-[#3A54A5] hover:bg-white hover:text-[#2D4182] sm:h-16 sm:w-auto sm:rounded-2xl sm:px-8 sm:text-base"
                >
                    {ctaSecondaryText}
                </a>
            </div>
        </section>
    );
}
