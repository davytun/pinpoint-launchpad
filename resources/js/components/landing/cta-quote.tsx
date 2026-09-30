import LandingCta from '@/components/landing/landing-cta';
import { ArrowRight } from 'lucide-react';

export default function CtaQuote() {
    return (
        <section className="relative z-10 w-full py-20 text-center font-sans">
            <div className="mx-auto max-w-2xl space-y-6 px-6">
                <h2 className="font-display text-3xl font-bold tracking-tight text-zinc-950 sm:text-4xl">
                    Ready to show investors what your startup is really building?
                </h2>
                <p className="text-base leading-relaxed text-zinc-600 sm:text-lg">
                    See what you are missing, build your readiness profile, and make your business easier for investors on Pinpoint to evaluate.
                </p>
                <div className="flex flex-col items-center justify-center gap-4 pt-2 sm:flex-row">
                    <LandingCta href="/diagnostic" direction="up-right">Start free Self-Scan</LandingCta>
                    <a
                        href="/assessment"
                        className="inline-flex items-center gap-1.5 text-sm font-bold text-[#3A54A5] transition-colors duration-200 hover:text-[#2D4182]"
                    >
                        Start Assessment
                        <ArrowRight className="h-3.5 w-3.5" />
                    </a>
                </div>
            </div>
        </section>
    );
}
