import { ArrowRight } from 'lucide-react';

export default function CtaQuote() {
    return (
        <section className="relative z-10 w-full py-20 text-center font-sans">
            <div className="mx-auto max-w-2xl space-y-6 px-6">
                <p className="font-display text-lg leading-relaxed text-zinc-700 md:text-xl">
                    In 2026, <span className="font-semibold text-zinc-950">capital isn't scarce but trust is.</span> Pinpoint Launchpad provides the
                    credit rating for startups, de-risking the bridge between visionary founders and institutional capital.
                </p>
                <div className="pt-2">
                    <a
                        href="/diagnostic"
                        className="inline-flex items-center gap-1.5 text-xs font-bold tracking-widest text-[#3A54A5] uppercase transition-colors duration-200 hover:text-[#2D4182]"
                    >
                        Start your diagnostic
                        <ArrowRight className="h-3.5 w-3.5" />
                    </a>
                </div>
            </div>
        </section>
    );
}
