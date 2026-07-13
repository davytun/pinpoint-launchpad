import { BadgeCheck, ChevronRight, Coins, Gem, Handshake } from 'lucide-react';
import React from 'react';

interface BenefitCardProps {
    title: string;
    description: string;
    icon: React.ComponentType<{ className?: string }>;
}

function BenefitCard({ title, description, icon: Icon }: BenefitCardProps) {
    return (
        <div className="group relative overflow-hidden rounded-2xl border border-white/20 bg-[#3A54A5]/3 p-5 shadow-[0_4px_20px_rgba(58,84,165,0.01)] backdrop-blur-md transition-all duration-300 hover:-translate-y-0.5 hover:border-[#3A54A5]/25 hover:bg-white/20 hover:shadow-[0_8px_30px_rgba(58,84,165,0.04)]">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-[#3A54A5]/15 bg-linear-to-br from-white to-[#3A54A5]/5 text-[#3A54A5] shadow-[0_2px_10px_rgba(58,84,165,0.03)] transition-transform duration-300 group-hover:scale-105">
                <Icon className="h-5 w-5 stroke-[1.5]" />
            </div>
            <h4 className="font-display mt-4 text-base font-bold text-zinc-950">{title}</h4>
            <p className="mt-1.5 max-w-[28ch] font-sans text-xs leading-relaxed text-zinc-500">{description}</p>
        </div>
    );
}

export default function WhyPinpoint() {
    return (
        <section id="why-pinpoint" className="relative z-10 w-full py-20 font-sans">
            <div className="mx-auto max-w-5xl px-6 md:px-8">
                <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-5">
                    {/* Left content: text & CTAs */}
                    <div className="space-y-6 lg:col-span-2">
                        <div className="space-y-3">
                            <h2 className="font-display text-3xl font-bold tracking-tight text-zinc-950 sm:text-4xl md:text-5xl">Why Pinpoint?</h2>
                            <p className="font-sans text-base leading-relaxed text-zinc-500">
                                With our PARAGON Model™, Pinpoint offers you an easier, faster, smarter, and more secure platform to either raise
                                funds for your startup or SME or de-risk your investments big time. Besides, Pinpoint is founded and managed by people
                                who haven’t only worked with startups & SMEs and investors but also love the startup and SME ecosystem. It is all
                                about having that partner you can TRUST to pinpoint projects or funds that will take you there.
                            </p>
                        </div>
                        {/* Pathway CTA buttons in a horizontal flex layout */}
                        <div className="flex flex-wrap items-center gap-2.5 pt-2">
                            <a
                                href="/diagnostic"
                                className="group flex h-10 items-center justify-between rounded-full bg-[#3A54A5] pr-1 pl-5 text-xs font-bold text-white shadow-xs transition-all duration-300 hover:bg-[#2d4182] active:scale-[0.98]"
                            >
                                <span>Apply as a Startup</span>
                                <span className="ml-2 flex h-8 w-8 items-center justify-center rounded-full bg-white/15 text-white transition-transform duration-300 group-hover:translate-x-0.5">
                                    <ChevronRight className="h-4 w-4 stroke-[2.5]" />
                                </span>
                            </a>
                            <a
                                href="/diagnostic"
                                className="flex h-10 items-center justify-center rounded-full border border-zinc-200 bg-white/60 px-5 text-xs font-bold text-zinc-700 shadow-xs transition-all duration-300 hover:border-[#3A54A5]/30 hover:bg-[#3A54A5]/5 hover:text-[#3A54A5] active:scale-[0.98]"
                            >
                                Apply as an Investor
                            </a>
                        </div>
                    </div>

                    {/* Right content: 2x2 card benefits */}
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:col-span-3">
                        <BenefitCard
                            title="Expert Curation"
                            description="A showcase of first-string startups & SMEs with high growth potential"
                            icon={Gem}
                        />
                        <BenefitCard
                            title="Cost Savings"
                            description="Startups & SMEs become investor-ready while investors de-risk their investments"
                            icon={Coins}
                        />
                        <BenefitCard
                            title="Credibility"
                            description="Credible and vetted startups & SMEs with PARAGON Model scorecards"
                            icon={BadgeCheck}
                        />
                        <BenefitCard
                            title="Exclusive Network"
                            description="A trusted and growing network of founders & entrepreneurs and investors"
                            icon={Handshake}
                        />
                    </div>
                </div>
            </div>
        </section>
    );
}
