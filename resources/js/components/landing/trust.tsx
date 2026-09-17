export default function Trust() {
    return (
        <section id="verified" className="relative z-10 w-full border-t border-zinc-200/60 py-16 font-sans sm:py-20">
            <div className="mx-auto max-w-2xl px-6 md:px-8">
                <h2 className="font-display text-2xl font-semibold tracking-tight text-zinc-950 sm:text-3xl">
                    What &ldquo;verified&rdquo; means on Pinpoint
                </h2>
                <div className="mt-5 space-y-4 text-[15px] leading-relaxed text-zinc-600">
                    <p>
                        Self-Scan is not verification. It is an automated, self-reported diagnostic with no human review of documents.
                    </p>
                    <p>
                        Assessment is where a Pinpoint analyst reviews submitted information against PARAGON. When that work is complete, a startup
                        may receive a live profile. Visibility on Spotlight requires Pinpoint criteria, founder consent, and publication. It is not
                        automatic.
                    </p>
                    <p>
                        A completed Assessment does not mean Pinpoint recommends the company for investment, or that capital will follow. Investors
                        make their own decisions.
                    </p>
                </div>
                <a
                    href="/verify/sample-unicorn"
                    className="mt-6 inline-block text-sm font-semibold text-[#3A54A5] transition-colors hover:text-[#2D4182]"
                >
                    View sample profile
                </a>
            </div>
        </section>
    );
}
