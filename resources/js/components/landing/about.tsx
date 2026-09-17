import { ArrowRight, Search, ShieldCheck } from 'lucide-react';

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

                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <div className="rounded-4xl border border-white/80 bg-white/30 p-8 shadow-[0_8px_30px_rgba(58,84,165,0.03)] backdrop-blur-md">
                        <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-[#3A54A5]/15 bg-white/80 text-[#3A54A5] shadow-sm">
                            <Search className="h-5 w-5 stroke-[1.5]" />
                        </div>
                        <h3 className="font-display mt-5 text-2xl font-bold tracking-tight text-zinc-950">See what is missing</h3>
                        <p className="mt-3 text-base leading-relaxed text-zinc-600">
                            Start with a free Self-Scan. In about six minutes you get an indicative PARAGON score across seven areas, private to you,
                            with no investor visibility.
                        </p>
                        <a
                            href="/diagnostic"
                            className="group mt-6 inline-flex items-center gap-1.5 text-sm font-bold text-[#3A54A5] transition-colors hover:text-[#2d4182]"
                        >
                            Take the free Self-Scan
                            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                        </a>
                    </div>

                    <div className="rounded-4xl border border-white/80 bg-white/30 p-8 shadow-[0_8px_30px_rgba(58,84,165,0.03)] backdrop-blur-md">
                        <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-[#3A54A5]/15 bg-white/80 text-[#3A54A5] shadow-sm">
                            <ShieldCheck className="h-5 w-5 stroke-[1.5]" />
                        </div>
                        <h3 className="font-display mt-5 text-2xl font-bold tracking-tight text-zinc-950">Build proof investors can review</h3>
                        <p className="mt-3 text-base leading-relaxed text-zinc-600">
                            When you are ready, the paid Assessment has analysts review your evidence against PARAGON and deliver a written report:
                            the foundation for a profile investors can evaluate on Pinpoint.
                        </p>
                        <a
                            href="/assessment"
                            className="group mt-6 inline-flex items-center gap-1.5 text-sm font-bold text-[#3A54A5] transition-colors hover:text-[#2d4182]"
                        >
                            Learn about the Assessment
                            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                        </a>
                    </div>
                </div>
            </div>
        </section>
    );
}
