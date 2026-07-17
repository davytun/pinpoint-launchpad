import { BadgeCheck, Coins, Gem, Handshake } from 'lucide-react';
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
                                funds for your startup or de-risk your investments. Besides, Pinpoint is founded and managed by people who haven’t
                                only worked with startups and investors but also love the startup ecosystem. It is all about having that partner you
                                can TRUST to pinpoint projects or funds that will take you there.
                            </p>
                        </div>
                    </div>

                    {/* Right content: 2x2 card benefits */}
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:col-span-3">
                        <BenefitCard
                            title="Expert Curation"
                            description="A showcase of first-string startups with high growth potential"
                            icon={Gem}
                        />
                        <BenefitCard
                            title="Cost Savings"
                            description="Startups become investor-ready while investors de-risk their investments"
                            icon={Coins}
                        />
                        <BenefitCard title="Credibility" description="Credible and vetted startups with PARAGON Model scorecards" icon={BadgeCheck} />
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
