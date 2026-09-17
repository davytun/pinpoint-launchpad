import { BadgeCheck, ListChecks, Radar } from 'lucide-react';
import React from 'react';

interface BenefitCardProps {
    title: string;
    description: string;
    icon: React.ComponentType<{ className?: string }>;
}

function BenefitCard({ title, description, icon: Icon }: BenefitCardProps) {
    return (
        <div className="group relative overflow-hidden rounded-2xl border border-white/20 bg-[#3A54A5]/3 p-6 shadow-[0_4px_20px_rgba(58,84,165,0.01)] backdrop-blur-md transition-all duration-300 hover:-translate-y-0.5 hover:border-[#3A54A5]/25 hover:bg-white/20 hover:shadow-[0_8px_30px_rgba(58,84,165,0.04)]">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-[#3A54A5]/15 bg-linear-to-br from-white to-[#3A54A5]/5 text-[#3A54A5] shadow-[0_2px_10px_rgba(58,84,165,0.03)] transition-transform duration-300 group-hover:scale-105">
                <Icon className="h-5 w-5 stroke-[1.5]" />
            </div>
            <h3 className="font-display mt-4 text-lg font-bold text-zinc-950">{title}</h3>
            <p className="mt-2 max-w-[36ch] font-sans text-sm leading-relaxed text-zinc-500">{description}</p>
        </div>
    );
}

export default function WhyPinpoint() {
    return (
        <section id="why-pinpoint" className="relative z-10 w-full py-16 font-sans sm:py-20">
            <div className="mx-auto max-w-5xl px-6 md:px-8">
                <div className="grid grid-cols-1 items-start gap-10 lg:grid-cols-5 lg:gap-12">
                    <div className="space-y-4 lg:col-span-2">
                        <h2 className="font-display text-3xl font-bold tracking-tight text-zinc-950 sm:text-4xl md:text-5xl">
                            Everything investors need to understand your startup.
                        </h2>
                        <p className="font-sans text-base leading-relaxed text-zinc-500">
                            Pinpoint turns scattered claims into structured evidence across seven areas, so you know what is strong, what is missing,
                            and what investors will ask next.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 gap-4 lg:col-span-3">
                        <BenefitCard
                            title="Find the gaps first"
                            description="See where your business is weak before investors do, across market, execution, risk, and operations."
                            icon={ListChecks}
                        />
                        <BenefitCard
                            title="Turn claims into structured proof"
                            description="Organise your information into a PARAGON readiness profile analysts can assess and investors can review."
                            icon={Radar}
                        />
                        <BenefitCard
                            title="Become discoverable on Pinpoint"
                            description="After Assessment, eligible startups can appear in Spotlight, where investors on the platform review profiles."
                            icon={BadgeCheck}
                        />
                    </div>
                </div>
            </div>
        </section>
    );
}
