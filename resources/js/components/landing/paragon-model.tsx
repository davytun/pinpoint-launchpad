import ParagonRadarChart from '@/components/ParagonRadarChart';

const PILLARS_DATA = [
    {
        name: 'Potential',
        description: 'How big this can get, and why now.',
    },
    {
        name: 'Agility',
        description: 'How fast the team builds, learns, and adapts.',
    },
    {
        name: 'Risk',
        description: 'What could kill the deal or the company.',
    },
    {
        name: 'Alignment',
        description: 'Whether the business model and use of funds actually work.',
    },
    {
        name: 'Governance',
        description: 'Ownership, filings, and whether the company is clean to invest in.',
    },
    {
        name: 'Operations',
        description: 'Whether this runs as a real company, not just a project.',
    },
    {
        name: 'Network',
        description: 'Relationships, channels, and whether the fundraising package is ready.',
    },
];

export default function ParagonModel() {
    return (
        <section id="paragon-model" className="relative z-10 w-full py-20 font-sans sm:py-24">
            <div className="mx-auto max-w-5xl px-6 md:px-8">
                <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-16">
                    <div className="space-y-8 lg:col-span-5">
                        <div className="space-y-4">
                            <span className="text-xs font-bold tracking-widest text-[#3A54A5] uppercase">The PARAGON Model</span>
                            <h2 className="font-display text-3xl font-bold tracking-tight text-zinc-950 sm:text-4xl md:text-5xl">
                                Seven areas. One readiness score.
                            </h2>
                            <p className="font-sans text-base leading-relaxed text-zinc-500">
                                PARAGON assesses investment-readiness across seven business dimensions. The score helps you and investors understand
                                where you stand. It is not an investment decision or a guarantee you will raise.
                            </p>
                            <p className="text-sm leading-relaxed text-zinc-500">
                                Use the chart to see strengths and gaps at a glance. Stronger shape means stronger readiness signal; thinner areas
                                show where investors are likely to ask harder questions.
                            </p>
                        </div>
                        <div className="w-full">
                            <ParagonRadarChart />
                        </div>
                    </div>

                    <div className="space-y-6 lg:col-span-7 lg:pl-4">
                        <h3 className="text-xs font-bold tracking-widest text-zinc-400 uppercase">The Seven Pillars</h3>
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-1">
                            {PILLARS_DATA.map((pillar, index) => (
                                <div
                                    key={index}
                                    className="group flex gap-4 rounded-2xl border border-transparent p-4 transition-all duration-300 hover:border-[#3A54A5]/10 hover:bg-[#3A54A5]/3"
                                >
                                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#3A54A5]/5 text-xs font-bold text-[#3A54A5] transition-colors duration-300 group-hover:bg-[#3A54A5] group-hover:text-white">
                                        {index + 1}
                                    </div>
                                    <div className="space-y-1">
                                        <h4 className="font-sans text-sm font-semibold text-zinc-900 sm:text-base">{pillar.name}</h4>
                                        <p className="font-sans text-sm leading-relaxed text-zinc-500">{pillar.description}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
