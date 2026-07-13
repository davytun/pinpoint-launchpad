export default function AudienceSplit() {
    return (
        <section className="relative z-10 w-full py-20 font-sans">
            <div className="mx-auto max-w-5xl px-6 md:px-8">
                <div className="grid grid-cols-1 gap-16 md:grid-cols-2">
                    {/* Left Column: Startups & SMEs */}
                    <div className="space-y-6">
                        <div className="space-y-3">
                            <h2 className="font-display text-4xl font-bold tracking-tight text-zinc-950 sm:text-5xl">Startups & SMEs</h2>
                            <p className="font-sans text-base leading-relaxed text-zinc-500">
                                With Pinpoint, get your startup or SME investment-ready and get connected to investors.
                            </p>
                        </div>

                        {/* Features list */}
                        <ul className="space-y-4 pt-4 text-sm text-zinc-600">
                            <li className="flex items-start gap-3">
                                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#3A54A5]" />
                                <span>Reposition your startup or SME by applying our PARAGON Model.</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#3A54A5]" />
                                <span>Gain increased credibility through our investment-readiness vetting process.</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#3A54A5]" />
                                <span>Increase your chances of raising funds through our partner investors.</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#3A54A5]" />
                                <span>Access our growing network of investors, mentors, and incubators and accelerators.</span>
                            </li>
                        </ul>
                    </div>

                    {/* Right Column: Investors */}
                    <div className="space-y-6">
                        <div className="space-y-3">
                            <h2 className="font-display text-4xl font-bold tracking-tight text-zinc-950 sm:text-5xl">Investors</h2>
                            <p className="font-sans text-base leading-relaxed text-zinc-500">
                                With Pinpoint, discover high-potential startups and MSMEs that will not waste your time.
                            </p>
                        </div>

                        {/* Features list */}
                        <ul className="space-y-4 pt-4 text-sm text-zinc-600">
                            <li className="flex items-start gap-3">
                                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#3A54A5]" />
                                <span>Meet startups and SMEs that promise significantly higher returns on investments.</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#3A54A5]" />
                                <span>Access to vetted startups and MSMEs with higher credibility for investments.</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#3A54A5]" />
                                <span>De-risk your investment portfolio in the short-term to long-term.</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#3A54A5]" />
                                <span>Access to our growing network of startups, partners, and industry players.</span>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </section>
    );
}
