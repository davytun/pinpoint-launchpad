import LandingCta from '@/components/landing/landing-cta';

interface Props {
    cta: { label: string; url: string; enabled: boolean };
}

export default function InvestorLandingHero({ cta }: Props) {
    const title = 'See startups that have been reviewed, not just pitched.';
    const accent = 'reviewed, not just pitched';
    const accentAt = title.toLowerCase().indexOf(accent);

    return (
        <section className="relative isolate flex w-full flex-col items-center justify-center px-6 pt-24 pb-12 text-center sm:pt-28 md:pt-36 md:pb-20">
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

            <p className="mx-auto mt-6 max-w-2xl px-4 text-lg leading-relaxed text-zinc-500 sm:px-0 sm:text-xl">
                Pinpoint shows you a readiness score, what looks strong, what looks thin, and how to dig deeper. You decide what deserves your time.
            </p>

            <div className="mt-10 flex w-full max-w-xl flex-col items-stretch justify-center gap-3 px-4 sm:max-w-none sm:flex-row sm:items-center sm:justify-center sm:gap-4 sm:px-0">
                {cta.enabled ? (
                    <LandingCta href={cta.url} tone="green" size="lg" direction="up-right" className="w-full sm:w-auto">
                        {cta.label}
                    </LandingCta>
                ) : (
                    <p className="text-sm font-semibold text-zinc-500">Investor applications are temporarily unavailable.</p>
                )}
                <a
                    href="/verify/sample-unicorn"
                    className="inline-flex h-12 w-full items-center justify-center rounded-full border border-[#3A54A5]/30 bg-white/70 px-6 text-sm font-semibold text-[#3A54A5] backdrop-blur-sm transition-colors hover:border-[#3A54A5] hover:bg-white hover:text-[#2D4182] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3A54A5] sm:h-14 sm:w-auto sm:px-8 sm:text-base"
                >
                    See a sample profile
                </a>
            </div>

            <p className="mt-8 max-w-lg px-4 text-[11px] leading-relaxed text-zinc-400 sm:px-0">
                Curated visibility only. Not a brokerage or investment adviser. Not an offer of securities.
            </p>
        </section>
    );
}
