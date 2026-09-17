import { ArrowRight } from 'lucide-react';

interface Props {
    cta: { label: string; url: string; enabled: boolean };
}

export default function InvestorLandingHero({ cta }: Props) {
    return (
        <section className="relative isolate z-10 mx-auto flex w-full max-w-5xl flex-col items-center px-6 pt-20 pb-14 text-center sm:pt-28 sm:pb-16 md:px-8 md:pt-32">
            <div className="hero-bubble absolute top-[18%] left-[12%] -z-10 opacity-60 max-sm:top-[12%] max-sm:left-[5%]" />
            <div className="hero-bubble absolute right-[15%] bottom-[18%] -z-10 opacity-50 max-sm:right-[8%] max-sm:bottom-[12%]" />

            <h1 className="font-display max-w-3xl text-4xl font-bold tracking-tight text-zinc-950 sm:text-5xl md:text-6xl md:leading-[1.12]">
                See startups that have been reviewed, not just pitched.
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-relaxed text-zinc-500 sm:text-lg">
                Pinpoint shows you a readiness score, what looks strong, what looks thin, and how to dig deeper. You decide what deserves your time.
            </p>

            <div className="mt-10 flex w-full max-w-md flex-col items-stretch gap-3 sm:max-w-none sm:flex-row sm:items-center sm:justify-center sm:gap-4">
                {cta.enabled ? (
                    <a
                        href={cta.url}
                        className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-[#3A54A5] px-7 text-sm font-bold text-white transition-colors hover:bg-[#2D4182] sm:h-14 sm:rounded-2xl sm:px-8 sm:text-base"
                    >
                        {cta.label}
                        <ArrowRight className="h-4 w-4" />
                    </a>
                ) : (
                    <p className="text-sm font-semibold text-zinc-500">Investor applications are temporarily unavailable.</p>
                )}
                <a
                    href="/verify/sample-unicorn"
                    className="inline-flex h-12 items-center justify-center rounded-xl border border-[#3A54A5]/30 bg-white/50 px-7 text-sm font-semibold text-[#3A54A5] backdrop-blur-sm transition-colors hover:border-[#3A54A5] hover:bg-white sm:h-14 sm:rounded-2xl sm:px-8 sm:text-base"
                >
                    See a sample profile
                </a>
            </div>

            <p className="mt-8 max-w-lg text-[11px] leading-relaxed text-zinc-400">
                Curated visibility only. Not a brokerage or investment adviser. Not an offer of securities.
            </p>
        </section>
    );
}
