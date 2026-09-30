import { Search, ShieldCheck } from 'lucide-react';

export default function About() {
    return (
        <section className="relative z-10 w-full py-16 font-sans sm:py-20">
            <div className="mx-auto max-w-5xl px-6 md:px-8">
                <div className="mx-auto mb-12 max-w-3xl space-y-4 text-center">
                    <h2 className="font-display text-3xl font-bold tracking-tight text-zinc-950 sm:text-4xl md:text-5xl">
                        A pitch deck is not proof.
                    </h2>
                    <p className="font-sans text-base leading-relaxed text-zinc-500 sm:text-lg">
                        Investors need clear information they can assess, not just a good story. Pinpoint helps founders build that proof on the same
                        platform where investors discover and review startups.
                    </p>
                </div>

                <div className="grid grid-cols-1 gap-12 sm:grid-cols-2 sm:gap-16">
                    <div>
                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#E4EAF8] text-[#2F468B]">
                            <Search className="h-5 w-5 stroke-[1.5]" />
                        </div>
                        <h3 className="font-display mt-5 text-xl font-bold tracking-tight text-zinc-950">See what is missing</h3>
                        <p className="mt-2 max-w-sm text-sm leading-relaxed text-zinc-500">
                            Start with a free Self-Scan. In about six minutes you get an indicative PARAGON score across seven areas, private to you,
                            with no investor visibility.
                        </p>
                        <a href="/diagnostic" className="mt-5 inline-flex text-sm font-medium text-zinc-950 transition-colors hover:text-[#2F468B]">
                            Take the free Self-Scan
                        </a>
                    </div>

                    <div>
                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#D4F5A4] text-[#3A7D2C]">
                            <ShieldCheck className="h-5 w-5 stroke-[1.5]" />
                        </div>
                        <h3 className="font-display mt-5 text-xl font-bold tracking-tight text-zinc-950">Build proof investors can review</h3>
                        <p className="mt-2 max-w-sm text-sm leading-relaxed text-zinc-500">
                            When you are ready, the paid Assessment has analysts review your evidence against PARAGON and deliver a written report:
                            the foundation for a profile investors can evaluate on Pinpoint.
                        </p>
                        <a href="/assessment" className="mt-5 inline-flex text-sm font-medium text-zinc-950 transition-colors hover:text-[#3A7D2C]">
                            Learn about the Assessment
                        </a>
                    </div>
                </div>
            </div>
        </section>
    );
}
