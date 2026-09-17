const STEPS = [
    {
        number: '01',
        title: 'Complete Self-Scan',
        description: 'Answer benchmark questions for a free, private, indicative score across the seven PARAGON pillars. No investor sees this.',
    },
    {
        number: '02',
        title: 'Take the Assessment',
        description: 'When you are ready, analysts review your evidence against PARAGON and deliver a written Assessment Report.',
    },
    {
        number: '03',
        title: 'Get your readiness profile',
        description: 'Receive your score, pillar breakdown, identified gaps, and the structured profile built from the assessment.',
    },
    {
        number: '04',
        title: 'Get discovered on Pinpoint',
        description: 'Eligible startups can be published to Spotlight so investors on the platform can discover and review your profile.',
    },
];

export default function Blueprint() {
    return (
        <section id="blueprint" className="relative z-10 w-full overflow-hidden py-20 font-sans sm:py-24">
            <div className="pointer-events-none absolute -right-32 -bottom-32 -z-10 h-[600px] w-[600px] rounded-full bg-linear-to-tl from-[#3A54A5]/15 via-[#93C5FD]/10 to-transparent opacity-100 blur-[130px]" />

            <div className="mx-auto max-w-5xl px-6 md:px-8">
                <div className="mx-auto max-w-2xl space-y-4 text-center">
                    <span className="text-xs font-bold tracking-widest text-[#3A54A5] uppercase">How it works</span>
                    <h2 className="font-display text-3xl font-bold tracking-tight text-zinc-950 sm:text-4xl md:text-5xl">
                        From Self-Scan to investor-ready profile
                    </h2>
                    <p className="text-base leading-relaxed text-zinc-500">
                        Self-Scan is free and private. The paid Assessment is where analysts review evidence. Spotlight discoverability follows
                        Assessment. It is not automatic and does not guarantee funding.
                    </p>
                </div>

                <div className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                    {STEPS.map((step, idx) => (
                        <div
                            key={idx}
                            className="group relative rounded-3xl border border-white/80 bg-white/30 p-6 shadow-[0_8px_30px_rgba(58,84,165,0.03)] backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:border-white hover:bg-white/50 hover:shadow-[0_20px_40px_rgba(58,84,165,0.06)] sm:p-7"
                        >
                            <div className="font-display text-4xl font-black text-[#3A54A5]/10 transition-colors duration-300 group-hover:text-[#3A54A5]/25 sm:text-5xl">
                                {step.number}
                            </div>
                            <h3 className="mt-3 font-sans text-base font-bold text-zinc-950 sm:text-lg">{step.title}</h3>
                            <p className="mt-2 font-sans text-sm leading-relaxed text-zinc-500">{step.description}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
