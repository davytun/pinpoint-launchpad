import Footer from '@/components/landing/footer';
import Header from '@/components/landing/header';
import LandingCta from '@/components/landing/landing-cta';
import SeoHead from '@/components/seo-head';

const principles = [
    [
        'Readiness is a skill, not a verdict.',
        'Every gap a founder closes makes the company stronger, whether or not a round follows. We show you exactly what to fix and how.',
    ],
    ['Proof beats polish.', 'A beautiful deck opens a door. Verified facts keep it open. We help founders lead with substance.'],
    [
        'Trust should be efficient.',
        'Investors should not have to rediscover the basics on every deal. When the groundwork is done well and done once, capital moves faster to where it belongs.',
    ],
    [
        "Africa's best companies are already being built.",
        'They do not need lowered standards. They need a fair, rigorous way to show they meet high ones.',
    ],
];

const steps = [
    [
        '01',
        'Start with the free Self-Scan',
        'Answer a focused set of questions about your company and get an instant view of where you stand and where the gaps are. No cost, no commitment.',
    ],
    ['02', 'Apply for the Pinpoint Investment Readiness Assessment', 'Our team reviews your documents and records against a structured readiness framework, the same lens a serious investor would use.'],
    ['03', 'Close the gaps', 'You receive clear findings and a practical action plan. Fix what needs fixing, with expert support where you want it.'],
    [
        '04',
        'Earn your Pinpoint profile',
        'Once assessed, your verified profile is ready for investors to review, with the facts already established.',
    ],
];

const differences = [
    [
        'Built by lawyers, not just advisers.',
        'Most readiness programmes coach founders on the pitch. Pinpoint is grounded in the legal and regulatory diligence that decides whether a deal actually closes. We know where deals break because we have spent years helping founders through them.',
    ],
    [
        'Evidence over opinion.',
        'Our assessment is structured, documented and consistent. A Pinpoint profile reflects what we verified, not what we were told.',
    ],
    [
        'Made for tough markets.',
        'Company registration, licensing, IP protection, foreign exchange, and sector regulation work differently across jurisdictions, especially Africa. Our framework is built for that reality, not adapted from somewhere else.',
    ],
    [
        'Not a crowdfunding platform.',
        'Pinpoint does not sell shares or pool money from the public. We prepare and verify companies, so that the investment conversations they have are informed, credible and efficient.',
    ],
];

