import { BadgeCheck, ListChecks, Radar } from 'lucide-react';
import React from 'react';

const points: {
    title: string;
    description: string;
    icon: React.ComponentType<{ className?: string }>;
}[] = [
    {
        title: 'Find the gaps first',
        description: 'See where your business is weak before investors do, across market, execution, risk, and operations.',
        icon: ListChecks,
    },
    {
        title: 'Turn claims into structured proof',
        description: 'Organise your information into a PARAGON readiness profile analysts can assess and investors can review.',
        icon: Radar,
    },
    {
        title: 'Become discoverable on Pinpoint',
        description: 'After Assessment, eligible startups can appear in Spotlight, where investors on the platform review profiles.',
        icon: BadgeCheck,
    },
];

export default function WhyPinpoint() {
    return (
        <section id="why-pinpoint" className="relative z-10 w-full bg-[#1B2E58] font-sans text-white">
            <div className="mx-auto grid w-full max-w-6xl items-center gap-6 px-6 py-8 sm:px-8 sm:py-10 lg:grid-cols-2 lg:gap-12 lg:py-12">
                    <div className="relative mx-auto w-full max-w-xs px-4 py-5 sm:max-w-sm lg:mx-0 lg:max-w-none">
                        <img
                            src="/images/founder-laptop.jpg"
                            alt="Founder reviewing work on a laptop"
                            className="aspect-[3/4] w-full rounded-[1.75rem] object-cover object-[62%_center]"
                        />
                        <div className="absolute top-1 right-0 w-[9.25rem] rounded-2xl bg-white px-3 py-2.5 text-zinc-950 shadow-[0_10px_28px_rgba(15,23,42,0.16)]">
                            <p className="text-[11px] text-zinc-500">Self-Scan</p>
                            <p className="font-display text-base leading-tight font-bold">Private to you</p>
                            <p className="mt-0.5 text-[11px] text-zinc-500">7 areas, no investors</p>
                        </div>
                        <div className="absolute bottom-8 left-0 w-[9.25rem] rounded-2xl bg-white px-3 py-2.5 text-zinc-950 shadow-[0_10px_28px_rgba(15,23,42,0.16)]">
                            <p className="text-[11px] text-zinc-500">Assessment</p>
                            <p className="font-display text-base leading-tight font-bold">Written report</p>
                            <p className="mt-0.5 text-[11px] text-zinc-500">Proof investors review</p>
                        </div>
                    </div>

                    <div>
                        <h2 className="font-display text-2xl font-bold tracking-tight text-white sm:text-3xl lg:text-[2rem] lg:leading-[1.15]">
                            Everything investors need to understand your startup.
                        </h2>
                        <p className="mt-3 max-w-md text-sm leading-relaxed text-white/70">
                            Pinpoint turns scattered claims into structured evidence across seven areas, so you know what is strong, what is missing,
                            and what investors will ask next.
                        </p>

                        <ul className="mt-5 space-y-4">
                            {points.map(({ title, description, icon: Icon }) => (
                                <li key={title} className="flex gap-3">
                                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/10 text-white">
                                        <Icon className="h-3.5 w-3.5 stroke-[1.5]" />
                                    </span>
                                    <div>
                                        <h3 className="font-display text-sm font-bold text-white">{title}</h3>
                                        <p className="mt-0.5 max-w-md text-sm leading-relaxed text-white/65">{description}</p>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
        </section>
    );
}
