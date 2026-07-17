import { cn } from '@/lib/utils';
import { Activity, Clock, ShieldCheck, Users } from 'lucide-react';
import React from 'react';
import { CobeGlobe } from './cobe-globe';

// ----------------------------------------------------
// UI Card Helper Component (Glassmorphic)
// ----------------------------------------------------
function FeatureCard({ children, className }: { children: React.ReactNode; className?: string }) {
    return (
        <div
            className={cn(
                'group relative overflow-hidden rounded-4xl border border-white/10 bg-[#3A54A5]/3 p-1.5 shadow-[0_4px_25px_rgba(58,84,165,0.01)] transition-all duration-500 ease-out hover:-translate-y-0.5 hover:border-[#3A54A5]/20 hover:shadow-[0_12px_40px_rgba(58,84,165,0.04)]',
                className,
            )}
        >
            <div className="relative h-full w-full rounded-[1.625rem] border border-white/20 bg-white/10 px-6 pt-8 pb-6 shadow-[inset_0_1px_2px_rgba(255,255,255,0.15)] backdrop-blur-lg sm:px-8">
                {children}
            </div>
        </div>
    );
}

function FeatureTitle({ className, ...props }: React.ComponentProps<'h3'>) {
    return <h3 className={cn('font-display text-2xl font-bold tracking-tight text-zinc-950 md:text-3xl', className)} {...props} />;
}

function FeatureDescription({ className, ...props }: React.ComponentProps<'p'>) {
    return <p className={cn('max-w-[42ch] font-sans text-base leading-relaxed text-zinc-500', className)} {...props} />;
}

// ----------------------------------------------------
// MAIN CONTENT CARDS
// ----------------------------------------------------

