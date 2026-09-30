import LandingCta from '@/components/landing/landing-cta';

export default function AudienceSplit() {
    return (
        <section className="relative z-10 w-full py-16 font-sans sm:py-20">
            <div className="mx-auto max-w-5xl px-6 md:px-8">
                <div className="rounded-4xl border border-white/80 bg-white/40 p-8 shadow-[0_8px_30px_rgba(58,84,165,0.03)] backdrop-blur-md sm:p-10 md:flex md:items-center md:justify-between md:gap-10">
                    <div className="max-w-2xl space-y-3">
                        <span className="text-xs font-bold tracking-widest text-[#3A54A5] uppercase">For investors</span>
                        <h2 className="font-display text-3xl font-bold tracking-tight text-zinc-950 sm:text-4xl">Looking to discover startups?</h2>
                        <p className="text-base leading-relaxed text-zinc-500">
                            Join Pinpoint as an investor and explore startups with structured business information, readiness scores, and
                            analyst-reviewed profiles, all on the same platform.
                        </p>
                    </div>
                    <LandingCta href="/investor" tone="green" direction="up-right" className="mt-8 shrink-0 md:mt-0">
                        Explore as an investor
                    </LandingCta>
                </div>
            </div>
        </section>
    );
}
