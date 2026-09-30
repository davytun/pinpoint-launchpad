import LandingCta from '@/components/landing/landing-cta';
import { router } from '@inertiajs/react';
import { Compass, ListChecks, PieChart, ShieldCheck } from 'lucide-react';

const STEPS = [
    {
        icon: ListChecks,
        title: 'Complete Self-Scan',
        description: 'Answer benchmark questions for a free, private, indicative score across the seven PARAGON pillars. No investor sees this.',
    },
    {
        icon: ShieldCheck,
        title: 'Take the Assessment',
        description: 'When you are ready, analysts review your evidence against PARAGON and deliver a written Assessment Report.',
    },
    {
        icon: PieChart,
        title: 'Get your readiness profile',
        description: 'Receive your score, pillar breakdown, identified gaps, and the structured profile built from the assessment.',
    },
    {
        icon: Compass,
        title: 'Get discovered on Pinpoint',
        description: 'Eligible startups can be published to Spotlight so investors on the platform can discover and review your profile.',
    },
];

export default function Blueprint() {
    return (
        <section id="blueprint" className="relative z-10 w-full py-16 font-sans sm:py-20">
            <div className="mx-auto grid w-full max-w-6xl items-start gap-10 px-6 md:px-8 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:gap-16">
                <div className="lg:pt-2">
                    <p className="text-xs font-bold tracking-widest text-[#3A54A5] uppercase">How it works</p>
                    <h2 className="font-display mt-3 max-w-sm text-3xl font-bold tracking-tight text-zinc-950 sm:text-4xl lg:text-[2.65rem] lg:leading-[1.12]">
                        From Self-Scan to investor-ready profile
                    </h2>
                    <p className="mt-4 max-w-sm text-sm leading-relaxed text-zinc-500 sm:text-base">
                        Self-Scan is free and private. The paid Assessment is where analysts review evidence. Spotlight discoverability follows
                        Assessment. It is not automatic and does not guarantee funding.
                    </p>
                    <LandingCta onClick={() => router.visit('/diagnostic')} direction="up-right" className="mt-7">
                        Start Self-Scan
                    </LandingCta>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    {STEPS.map((step) => {
                        const Icon = step.icon;

                        return (
                            <div key={step.title} className="rounded-2xl border border-zinc-200/90 bg-white p-5 sm:p-6">
                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#E4EAF8] text-[#2F468B]">
                                    <Icon className="h-5 w-5 stroke-[1.75]" aria-hidden />
                                </div>
                                <h3 className="mt-4 text-base font-bold tracking-tight text-zinc-950">{step.title}</h3>
                                <p className="mt-1.5 text-sm leading-relaxed text-zinc-500">{step.description}</p>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
