const STEPS = [
    {
        number: '01',
        title: 'Complete Diagnostic',
        description: 'Answer benchmark questions to evaluate baseline readiness across the 7-pillar model.',
    },
    {
        number: '02',
        title: 'Forensic Analyst Audit',
        description: 'Investment analysts independently verify bank accounts, Stripe traction, cap tables, and IP registers.',
    },
    {
        number: '03',
        title: 'Secure Verification Verdict',
        description: 'Get your official PARAGON score, digital credentials, and structured diligence checklist.',
    },
];

export default function Blueprint() {
    return (
        <section id="blueprint" className="relative z-10 w-full overflow-hidden py-24 font-sans">
            {/* Background Glow originating from bottom right, fading to top left */}
            <div className="pointer-events-none absolute -right-32 -bottom-32 -z-10 h-[600px] w-[600px] rounded-full bg-linear-to-tl from-[#3A54A5]/15 via-[#93C5FD]/10 to-transparent opacity-100 blur-[130px]" />

            <div className="mx-auto max-w-5xl px-6 md:px-8">
                {/* Section Header */}
                <div className="mx-auto max-w-2xl space-y-4 text-center">
                    <span className="text-xs font-bold tracking-widest text-[#3A54A5] uppercase">The Blueprint</span>
                    <h2 className="font-display text-4xl font-bold tracking-tight text-zinc-950 sm:text-5xl">How PARAGON Verification Works</h2>
                </div>

                {/* Steps Grid */}
                <div className="mt-16 grid grid-cols-1 gap-8 md:grid-cols-3">
                    {STEPS.map((step, idx) => (
                        <div
                            key={idx}
                            className="group relative rounded-3xl border border-white/80 bg-white/30 p-8 shadow-[0_8px_30px_rgba(58,84,165,0.03)] backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:border-white hover:bg-white/50 hover:shadow-[0_20px_40px_rgba(58,84,165,0.06)]"
                        >
                            {/* Accent Line */}
                            <div className="absolute top-0 right-8 left-8 h-[2px] bg-linear-to-r from-transparent via-[#3A54A5]/20 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

                            {/* Step Number Badge */}
                            <div className="font-display text-5xl font-black text-[#3A54A5]/10 transition-colors duration-300 group-hover:text-[#3A54A5]/25">
                                {step.number}
                            </div>

                            {/* Step Content */}
                            <h3 className="mt-4 font-sans text-lg font-bold text-zinc-950">{step.title}</h3>
                            <p className="mt-2.5 font-sans text-sm leading-relaxed text-zinc-500">{step.description}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
