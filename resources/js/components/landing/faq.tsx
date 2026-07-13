import { useState } from 'react';

const FAQS_DATA = [
    {
        q: 'What is the PARAGON Model?',
        a: "PARAGON is Pinpoint's proprietary venture diligence framework auditing startups across 7 core pillars: Potential, Agility, Risk, Alignment, Governance, Operations, and Network. It translates operational metrics and corporate structures into a single standardized score trusted by institutional VCs.",
    },
    {
        q: 'How does the diagnostic scoring work?',
        a: 'The diagnostic is a 7-pillar self-assessment. Scoring is calculated dynamically based on baseline risk levels and operational depth. A qualifying score of 65+ (Investment Ready or Top Percentile) qualifies you to enter the formal audit queue and secure verification badges.',
    },
    {
        q: 'Why is there a $150 Gate Fee?',
        a: 'To maintain high data room integrity for our institutional investor network, we charge a $150 entry fee. This fee ensures serious applications and directly funds the manual analyst hours required to review and verify your initial diagnostic uploads.',
    },
    {
        q: 'How long does the verification audit take?',
        a: 'Typically, verification is completed within 5 to 7 business days. Once your diagnostic is complete and you choose your audit tier, our investment team begins forensic reviews of your cap table, corporate registers, and financial accounts.',
    },
    {
        q: 'How do investors access my verification page?',
        a: 'Your verification profile is live on a custom secure URL. Key metrics and badges are visible to verified network investors, but detailed diligence assets (e.g., contracts, models) remain locked. Investors must submit an access request, which you approve or reject from your dashboard.',
    },
    {
        q: 'What is the success guarantee on Tier 3?',
        a: 'For our Institutional audit, the $1,500 fee is credited back to you upon the successful close of a funding round via the PIN Network. This aligns our interests with your success, and our compensation is tied to a standard 2% equity warrant.',
    },
];

export default function Faq() {
    const [activeIndex, setActiveIndex] = useState<number | null>(null);
    const [copied, setCopied] = useState(false);

    const toggle = (idx: number) => {
        setActiveIndex(activeIndex === idx ? null : idx);
    };

    const handleCopyEmail = () => {
        navigator.clipboard.writeText('hello@pinpoint.network');
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <section id="faq" className="relative z-10 w-full py-24 font-sans">
            <div className="mx-auto max-w-5xl px-6 md:px-8">
                {/* Section Header (Stays above grid to align columns) */}
                <div className="mb-16">
                    <h2 className="font-display text-4xl font-bold tracking-tight text-zinc-950 sm:text-5xl">Frequently Asked Questions</h2>
                </div>

                {/* Grid Container */}
                <div className="grid grid-cols-1 gap-16 lg:grid-cols-12">
                    {/* Left Column: Accordion List */}
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
                                            <span className="font-sans text-base font-semibold text-zinc-900 transition-colors duration-200 group-hover:text-[#3A54A5]">
                                                {faq.q}
                                            </span>
                                            <span className="ml-4 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-zinc-200 text-zinc-400 transition-all duration-200 group-hover:border-[#3A54A5]/30 group-hover:text-[#3A54A5]">
                                                <span
                                                    className={`text-base leading-none font-medium transition-transform duration-300 ${isOpen ? 'rotate-45' : 'rotate-0'}`}
                                                >
                                                    ＋
                                                </span>
                                            </span>
                                        </button>

                                        {/* Answer Animation Area */}
                                        <div
                                            className={`overflow-hidden transition-all duration-300 ease-in-out ${
                                                isOpen ? 'mt-4 max-h-96 opacity-100' : 'max-h-0 opacity-0'
                                            }`}
                                        >
                                            <p className="pr-8 text-sm leading-relaxed text-zinc-500">{faq.a}</p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Right Column: Sticky Box */}
                    <div className="relative lg:col-span-5">
                        <div className="lg:sticky lg:top-24">
                            <div className="rounded-3xl border border-white/80 bg-white/30 p-8 shadow-[0_8px_30px_rgba(58,84,165,0.02)] backdrop-blur-md">
                                <h3 className="text-xl font-bold text-zinc-950">Still got questions?</h3>
                                <button
                                    type="button"
                                    onClick={handleCopyEmail}
                                    className="mt-6 flex w-full items-center justify-center rounded-full bg-[#3A54A5] py-3.5 text-xs font-bold tracking-widest text-white uppercase shadow-sm transition-all duration-200 hover:bg-[#2D4182] active:scale-[0.98]"
                                >
                                    {copied ? 'Copied to Clipboard!' : 'Copy email'}
                                </button>
                                <p className="mt-6 text-xs leading-relaxed text-zinc-500">
                                    I'll be happy to answer! It should take no longer than 24 hours.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
