import { router } from '@inertiajs/react';
import LandingCta from '@/components/landing/landing-cta';

interface HeroProps {
    title?: string;
    description?: string;
    ctaPrimaryText?: string;
    ctaPrimaryHref?: string;
    ctaSecondaryText?: string;
    ctaSecondaryHref?: string;
}

export default function Hero({
    title = 'Prove your startup is ready for investment.',
    ctaPrimaryText = 'Start Self-Scan',
    ctaPrimaryHref = '/diagnostic',
    ctaSecondaryText = 'For investors',
    ctaSecondaryHref = '/investor',
}: HeroProps) {
    const accent = 'ready for investment';
    const accentAt = title.toLowerCase().indexOf(accent);

    return (
        <section className="relative isolate flex flex-col items-center justify-center px-6 pt-24 pb-12 text-center sm:pt-28 md:pt-36 md:pb-20">
            <div
                aria-hidden
                className="pointer-events-none absolute top-[12%] bottom-[8%] left-0 -z-20 w-24 sm:w-36 md:w-48 lg:w-56"
                style={{
                    backgroundImage: 'radial-gradient(circle, rgba(100, 116, 139, 0.32) 1px, transparent 1.2px)',
                    backgroundSize: '16px 16px',
                    maskImage: 'linear-gradient(to right, black 35%, transparent 100%)',
                    WebkitMaskImage: 'linear-gradient(to right, black 35%, transparent 100%)',
                }}
            />
            <div
                aria-hidden
                className="pointer-events-none absolute top-[12%] bottom-[8%] right-0 -z-20 w-24 sm:w-36 md:w-48 lg:w-56"
                style={{
                    backgroundImage: 'radial-gradient(circle, rgba(100, 116, 139, 0.32) 1px, transparent 1.2px)',
                    backgroundSize: '16px 16px',
                    maskImage: 'linear-gradient(to left, black 35%, transparent 100%)',
                    WebkitMaskImage: 'linear-gradient(to left, black 35%, transparent 100%)',
                }}
            />
            <div className="hero-bubble absolute top-[18%] left-[12%] -z-10 opacity-70 max-sm:top-[12%] max-sm:left-[5%]" />
            <div className="hero-bubble absolute right-[15%] bottom-[22%] -z-10 opacity-60 max-sm:right-[8%] max-sm:bottom-[15%]" />

            {/* Title */}
            <h1 className="font-display mx-auto max-w-5xl px-4 text-5xl font-bold tracking-tight text-zinc-950 sm:px-0 sm:text-6xl md:text-7xl md:leading-[1.08]">
                {accentAt === -1 ? (
                    title
                ) : (
                    <>
                        {title.slice(0, accentAt)}
                        <span className="text-[#2F468B]">{title.slice(accentAt, accentAt + accent.length)}</span>
                        {title.slice(accentAt + accent.length)}
                    </>
                )}
            </h1>

            {/* Description */}
            <p className="mx-auto mt-6 max-w-2xl px-4 text-lg leading-relaxed text-zinc-500 sm:px-0 sm:text-xl">
                Pinpoint helps founders verify their business information, find gaps, and build a profile investors can review on the same platform.
                Start with a free Self-Scan, then deepen with an analyst Assessment when you are ready.
            </p>

            <div className="mt-10 flex w-full max-w-xl flex-col items-stretch justify-center gap-3 px-4 sm:max-w-none sm:flex-row sm:items-center sm:justify-center sm:gap-4 sm:px-0">
                <LandingCta onClick={() => router.visit(ctaPrimaryHref)} size="lg" direction="up-right" className="w-full sm:w-auto">
                    {ctaPrimaryText}
                </LandingCta>
                <a
                    href={ctaSecondaryHref}
                    className="inline-flex h-12 w-full items-center justify-center rounded-full border border-[#3A54A5]/30 bg-white/70 px-6 text-sm font-semibold text-[#3A54A5] backdrop-blur-sm transition-colors hover:border-[#3A54A5] hover:bg-white hover:text-[#2D4182] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3A54A5] sm:h-14 sm:w-auto sm:px-8 sm:text-base"
                >
                    {ctaSecondaryText}
                </a>
            </div>
        </section>
    );
}
