import ParagonRadarChart from '@/components/ParagonRadarChart';

const PILLARS_DATA = [
    {
        name: 'Potential & Scale',
        description: 'Validating addressable market size, business model leverage, and scale vectors.',
    },
    {
        name: 'Agility & Execution',
        description: 'Auditing MVP velocity, deployment cycles, user feedback loops, and pivot capacity.',
    },
    {
        name: 'Risk Mitigation',
        description: 'Examining client dependencies, technical debt exposure, and capital runways.',
    },
    {
        name: 'Alignment & Vision',
        description: 'Evaluating cap-table structures, founder vesting, and key executive alignments.',
    },
    {
        name: 'Corporate Governance',
        description: 'Auditing boardroom processes, IP assignment records, and corporate structures.',
    },
    {
        name: 'Operational Systems',
        description: 'Validating unit economics, CAC/LTV ratios, cohort retention, and stack scalability.',
    },
    {
        name: 'Network & Ecosystem',
        description: 'Reviewing strategic supplier contracts, integration channels, and partnership networks.',
    },
];

export default function ParagonModel() {
    return (
        <section id="paragon-model" className="relative z-10 w-full py-24 font-sans">
            <div className="mx-auto max-w-5xl px-6 md:px-8">
                <div className="grid grid-cols-1 gap-16 lg:grid-cols-12">
                    {/* Left Column: Headline and Chart */}
                    <div className="space-y-8 lg:col-span-5">
                        <div className="space-y-4">
                            <span className="text-xs font-bold tracking-widest text-[#3A54A5] uppercase">The PARAGON Model</span>
                            <h2 className="font-display text-4xl font-bold tracking-tight text-zinc-950 sm:text-5xl">Seven pillars. One verdict.</h2>
                            <p className="font-sans text-base leading-relaxed text-zinc-500">
                                Our proprietary PARAGON model audits your venture across 7 critical pillars from IP Governance to Unit Economics. It's
                                the credential that turns a "Maybe" into a "Yes".
                            </p>
                        </div>
                        {/* Radar Chart Visual */}
                        <div className="w-full">
                            <ParagonRadarChart />
                        </div>
                    </div>

                    {/* Right Column: 7 Pillars List */}
                    <div className="space-y-6 lg:col-span-7 lg:pl-4">
                        <h3 className="text-xs font-bold tracking-widest text-zinc-400 uppercase">The Seven Pillars</h3>
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-1">
                            {PILLARS_DATA.map((pillar, index) => (
                                <div
                                    key={index}
                                    className="group flex gap-4 rounded-2xl border border-transparent p-4 transition-all duration-300 hover:border-[#3A54A5]/10 hover:bg-[#3A54A5]/3"
                                >
                                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#3A54A5]/5 text-xs font-bold text-[#3A54A5] transition-colors duration-300 group-hover:bg-[#3A54A5] group-hover:text-white">
                                        {index + 1}
                                    </div>
                                    <div className="space-y-1">
                                        <h4 className="font-sans text-sm font-semibold text-zinc-900">{pillar.name}</h4>
                                        <p className="font-sans text-xs leading-relaxed text-zinc-500">{pillar.description}</p>
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
