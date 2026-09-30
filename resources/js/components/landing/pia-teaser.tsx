import LandingCta from '@/components/landing/landing-cta';
import { FileText, Gauge, IdCard, LayoutGrid, ListChecks, Radar } from 'lucide-react';

const CARDS = [
    {
        icon: Gauge,
        title: 'PARAGON readiness score',
        body: 'One score across seven areas. A clearer readiness signal, not an approval to raise.',
    },
    {
        icon: LayoutGrid,
        title: 'Seven-pillar breakdown',
        body: 'Potential, Agility, Risk, Alignment, Governance, Operations, and Network.',
    },
    {
        icon: ListChecks,
        title: 'Identified gaps and next steps',
        body: 'See where the business is weak before investors do, and what to fix next.',
    },
    {
        icon: IdCard,
        title: 'Startup profile for investor review',
        body: 'A structured profile built from the assessment, ready for investors on Pinpoint.',
    },
    {
        icon: FileText,
        title: 'Written Assessment Report',
        body: 'Analysts review your evidence and deliver a written report. A professional opinion, not a funding guarantee or investment advice.',
        highlight: true,
    },
    {
        icon: Radar,
        title: 'Path to Spotlight',
        body: 'Eligible startups can be published so investors on Pinpoint can discover the profile. It is not automatic.',
    },
];

export default function PiaTeaser() {
    return (
        <section id="pia-teaser" className="relative z-10 w-full scroll-mt-24 bg-white py-16 font-sans sm:py-20 md:py-24">
            <div className="mx-auto w-full max-w-6xl px-6 md:px-8">
                <div className="mx-auto max-w-3xl text-center">
                    <span className="inline-flex px-3.5 py-1 text-xs font-bold tracking-widest text-[#3A54A5] uppercase">
                        What you get
                    </span>
                    <h2 className="font-display mt-5 text-3xl font-bold tracking-tight text-[#161616] sm:text-4xl md:text-5xl md:leading-[1.15]">
                        Not getting investor interest? Find out what is missing.
                    </h2>
                    <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-[#8A8A8A] sm:text-base">
                        Get a clear view of the areas that may be holding your startup back, then build an analyst-reviewed profile investors on
                        Pinpoint can actually evaluate.
                    </p>
                </div>

                <div className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {CARDS.map((card) => {
                        const Icon = card.icon;

                        return (
                            <div
                                key={card.title}
                                className={

                                    'flex h-full flex-col rounded-2xl bg-[#F5F5F3] p-6 sm:p-7'
                                }
                            >
                                <div
                                    className='flex h-10 w-10 items-center justify-center rounded-lg bg-[#E9E9E6] text-[#5C5C5C]'
                                >
                                    <Icon className="h-[18px] w-[18px] stroke-[1.75]" aria-hidden />
                                </div>
                                <h3 className="mt-10 text-[15px] font-semibold tracking-tight text-[#1A1A1A]">{card.title}</h3>
                                <p className="mt-2 text-sm leading-relaxed text-[#8A8A8A]">{card.body}</p>
                            </div>
                        );
                    })}
                </div>

                <div className="mt-10 flex justify-center">
                    <LandingCta href="/assessment" id="pia-teaser-learn-more">
                        Start Assessment
                    </LandingCta>
                </div>
            </div>
        </section>
    );
}