export default function AboutPage() {
    return (
        <div className="min-h-screen overflow-x-hidden bg-[#F6F8FF] font-sans text-[#142044]">
            <SeoHead
                seo={{
                    title: 'About Pinpoint | Investment readiness for startups',
                    description:
                        'Pinpoint, built by Infusion Lawyers, helps founders prove their startups are investment-ready and gives investors verified profiles they can trust.',
                    og_title: 'About Pinpoint | Investment readiness for startups',
                    og_description: 'Pinpoint helps founders prove what they have built and gives investors verified profiles they can trust.',
                }}
            />

            <div className="bg-[#F7F9FF] text-[#142044]">
                <Header />
                <main>
                    <section className="bg-[#F7F9FF] px-6 pt-16 pb-16 text-center sm:px-8 sm:pt-32 sm:pb-24">
                        <div className="mx-auto max-w-6xl">
                            <h1 className="font-display mx-auto max-w-5xl text-[2.15rem] leading-[1.12] font-bold tracking-tight text-zinc-950 sm:text-5xl md:text-6xl md:leading-[1.08]">
                                Great startups deserve to be seen, clearly.
                            </h1>
                            <p className="mx-auto mt-5 max-w-4xl text-base leading-7 text-zinc-600 sm:mt-6 sm:text-xl sm:leading-relaxed">
                                Pinpoint helps founders prove what they have built, and helps investors trust what they are seeing. We verify the facts, surface the gaps, and turn a promising startup into an investment-ready one.
                            </p>
                            <div className="mt-7 flex flex-col items-center justify-center gap-3 sm:mt-9 sm:flex-row">
                                <LandingCta href="/diagnostic" size="lg">Take the free Self-Scan</LandingCta>
                                <a href="/investor" className="inline-flex h-12 items-center justify-center rounded-full border border-[#3A54A5]/30 bg-white px-7 text-sm font-semibold text-[#3A54A5] transition-colors hover:border-[#3A54A5] hover:bg-[#F1F4FF] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3A54A5] sm:h-14 sm:text-base">
                                    I&apos;m an investor
                                </a>
                            </div>
                        </div>
                    </section>

                    <section id="origin" className="bg-white px-6 py-16 text-zinc-950 sm:px-8 sm:py-28">
                        <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:gap-20">
                            <div>
                                <p className="text-xs font-bold tracking-widest text-[#3A54A5] uppercase">Our story</p>
                                <h2 className="font-display mt-4 max-w-md text-3xl leading-tight font-bold tracking-tight sm:text-4xl">
                                    We kept watching good startups lose the room.
                                </h2>
                            </div>
                            <div className="max-w-2xl space-y-5 text-[15px] leading-7 text-zinc-600 sm:space-y-6 sm:text-lg sm:leading-9">
                                <p>
                                    Pinpoint was born inside Infusion Lawyers, a firm for the knowledge economy and the digital age that has spent a decade advising founders across Africa on how to structure, protect and grow what they build.
                                </p>
                                <p>
                                    In that work, we saw a pattern we could not ignore. Brilliant teams with real products and paying customers walked into investor meetings and walked out empty-handed. This was not because the idea was weak, but because the company could not prove itself. The cap table was unclear. The IP sat in a founder&apos;s personal name. A licence was missing. The numbers did not reconcile with the pitch.
                                </p>
                                <p>
                                    On the other side of the table, investors told us the same story in reverse. They wanted to back innovation, particularly African startups, but every deal meant weeks of diligence just to establish the basics, and too many promising leads ended in red flags discovered late.
                                </p>
                                <div className="border-t border-zinc-200 pt-6 sm:pt-7">
                                    <p className="font-display text-xl leading-snug font-semibold tracking-tight text-zinc-950 sm:text-3xl">
                                        The gap was never only about access to capital. It was about trust, and trust is built on evidence.
                                    </p>
                                    <p className="mt-5">
                                        As lawyers, evidence is our craft. So we built Pinpoint to close that gap: a place where founders get ready and get verified, and investors meet companies they can take seriously from the first conversation.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </section>

                    <section className="bg-[#F7F9FF] px-6 py-16 text-zinc-950 sm:px-8 sm:py-28">
                        <div className="mx-auto max-w-6xl">
                            <h2 className="font-display mx-auto max-w-2xl text-center text-3xl font-bold tracking-tight sm:text-4xl">What we believe</h2>
                            <div className="relative mt-9 grid gap-x-24 gap-y-9 sm:mt-12 md:grid-cols-2 md:gap-y-24">
                                {principles.map(([title, description]) => (
                                    <article key={title} className="relative">
                                        <h3 className="font-display max-w-md text-xl leading-snug font-semibold tracking-tight sm:text-3xl">{title}</h3>
                                        <p className="mt-2 max-w-lg text-[15px] leading-7 text-zinc-600 sm:mt-4 sm:text-lg sm:leading-8">{description}</p>
                                    </article>
                                ))}
                            </div>
                        </div>
                    </section>

                    <section className="bg-white px-6 py-16 text-zinc-950 sm:px-8 sm:py-28">
                        <div className="mx-auto max-w-6xl">
                            <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">What we do</h2>
                            <div className="mt-8 grid gap-9 sm:mt-10 md:grid-cols-2 md:gap-16">
                                <article>
                                    <h3 className="font-display text-2xl font-semibold tracking-tight sm:text-3xl">For founders</h3>
                                    <p className="mt-4 text-[15px] leading-7 text-zinc-600 sm:mt-5 sm:text-lg sm:leading-9">
                                        Pinpoint gives you an honest, expert view of your company through an investor&apos;s eyes. We check what investors will check: your corporate structure, ownership, intellectual property, regulatory position, key contracts and the story your numbers tell. Then we show you what is strong, what is missing and what to fix first.
                                    </p>
                                    <p className="mt-4 text-[15px] leading-7 text-zinc-600 sm:mt-5 sm:text-lg sm:leading-9">
                                        The result is a verified profile you can stand behind, and the confidence of knowing there are no surprises waiting in diligence.
                                    </p>
                                </article>
                                <article className="border-t border-zinc-200 pt-8 md:border-0 md:pt-0">
                                    <h3 className="font-display text-2xl font-semibold tracking-tight sm:text-3xl">For investors</h3>
                                    <p className="mt-4 text-[15px] leading-7 text-zinc-600 sm:mt-5 sm:text-lg sm:leading-9">
                                        Pinpoint gives you a clearer starting point. Every company that earns a Pinpoint profile has been through a structured, evidence-based assessment, so you spend less time establishing the basics and more time on what matters: the team, the market and the opportunity.
                                    </p>
                                    <p className="mt-4 text-[15px] leading-7 text-zinc-600 sm:mt-5 sm:text-lg sm:leading-9">
                                        You see what was checked, what was found and what was resolved, presented in a consistent format that makes companies easy to compare.
                                    </p>
                                </article>
                            </div>
                        </div>
                    </section>

                    <section className="bg-[#F7F9FF] px-6 py-16 text-zinc-950 sm:px-8 sm:py-28">
                        <div className="mx-auto max-w-6xl">
                            <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">How it works</h2>
                            <ol className="mt-9 grid gap-x-16 gap-y-9 sm:mt-12 md:grid-cols-2 md:gap-y-16">
                                {steps.map(([number, title, description]) => (
                                    <li key={number} className="grid max-w-lg grid-cols-[2.25rem_1fr] gap-4 md:block">
                                        <span className="font-display block text-2xl leading-none font-semibold tracking-tight text-[#3A54A5] md:text-5xl">{number}</span>
                                        <div>
                                            <h3 className="font-display text-lg leading-snug font-semibold tracking-tight sm:text-2xl md:mt-5">{title}</h3>
                                            <p className="mt-2 text-[15px] leading-7 text-zinc-600 sm:mt-3 sm:text-lg sm:leading-8">{description}</p>
                                        </div>
                                    </li>
                                ))}
                            </ol>
                        </div>
                    </section>

                    <section className="bg-white px-6 py-16 text-zinc-950 sm:px-8 sm:py-28">
                        <div className="mx-auto max-w-6xl">
                            <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">What makes Pinpoint different</h2>
                            <div className="mt-9 grid gap-x-16 gap-y-9 sm:mt-12 md:grid-cols-2 md:gap-y-14">
                                {differences.map(([title, description]) => (
                                    <article key={title} className="max-w-lg">
                                        <h3 className="font-display text-xl leading-snug font-semibold tracking-tight sm:text-2xl">{title}</h3>
                                        <p className="mt-2 text-[15px] leading-7 text-zinc-600 sm:mt-4 sm:text-lg sm:leading-8">{description}</p>
                                    </article>
                                ))}
                            </div>
                        </div>
                    </section>

                    <section className="bg-[#16264A] px-6 py-16 text-white sm:px-8 sm:py-24">
                        <div className="mx-auto max-w-6xl">
                            <div className="grid gap-8 lg:grid-cols-[minmax(0,1.2fr)_minmax(18rem,0.8fr)] lg:items-end lg:gap-20">
                                <div>
                                    <h2 className="font-display max-w-2xl text-3xl leading-tight font-bold tracking-tight sm:text-4xl md:text-5xl">
                                        Ready to see your company the way investors will?
                                    </h2>
                                    <p className="mt-4 max-w-xl text-base leading-7 text-white/75 sm:mt-6 sm:leading-8 sm:text-lg">
                                        Start with the free Self-Scan. In a few minutes, you will know where you stand and what to do next.
                                    </p>
                                </div>
                                <div>
                                    <LandingCta href="/diagnostic" tone="outline" size="lg" className="w-full justify-between sm:w-auto">
                                        Take the free Self-Scan
                                    </LandingCta>
                                    <p className="mt-5 max-w-sm text-sm leading-6 text-white/70 sm:mt-7 sm:text-base">
                                        Investing in startups, especially in Africa?{' '}
                                        <a href="/investor" className="font-semibold text-white underline underline-offset-4 hover:text-[#B7E875]">
                                            Talk to us about verified deal flow.
                                        </a>
                                    </p>
                                </div>
                            </div>
                            <p className="mt-12 border-t border-white/20 pt-6 text-sm text-white/60 sm:mt-16">Pinpoint is an investment-readiness platform by Infusion Lawyers.</p>
                        </div>
                    </section>
                </main>
                <Footer />
            </div>
        </div>
    );
}