function WhatWeDoCard() {
    return (
        <div className="grid h-full items-center gap-6 md:grid-cols-2">
            {/* Left Column: Text */}
            <div className="relative z-10 space-y-4 py-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full border border-[#3A54A5]/15 bg-white/80 shadow-sm">
                    <ShieldCheck className="h-5 w-5 text-[#3A54A5]" />
                </div>
                <div className="space-y-3">
                    <FeatureTitle>What We Do</FeatureTitle>
                    <FeatureDescription>
                        We get startups investment-ready, significantly de-risking them for investors that we then connect with these startups.
                    </FeatureDescription>
                </div>
                <div className="pt-2">
                    <a
                        href="/diagnostic"
                        className="group inline-flex items-center gap-1.5 text-base font-bold text-[#3A54A5] transition-colors hover:text-[#2d4182]"
                    >
                        Learn More
                        <span className="inline-block translate-x-0 transform transition-transform duration-200 group-hover:translate-x-1">→</span>
                    </a>
                </div>
            </div>
            {/* Right Column: Mockup Visual Wrapper */}
            <div className="relative h-[160px] w-full overflow-hidden md:h-[180px]">
                <div
                    className="absolute right-[-10px] bottom-[-10px] h-[150px] w-[90%] max-w-[280px] overflow-hidden rounded-tl-3xl border border-zinc-200/80 bg-white p-4 shadow-2xl md:w-[90%]"
                    style={{
                        maskImage: 'linear-gradient(to bottom, black 75%, transparent 100%), linear-gradient(to right, black 75%, transparent 100%)',
                        WebkitMaskImage:
                            'linear-gradient(to bottom, black 75%, transparent 100%), linear-gradient(to right, black 75%, transparent 100%)',
                        maskComposite: 'intersect',
                        WebkitMaskComposite: 'source-in',
                    }}
                >
                    <div className="flex items-center justify-between border-b border-zinc-100 pb-2.5">
                        <div>
                            <h5 className="text-[10px] font-bold text-zinc-800">Readiness Scorecard</h5>
                            <p className="text-[7px] text-zinc-400">Diagnostic Verification v1.0</p>
                        </div>
                        <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[9px] font-bold text-emerald-600">94% Vetted</span>
                    </div>
                    <div className="space-y-2 pt-2 text-[9px]">
                        <div className="flex items-center gap-2 font-semibold text-zinc-800">
                            <span className="flex h-4 w-4 items-center justify-center rounded-full bg-emerald-50 text-[8px] font-bold text-emerald-600">
                                ✓
                            </span>
                            <span>Financial Audit Verified</span>
                        </div>
                        <div className="flex items-center gap-2 font-semibold text-zinc-800">
                            <span className="flex h-4 w-4 items-center justify-center rounded-full bg-emerald-50 text-[8px] font-bold text-emerald-600">
                                ✓
                            </span>
                            <span>Legal & Tax Vetting Cleared</span>
                        </div>
                        <div className="flex items-center gap-2 font-semibold text-zinc-800">
                            <span className="flex h-4 w-4 items-center justify-center rounded-full bg-emerald-50 text-[8px] font-bold text-emerald-600">
                                ✓
                            </span>
                            <span>Asset Valuation Complete</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function HowWeDoItCard() {
    return (
        <div className="flex h-full flex-col gap-4">
            <div className="relative z-10 space-y-3 py-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-full border border-[#3A54A5]/15 bg-white/80 shadow-sm">
                    <Activity className="h-5 w-5 text-[#3A54A5]" />
                </div>
                <div className="space-y-2">
                    <FeatureTitle>How We Do It</FeatureTitle>
                    <FeatureDescription>
                        We evaluate eligible startups with our proprietary PARAGON Model™ and onboard the vetted startups on our global platform.
                    </FeatureDescription>
                </div>
            </div>
            {/* PARAGON Model Grade Visual with Bottom/Right Mask */}
            <div className="relative h-[110px] w-full overflow-hidden">
                <div
                    className="absolute inset-x-6 bottom-[-10px] h-[110px] overflow-hidden rounded-t-2xl border border-[#3A54A5]/10 bg-white p-3 shadow-lg"
                    style={{
                        maskImage: 'linear-gradient(to bottom, black 75%, transparent 100%), linear-gradient(to right, black 80%, transparent 100%)',
                        WebkitMaskImage:
                            'linear-gradient(to bottom, black 75%, transparent 100%), linear-gradient(to right, black 80%, transparent 100%)',
                        maskComposite: 'intersect',
                        WebkitMaskComposite: 'source-in',
                    }}
                >
                    <div className="flex items-center justify-between border-b border-zinc-100 pb-1.5">
                        <div>
                            <h5 className="text-[9px] font-bold text-zinc-800">PARAGON Evaluation</h5>
                            <p className="text-[6px] text-zinc-400">Proprietary Scoring</p>
                        </div>
                        <span className="rounded bg-[#3A54A5]/10 px-1.5 py-0.5 text-[8px] font-bold text-[#3A54A5]">GRADE A+</span>
                    </div>
                    <div className="space-y-1.5 pt-1 text-[8px] text-zinc-700">
                        <div className="flex justify-between border-b border-zinc-50 pb-0.5">
                            <span>Traction Index</span>
                            <span className="font-bold text-zinc-900">8.9 / 10</span>
                        </div>
                        <div className="flex justify-between border-b border-zinc-50 pb-0.5">
                            <span>Market Viability</span>
                            <span className="font-bold text-zinc-900">9.2 / 10</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function WhoWeWorkWithCard() {
    return (
        <div className="flex h-full flex-col gap-4">
            <div className="relative z-10 space-y-3 py-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-full border border-[#3A54A5]/15 bg-white/80 shadow-sm">
                    <Users className="h-5 w-5 text-[#3A54A5]" />
                </div>
                <div className="space-y-2">
                    <FeatureTitle>Who we Work With</FeatureTitle>
                    <FeatureDescription>
                        We work with early-stage startup founders as well as individual and corporate investors who are looking to invest in a safer
                        future.
                    </FeatureDescription>
                </div>
            </div>
            {/* Globe Visual at the bottom with mask */}
            <div className="relative h-[130px] w-full overflow-hidden">
                <div
                    className="absolute right-[-15%] bottom-[-20%] h-[180px] w-[180px] overflow-hidden"
                    style={{
                        maskImage: 'radial-gradient(circle at center, black 40%, transparent 95%)',
                        WebkitMaskImage: 'radial-gradient(circle at center, black 40%, transparent 95%)',
                    }}
                >
                    <CobeGlobe className="h-full w-full scale-100" />
                </div>
            </div>
        </div>
    );
}

function WhyYouNeedUsCard() {
    return (
        <div className="grid h-full items-center gap-6 md:grid-cols-2">
            {/* Left Column: Text */}
            <div className="relative z-10 space-y-4 py-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full border border-[#3A54A5]/15 bg-white/80 shadow-sm">
                    <Clock className="h-5 w-5 text-[#3A54A5]" />
                </div>
                <FeatureTitle>Why You Need Us</FeatureTitle>
                <div className="space-y-4">
                    <div className="space-y-1.5">
                        <h4 className="font-display text-[10px] font-black tracking-widest text-[#3A54A5]">STARTUPS</h4>
                        <p className="max-w-[42ch] text-sm leading-relaxed text-zinc-500">
                            Significantly save yourself the time and resources it costs you trying to raise funds without first making your enterprise
                            investment-ready and more visible to investors.
                        </p>
                    </div>
                    <div className="space-y-1.5">
                        <h4 className="font-display text-[10px] font-black tracking-widest text-[#3A54A5]">INVESTORS</h4>
                        <p className="max-w-[42ch] text-sm leading-relaxed text-zinc-500">
                            Significantly save yourself the time and resources it costs you seeking investable startups on your own when we can easily
                            pinpoint you there.
                        </p>
                    </div>
                </div>
            </div>
            {/* Right Column: Visual Wrapper */}
            <div className="relative h-[140px] w-full overflow-hidden md:h-[160px]">
                <div
                    className="absolute right-[-10px] bottom-[-10px] flex h-[120px] w-[90%] max-w-[280px] flex-col justify-center overflow-hidden rounded-tl-3xl border border-zinc-200/60 bg-white/50 p-4 shadow-2xl backdrop-blur-xs md:w-[90%]"
                    style={{
                        maskImage: 'linear-gradient(to bottom, black 75%, transparent 100%), linear-gradient(to right, black 75%, transparent 100%)',
                        WebkitMaskImage:
                            'linear-gradient(to bottom, black 75%, transparent 100%), linear-gradient(to right, black 75%, transparent 100%)',
                        maskComposite: 'intersect',
                        WebkitMaskComposite: 'source-in',
                    }}
                >
                    <div className="space-y-3">
                        <div className="space-y-1">
                            <div className="flex justify-between text-[9px] font-bold text-zinc-900">
                                <span>Traditional Raise</span>
                                <span className="font-bold text-red-500">6 - 9 Mos</span>
                            </div>
                            <div className="h-2 w-full overflow-hidden rounded-full bg-zinc-100/80">
                                <div className="h-full w-[90%] rounded-full bg-red-400" />
                            </div>
                        </div>
                        <div className="space-y-1">
                            <div className="flex justify-between text-[9px] font-bold text-zinc-900">
                                <span>PARAGON</span>
                                <span className="font-bold text-[#3A54A5]">5 Days</span>
                            </div>
                            <div className="h-2 w-full overflow-hidden rounded-full bg-zinc-100/80">
                                <div className="h-full w-[15%] rounded-full bg-[#3A54A5]" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

// ----------------------------------------------------
// ABOUT US SECTION LAYOUT (BENTO GRID)
// ----------------------------------------------------

const features = [
    {
        id: 'what-we-do',
        children: <WhatWeDoCard />,
        className: 'md:col-span-4 sm:col-span-2',
    },
    {
        id: 'how-we-do-it',
        children: <HowWeDoItCard />,
        className: 'md:col-span-2 sm:col-span-1',
    },
    {
        id: 'who-we-work-with',
        children: <WhoWeWorkWithCard />,
        className: 'md:col-span-2 sm:col-span-1',
    },
    {
        id: 'why-you-need-us',
        children: <WhyYouNeedUsCard />,
        className: 'md:col-span-4 sm:col-span-2',
    },
];

export default function About() {
    return (
        <section className="relative z-10 w-full py-16 font-sans">
            <div className="mx-auto max-w-5xl px-6 md:px-8">
                {/* Centered Header */}
                <div className="mx-auto mb-12 max-w-3xl space-y-4 text-center font-sans">
                    <h2 className="font-display text-3xl font-bold tracking-tight text-zinc-950 sm:text-4xl md:text-5xl">
                        Empowering Startups & Investors
                    </h2>
                    <p className="font-sans text-base text-zinc-500 sm:text-lg">
                        Accelerating readiness, de-risking ventures, and connecting global capital.
                    </p>
                </div>

                {/* Bento Grid */}
                <div className="relative mx-auto grid w-full grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-6">
                    {features.map((feature) => (
                        <FeatureCard className={feature.className} key={feature.id}>
                            {feature.children}
                        </FeatureCard>
                    ))}
                </div>
            </div>
        </section>
    );
}
