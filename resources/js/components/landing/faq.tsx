import { useState } from 'react';

const FAQS_DATA = [
    {
        q: 'What is Pinpoint?',
        a: 'Pinpoint helps founders verify their startup information, find gaps, and build a profile investors can review on the same platform. Founders use Self-Scan and Assessment; investors discover startups through Spotlight.',
    },
    {
        q: 'What is the Self-Scan?',
        a: 'Self-Scan is a free, automated diagnostic. You answer about 25 questions and get a provisional PARAGON score across seven pillars. There is no human review and no document check. Results are private to you. Nothing is shown to investors.',
    },
    {
        q: 'What is the paid Assessment (PIA)?',
        a: 'The Pinpoint Investment Assessment is a paid, analyst-led review against the PARAGON framework. You submit evidence; analysts deliver a written Assessment Report. Scope and depth depend on your stage tier.',
    },
    {
        q: 'What is the PARAGON score?',
        a: 'PARAGON measures investment-readiness across seven dimensions: Potential, Agility, Risk, Alignment, Governance, Operations, and Network. A higher score is a stronger readiness signal, not an approval to raise capital or an investment recommendation.',
    },
    {
        q: 'Does Assessment guarantee I will get funded?',
        a: 'No. Pinpoint does not guarantee funding, introductions, or investor interest. Assessment helps you understand readiness and present clearer information. Investors make their own decisions.',
    },
    {
        q: 'Who can see my information?',
        a: 'Self-Scan results are for you alone. Assessment materials stay with Pinpoint and your team unless you consent to disclosure. Spotlight listing is discretionary after Assessment and requires your consent to be visible to admitted investors.',
    },
    {
        q: 'How do investors discover startups?',
        a: 'Admitted investors use Spotlight on Pinpoint to browse published profiles, review readiness information, and request next steps such as questions, data-room access, or a mediated founder call.',
    },
    {
        q: 'How much does it cost?',
        a: 'Self-Scan is free. Paid Assessment tiers start from ₦350,000 / $500 for Concept, $1,500 for Seed, and $3,500+ for Growth. Fees are fixed for assessment work and are not contingent on whether you raise capital.',
    },
];

export default function Faq() {
    const [activeIndex, setActiveIndex] = useState<number | null>(null);

    const toggle = (idx: number) => {
        setActiveIndex(activeIndex === idx ? null : idx);
    };

    return (
        <section id="faq" className="relative z-10 w-full py-20 font-sans sm:py-24">
            <div className="mx-auto max-w-5xl px-6 md:px-8">
                <div className="mb-14">
                    <h2 className="font-display text-3xl font-bold tracking-tight text-zinc-950 sm:text-4xl md:text-5xl">
                        Frequently Asked Questions
                    </h2>
                </div>

                <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-16">
                    <div className="lg:col-span-7">
                        <div className="divide-y divide-zinc-200/60 border-t border-zinc-200/60">
                            {FAQS_DATA.map((faq, idx) => {
                                const isOpen = activeIndex === idx;
                                return (
                                    <div key={idx} className="py-5">
                                        <button
                                            type="button"
                                            onClick={() => toggle(idx)}
                                            className="group flex w-full items-start justify-between text-left focus:outline-none"
                                        >
                                            <span className="pr-4 font-sans text-base font-semibold text-zinc-900 transition-colors duration-200 group-hover:text-[#3A54A5]">
                                                {faq.q}
                                            </span>
                                            <span className="ml-2 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-zinc-200 text-zinc-400 transition-all duration-200 group-hover:border-[#3A54A5]/30 group-hover:text-[#3A54A5]">
                                                <span
                                                    className={`text-base leading-none font-medium transition-transform duration-300 ${isOpen ? 'rotate-45' : 'rotate-0'}`}
                                                >
                                                    ＋
                                                </span>
                                            </span>
                                        </button>

                                        <div
                                            className={`overflow-hidden transition-all duration-300 ease-in-out ${
                                                isOpen ? 'mt-4 max-h-96 opacity-100' : 'max-h-0 opacity-0'
                                            }`}
                                        >
                                            <p className="pr-4 text-sm leading-relaxed text-zinc-500 sm:pr-8">{faq.a}</p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    <div className="relative lg:col-span-5">
                        <div className="lg:sticky lg:top-24">
                            <div className="rounded-3xl border border-white/80 bg-white/30 p-8 shadow-[0_8px_30px_rgba(58,84,165,0.02)] backdrop-blur-md">
                                <h3 className="text-xl font-bold text-zinc-950">Still got questions?</h3>
                                <a
                                    href="mailto:hello@pinpoint.network"
                                    className="mt-6 flex w-full items-center justify-center rounded-full bg-[#3A54A5] py-3.5 text-xs font-bold tracking-widest text-white uppercase shadow-sm transition-all duration-200 hover:bg-[#2D4182] active:scale-[0.98]"
                                >
                                    Email us
                                </a>
                                <p className="mt-6 text-xs leading-relaxed text-zinc-500">
                                    We reply within 24 hours.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
