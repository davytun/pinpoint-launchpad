const DELIVERABLES = [
    { title: 'PARAGON score', detail: 'Overall readiness signal across seven dimensions' },
    { title: 'Pillar breakdown', detail: 'Where the business is strong and where evidence is thin' },
    { title: 'Assessment report', detail: 'Written analyst findings from the review window' },
    { title: 'Gap register', detail: 'Specific items that require attention before fundraising' },
    { title: 'Evidence review', detail: 'Documents and claims assessed against PARAGON criteria' },
    { title: 'Founder profile', detail: 'Structured profile path after Assessment completion' },
    { title: 'Spotlight eligibility', detail: 'Path to investor discoverability, subject to Pinpoint criteria' },
];

export default function WhatYouGet() {
    return (
        <section id="what-you-get" className="relative z-10 w-full border-t border-zinc-200/60 py-16 font-sans sm:py-20">
            <div className="mx-auto max-w-5xl px-6 md:px-8">
                <div className="max-w-2xl">
                    <h2 className="font-display text-2xl font-semibold tracking-tight text-zinc-950 sm:text-3xl md:text-4xl">
                        Assessment deliverables
                    </h2>
                    <p className="mt-4 text-[15px] leading-relaxed text-zinc-600">
                        You are paying for the review work and the written output, not a fundraising outcome.
                    </p>
                </div>

                <ul className="mt-10 divide-y divide-zinc-200 border-y border-zinc-200">
                    {DELIVERABLES.map((item) => (
                        <li key={item.title} className="grid grid-cols-1 gap-1 py-5 sm:grid-cols-[14rem_1fr] sm:gap-8">
                            <span className="text-sm font-semibold text-zinc-950">{item.title}</span>
                            <span className="text-sm leading-relaxed text-zinc-600">{item.detail}</span>
                        </li>
                    ))}
                </ul>
            </div>
        </section>
    );
}
