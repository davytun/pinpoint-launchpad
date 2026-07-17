import { Head, useForm } from '@inertiajs/react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, Check } from 'lucide-react';
import { useRef, useState } from 'react';

import { PinpointLogo } from '@/components/pinpoint-logo';
import SideRays from '@/components/SideRays';
import { cn } from '@/lib/utils';

// ─── Data ─────────────────────────────────────────────────────────────────────

const STAGES = [
    { value: 'pre_seed_concept', label: 'Pre-seed / concept' },
    { value: 'seed', label: 'Seed' },
    { value: 'seed_plus_growth', label: 'Seed+ / growth' },
    { value: 'series_a_plus', label: 'Series A+' },
];

const SECTORS = [
    { value: 'fintech_payments', label: 'Fintech / Payments' },
    { value: 'blockchain_digital_assets', label: 'Blockchain / Digital assets' },
    { value: 'healthtech', label: 'Healthtech' },
    { value: 'agritech', label: 'Agritech' },
    { value: 'edtech', label: 'Edtech' },
    { value: 'logistics_mobility', label: 'Logistics / Mobility' },
    { value: 'commerce_retail', label: 'Commerce / Retail' },
    { value: 'energy_climate', label: 'Energy / Climate' },
    { value: 'enterprise_ai', label: 'Enterprise / AI' },
    { value: 'sector_agnostic', label: 'Sector-agnostic' },
];

const GEOGRAPHIES = [
    { value: 'nigeria', label: 'Nigeria' },
    { value: 'west_africa', label: 'West Africa' },
    { value: 'north_africa', label: 'North Africa' },
    { value: 'east_africa', label: 'East Africa' },
    { value: 'southern_africa', label: 'Southern Africa' },
    { value: 'pan_african', label: 'Pan-African' },
];

const CHEQUE_SIZES = ['Under $25k', '$25k–$100k', '$100k–$500k', '$500k–$2m', '$2m–$10m', 'Over $10m'];
const INSTRUMENTS = ['Equity', 'SAFE / convertible', 'Debt / venture debt', 'Grant / catalytic', 'Flexible'];
const DEALS_PER_YEAR = ['1–2', '3–5', '6–10', '10+'];

const COUNTRIES = [
    'Nigeria', 'Ghana', 'Kenya', 'South Africa', 'Egypt',
    'United Kingdom', 'United States', 'United Arab Emirates',
    'Other — Africa', 'Other — rest of world'
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function FadeUp({ delay = 0, children, className = '' }: { delay?: number; children: React.ReactNode; className?: string }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.6, delay, ease: [0.16, 1, 0.3, 1] }}
            className={className}
        >
            {children}
        </motion.div>
    );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function Index() {
    const applyRef = useRef<HTMLDivElement>(null);
    const [submitted, setSubmitted] = useState(false);

    const { data, setData, post, processing, errors, clearErrors } = useForm({
        investor_type: '',
        name: '',
        email: '',
        organisation: '',
        role: '',
        country: '',
        website: '',
        stages: [] as string[],
        sectors: [] as string[],
        geographies: [] as string[],
        cheque_size: '',
        instrument: '',
        deals_per_year: '',
        fund_detail: '',
        thesis_notes: '',
        confirmations: {
            investor_status: false,
            risk_understood: false,
            no_recommendation: false,
            aml_source_of_funds: false,
            terms_agreed: false,
        },
    });

    const handleTypeSelect = (type: string) => {
        setData(prev => {
            const organisation = type === 'angel' ? prev.organisation : prev.organisation;
            const fund_detail = type === 'angel' ? '' : prev.fund_detail;
            return { ...prev, investor_type: type, organisation, fund_detail };
        });
        clearErrors('investor_type');
    };

    const toggleMultiSelect = (field: 'stages' | 'sectors' | 'geographies', value: string) => {
        setData(prev => {
            const arr = prev[field];
            const updated = arr.includes(value) ? arr.filter(v => v !== value) : [...arr, value];
            return { ...prev, [field]: updated };
        });
    };

    const handleCheckboxChange = (key: keyof typeof data.confirmations) => {
        setData(prev => ({
            ...prev,
            confirmations: {
                ...prev.confirmations,
                [key]: !prev.confirmations[key],
            },
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/investor/apply', {
            onSuccess: () => {
                setSubmitted(true);
                scrollToSection('apply');
            },
        });
    };

    const scrollToSection = (id: string) => {
        if (id === 'apply') {
            applyRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        } else {
            const el = document.getElementById(id);
            if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    };

    const inputCls = (field: string) =>
        cn(
            'w-full rounded-xl border bg-white/80 px-4 py-3.5 text-sm text-zinc-900 placeholder-zinc-400 transition-all duration-300 shadow-xs focus:ring-2 focus:ring-[#3A54A5]/10 focus:bg-white focus:outline-none',
            errors[field as keyof typeof errors] ? 'border-red-300 focus:border-red-400 focus:ring-red-100' : 'border-zinc-200/80 focus:border-[#3A54A5]/40',
        );

    return (
        <>
            <Head>
                <title>Pinpoint Investment Network (PIN) — Membership Application</title>
                <meta name="description" content="Apply to join the Pinpoint Investment Network. Get visibility into validated early-stage dealflow evaluated under the PARAGON model." />
            </Head>

            <div className="relative min-h-screen bg-linear-to-b from-[#f1f4ff] via-[#f5f8ff] to-white font-sans text-zinc-900 selection:bg-zinc-950 selection:text-white">

                <div className="pointer-events-none fixed inset-0 z-0">
                    <SideRays
                        rayColor1="#3A54A5"
                        rayColor2="#93C5FD"
                        origin="top-left"
                        speed={1.8}
                        intensity={1.2}
                        spread={2}
                        tilt={0}
                        saturation={1.5}
                        blend={0.35}
                        falloff={2.3}
                        opacity={0.42}
                    />
                </div>

                {/* ── Sticky Nav (Light Mode) ── */}
                <div className="sticky top-4 z-50 mx-auto max-w-5xl px-4">
                    <header className="flex h-14 w-full items-center justify-between rounded-full border border-zinc-200/80 bg-white/70 px-6 shadow-[0_8px_30px_rgba(0,0,0,0.03)] backdrop-blur-md">
                        <a href="/" className="flex shrink-0 items-center">
                            <PinpointLogo height={20} variant="dark" />
                        </a>
                        <div className="flex items-center gap-5">
                            <a href="/diagnostic" className="text-zinc-555 hidden text-xs font-bold transition hover:text-zinc-950 md:block">
                                Take the free Self-Scan
                            </a>
                            <button
                                type="button"
                                onClick={() => scrollToSection('apply')}
                                className="inline-flex h-9 cursor-pointer items-center justify-center rounded-full bg-[#3A54A5] px-5 text-xs font-bold whitespace-nowrap text-white shadow-xs transition hover:bg-[#2d4182] active:scale-[0.98]"
                            >
                                <span className="hidden sm:inline">Apply to Join</span>
                                <span className="sm:hidden">Apply</span>
                            </button>
                        </div>
                    </header>
                </div>

                {/* ── Hero Section ── */}
                <section className="relative z-10 pt-20 pb-20 md:pt-28 md:pb-24">
                    <div className="mx-auto max-w-5xl px-6 md:px-8">
                        <div className="grid items-center gap-12 lg:grid-cols-[1.2fr_1fr]">
                            {/* Left Side: Headline & Intro */}
                            <div>
                                <FadeUp delay={0.06}>
                                    <span className="text-[11px] font-bold tracking-widest text-[#3A54A5] uppercase block mb-3">
                                        The Pinpoint Investment Network
                                    </span>
                                    <h1 className="font-display text-4.5xl leading-[1.05] font-bold tracking-tight text-zinc-950 sm:text-5xl md:text-6xl">
                                        The diligence is done. <br />What remains is your decision.
                                    </h1>
                                </FadeUp>
                                <FadeUp delay={0.1}>
                                    <p className="mt-6 max-w-2xl text-base leading-relaxed font-medium text-zinc-500">
                                        Every company you see in the PIN has been through the PARAGON assessment — its cap table reconciled, its IP chain checked, its numbers tested against its accounts, its founders interviewed apart.
                                    </p>
                                    <p className="mt-4 max-w-2xl text-sm leading-relaxed font-medium text-zinc-400">
                                        You are not sifting pitches. You are looking at companies whose weakest points have already been found and named.
                                    </p>
                                </FadeUp>
                                <FadeUp delay={0.14}>
                                    <div className="mt-8 flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                                        <button
                                            type="button"
                                            onClick={() => scrollToSection('apply')}
                                            className="inline-flex h-12 cursor-pointer items-center justify-center gap-2 rounded-full bg-[#3A54A5] px-8 text-sm font-bold text-white shadow-md transition hover:bg-[#2D4182] active:scale-[0.98]"
                                        >
                                            Apply for membership <ArrowRight className="h-4 w-4" />
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => scrollToSection('value')}
                                            className="inline-flex h-12 cursor-pointer items-center justify-center rounded-full border border-zinc-200 bg-white/60 px-8 text-sm font-bold text-zinc-700 shadow-xs transition hover:border-[#3A54A5]/30 hover:bg-[#3A54A5]/5 hover:text-[#3A54A5] active:scale-[0.98]"
                                        >
                                            How it works
                                        </button>
                                    </div>
                                </FadeUp>
                            </div>

                            {/* Right Side: Hero Image Mockup */}
                            <FadeUp delay={0.18} className="relative lg:mt-6">
                                {/* Background glow behind image */}
                                <div className="pointer-events-none absolute inset-0 -z-10 flex items-center justify-center">
                                    <div className="h-[250px] w-[250px] rounded-full bg-[#3A54A5]/10 blur-[60px]" />
                                </div>
                                <div className="relative rounded-4xl border border-white/85 bg-white/20 p-2 shadow-2xl backdrop-blur-md">
                                    <div className="overflow-hidden rounded-[1.625rem] border border-zinc-200/80 bg-zinc-950/5 shadow-inner">
                                        <img
                                            src="/diligence_dashboard_mockup.png"
                                            alt="PARAGON Diligence Dashboard Profile Preview"
                                            className="w-full object-cover transition-transform duration-500 hover:scale-[1.02]"
                                            fetchPriority="high"
                                        />
                                    </div>
                                </div>
                            </FadeUp>
                        </div>
                    </div>
                </section>

                {/* ── Stat Band ── */}
                <section className="relative z-10 mx-auto max-w-5xl px-6 md:px-8 mb-16">
                    <div className="rounded-3xl border border-white/80 bg-white/30 p-8 shadow-[0_8px_30px_rgba(58,84,165,0.02)] backdrop-blur-md">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-left">
                            {[
                                { stat: '37', desc: 'assessment criteria every company is measured against' },
                                { stat: '22', desc: 'deal-stoppers surfaced before you ever see a company' },
                                { stat: '7', desc: 'PARAGON dimensions, evidence-graded, not self-reported' },
                            ].map((item, idx) => (
                                <div key={idx} className="space-y-2 md:border-r border-zinc-200/40 md:pr-8 last:border-0 last:pr-0">
                                    <p className="font-display text-5xl font-black text-[#C8A951]">{item.stat}</p>
                                    <p className="text-[10px] font-bold tracking-wider text-zinc-500 uppercase leading-relaxed">
                                        {item.desc}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ── The Problem Section ── */}
                <section className="border-b border-zinc-200/50 bg-white py-24">
                    <div className="mx-auto max-w-5xl px-6 md:px-8 space-y-16">
                        <FadeUp className="max-w-3xl space-y-4">
                            <span className="text-[11px] font-bold tracking-widest text-[#3A54A5] uppercase">Why this exists</span>
                            <h2 className="font-display sm:text-4.5xl text-3xl font-bold tracking-tight text-zinc-950">
                                Early-stage dealflow in Africa is not scarce. Signal is.
                            </h2>
                            <p className="text-base text-zinc-500 max-w-2xl leading-relaxed">
                                The problem was never finding companies. It was the weeks spent discovering, deep in diligence, the one thing that ends the deal — the unassigned IP, the customer at sixty percent of revenue, the cap table that does not reconcile.
                            </p>
                        </FadeUp>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            {/* Sourcing without Pinpoint */}
                            <FadeUp delay={0.06} className="rounded-3xl border border-red-100 bg-[#FFF5F5]/30 p-8 space-y-6">
                                <div className="flex items-center gap-3 text-red-650">
                                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-red-100 text-xs font-black">×</span>
                                    <h3 className="text-md font-bold text-zinc-900">Sourcing without Pinpoint</h3>
                                </div>
                                <ul className="space-y-4 text-sm text-zinc-650">
                                    {[
                                        'A hundred cold decks, most unfundable, none verified',
                                        'Deal-stoppers found in week three, not week one',
                                        "Founders' own numbers, taken on trust",
                                        'Diligence started from zero, every time',
                                        'No way to compare one company against another',
                                    ].map((li, i) => (
                                        <li key={i} className="flex items-start gap-3">
                                            <span className="text-red-500 font-sans mt-0.5">•</span>
                                            <span>{li}</span>
                                        </li>
                                    ))}
                                </ul>
                            </FadeUp>

                            {/* Sourcing through the PIN */}
                            <FadeUp delay={0.12} className="rounded-3xl border border-[#3A54A5]/15 bg-[#FAFBFF] p-8 space-y-6">
                                <div className="flex items-center gap-3 text-[#3A54A5]">
                                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#3A54A5]/8 text-xs font-black">✓</span>
                                    <h3 className="text-md font-bold text-zinc-900">Sourcing  with Pinpoint</h3>
                                </div>
                                <ul className="space-y-4 text-sm text-zinc-650">
                                    {[
                                        'Companies that chose to be assessed, and paid to be',
                                        'Every deal-stopper surfaced and disclosed up front',
                                        'Claims graded by evidence, capped where unproven',
                                        'A structured profile you can read in minutes',
                                        'A common benchmark across every company you see',
                                    ].map((li, i) => (
                                        <li key={i} className="flex items-start gap-3">
                                            <span className="text-[#3A54A5] font-sans mt-0.5">•</span>
                                            <span>{li}</span>
                                        </li>
                                    ))}
                                </ul>
                            </FadeUp>
                        </div>
                    </div>
                </section>

                {/* ── Benefits Section ── */}
                <section id="value" className="border-b border-zinc-200/50 bg-[#FAFBFF] py-24">
                    <div className="mx-auto max-w-5xl px-6 md:px-8 space-y-16">
                        <FadeUp className="max-w-3xl space-y-4">
                            <span className="text-[11px] font-bold tracking-widest text-[#3A54A5] uppercase">What membership gives you</span>
                            <h2 className="font-display sm:text-4.5xl text-3xl font-bold tracking-tight text-zinc-950">
                                Fewer companies. Better understood. Sooner.
                            </h2>
                        </FadeUp>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {[
                                {
                                    num: '01',
                                    label: 'Assessed companies',
                                    title: 'CURATED VISIBILITY',
                                    desc: 'You see companies that have completed a Pinpoint Investment Assessment and consented to be seen. A founder who has paid to be diligenced is serious.'
                                },
                                {
                                    num: '02',
                                    label: 'Weeks of work, already done',
                                    title: 'DILIGENCE HEAD START',
                                    desc: 'Corporate standing, IP chain of title, cap table reconciliation, unit economics, regulatory position — the groundwork is complete before you open the profile.'
                                },
                                {
                                    num: '03',
                                    label: 'Proven, not asserted',
                                    title: 'EVIDENCE, NOT ASSERTION',
                                    desc: 'Every PARAGON score carries an evidence grade. A claim backed by a contract reads differently to one backed by a founder\'s word.'
                                },
                                {
                                    num: '04',
                                    label: 'Fatal flaws first',
                                    title: 'THE DEAL-STOPPERS UP FRONT',
                                    desc: 'If a company carries a fatal flaw, you learn it on the first page, not in the fourth week. That protects your time.'
                                },
                                {
                                    num: '05',
                                    label: 'Compare like with like',
                                    title: 'A COMMON BENCHMARK',
                                    desc: 'Every company is measured on the same seven dimensions, against a cohort of its stage, sector, and geography.'
                                },
                                {
                                    num: '06',
                                    label: 'Considered route',
                                    title: 'MARKET ACCESS',
                                    desc: 'For international investors, the PIN is a way into African dealflow assessed against local regulatory and tax realities.'
                                },
                             ].map((b, idx) => (
                                <FadeUp key={idx} delay={idx * 0.05} className="flex flex-col justify-between rounded-3xl border border-white/80 bg-white/30 p-6 shadow-[0_8px_30px_rgba(58,84,165,0.02)] backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:bg-white/50">
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-baseline border-b border-zinc-200/60 pb-2">
                                            <span className="text-[9px] font-bold tracking-wider text-[#3A54A5] uppercase">{b.label}</span>
                                            <span className="text-xs font-mono font-bold text-[#C8A951]">{b.num}</span>
                                        </div>
                                        <h3 className="text-sm font-bold text-zinc-950 tracking-wide uppercase">{b.title}</h3>
                                        <p className="text-xs leading-relaxed font-medium text-zinc-500">{b.desc}</p>
                                    </div>
                                </FadeUp>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ── PARAGON Dimensions Block ── */}
                <section className="border-b border-zinc-200/50 bg-transparent py-24">
                    <div className="mx-auto max-w-5xl px-6 md:px-8">
                        <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-12 items-center">
                            <FadeUp className="space-y-6">
                                <span className="text-[11px] font-bold tracking-widest text-[#3A54A5] uppercase">What a profile contains</span>
                                <h2 className="font-display sm:text-4.5xl text-3xl font-bold tracking-tight text-zinc-950">
                                    Seven dimensions. One page. No spin.
                                </h2>
                                <p className="text-sm leading-relaxed font-medium text-zinc-500">
                                    Each company you see has been assessed across the full PARAGON framework — the same framework an investment committee reasons with, made explicit and consistent.
                                </p>
                                
                                <div className="border-l-2 border-[#3A54A5] pl-6 py-1 space-y-2">
                                    <p className="text-zinc-650 text-xs italic font-medium leading-relaxed">
                                        What the PIN is not: a recommendation. Pinpoint assesses and makes visible; it does not advise you, endorse any company, or tell you where to invest. The judgement — and the decision — remain entirely yours.
                                    </p>
                                    <p className="text-[9px] text-zinc-400 font-bold uppercase tracking-wider">
                                        Verbatim legal disclaimer
                                    </p>
                                </div>
                            </FadeUp>

                            <FadeUp delay={0.1}>
                                <div className="relative">
                                    <div className="absolute -inset-3 -z-10 translate-x-3 translate-y-3 rounded-[32px] border border-zinc-200/80 bg-white/20 backdrop-blur-md" />
                                    <div className="flex flex-col items-center justify-center p-8 bg-white/40 border border-white/80 rounded-3xl space-y-8 shadow-[0_8px_30px_rgba(58,84,165,0.025)] backdrop-blur-md">
                                        <div className="grid grid-cols-7 gap-2 w-full max-w-sm">
                                            {['P', 'A', 'R', 'A', 'G', 'O', 'N'].map((char, index) => (
                                                <div key={index} className="aspect-square flex flex-col justify-center items-center rounded-xl bg-linear-to-br from-[#3A54A5] to-[#2D4182] text-white font-bold shadow-[0_4px_12px_rgba(58,84,165,0.2)] transition-transform duration-300 hover:scale-105">
                                                    <span className="text-lg sm:text-xl font-bold">{char}</span>
                                                </div>
                                            ))}
                                        </div>
                                        <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 text-[9px] font-bold tracking-widest text-[#3A54A5] uppercase text-center w-full">
                                            <span>Potential</span> • 
                                            <span>Agility</span> • 
                                            <span>Risk</span> • 
                                            <span>Alignment</span> • 
                                            <span>Governance</span> • 
                                            <span>Operations</span> • 
                                            <span>Network</span>
                                        </div>
                                    </div>
                                </div>
                            </FadeUp>
                        </div>
                    </div>
                </section>

                {/* ── How Membership Works Section ── */}
                <section className="border-b border-zinc-200/50 bg-[#FAFBFF] py-24">
                    <div className="mx-auto max-w-5xl px-6 md:px-8 space-y-16">
                        <FadeUp className="max-w-3xl space-y-4">
                            <span className="text-[11px] font-bold tracking-widest text-[#3A54A5] uppercase">From application to dealflow</span>
                            <h2 className="font-display sm:text-4.5xl text-3xl font-bold tracking-tight text-zinc-950">
                                How membership works
                            </h2>
                        </FadeUp>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {[
                                { step: '1', title: 'You apply', desc: 'Complete the application below. It takes a few minutes and tells us your investment mandate.' },
                                { step: '2', title: 'We verify & admit', desc: 'We confirm your status and eligibility. Admission is considered, not automatic.' },
                                { step: '3', title: 'See profiles', desc: 'Once admitted, you gain visibility of companies matching your mandate.' },
                                { step: '4', title: 'Engage directly', desc: 'Where a company interests you, you deal with it directly, on your own terms.' },
                            ].map((item, idx) => (
                                <FadeUp key={idx} delay={idx * 0.06} className="relative rounded-3xl border border-white/80 bg-white/30 p-6 shadow-[0_8px_30px_rgba(58,84,165,0.01)] backdrop-blur-md hover:bg-white/50 transition-all duration-300">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#3A54A5]/10 text-sm font-black text-[#3A54A5] mb-4">
                                        {item.step}
                                    </div>
                                    <h3 className="text-sm font-bold text-zinc-950 tracking-wide uppercase mb-2">{item.title}</h3>
                                    <p className="text-xs leading-relaxed text-zinc-500 font-medium">{item.desc}</p>
                                </FadeUp>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ── Who It's For Section ── */}
                <section className="border-b border-zinc-200/50 bg-white py-24">
                    <div className="mx-auto max-w-5xl px-6 md:px-8 space-y-16">
                        <FadeUp className="max-w-3xl space-y-4">
                            <span className="text-[11px] font-bold tracking-widest text-[#3A54A5] uppercase">Who the network is for</span>
                            <h2 className="font-display sm:text-4.5xl text-3xl font-bold tracking-tight text-zinc-950">
                                Built for investors who value a filter.
                            </h2>
                            <p className="text-sm font-medium text-zinc-500">
                                The PIN admits a range of investor types. What they share is a preference for signal over volume.
                            </p>
                        </FadeUp>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {[
                                { title: 'Angel investors', desc: 'Individuals backing early-stage companies who want assessed dealflow without a fund\'s diligence team.' },
                                { title: 'Venture funds', desc: 'Seed and growth funds seeking a verified top of funnel and a faster path through first-stage diligence.' },
                                { title: 'Family offices', desc: 'Principals allocating to African venture who need the regulatory and governance picture surfaced early.' },
                                { title: 'Syndicates & angel networks', desc: 'Lead investors assembling rounds who want a common benchmark to align their members around.' },
                                { title: 'DFIs & impact investors', desc: 'Institutions whose mandates demand governance, compliance, and risk visibility as a condition of capital.' },
                                { title: 'Corporate & strategic investors', desc: 'Corporates scanning for partners and targets, assessed against a consistent, disclosed standard.' },
                            ].map((card, idx) => (
                                <FadeUp key={idx} delay={idx * 0.05} className="group relative overflow-hidden rounded-2xl border border-white/80 bg-white/30 p-6 shadow-[0_8px_30px_rgba(58,84,165,0.02)] backdrop-blur-md transition-all duration-300 hover:-translate-y-0.5 hover:border-[#3A54A5]/25 hover:bg-white/50 hover:shadow-[0_8px_30px_rgba(58,84,165,0.04)]">
                                    <h3 className="text-sm font-bold text-zinc-950 uppercase tracking-wide group-hover:text-[#3A54A5] transition-colors">{card.title}</h3>
                                    <p className="text-xs leading-relaxed text-zinc-500 mt-2 font-medium">{card.desc}</p>
                                </FadeUp>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ── A Word on Admission Block ── */}
                <section className="py-20 relative overflow-hidden">
                    <div className="mx-auto max-w-4xl px-6">
                        <FadeUp>
                            <div className="rounded-4xl border border-white/80 bg-white/40 p-8 sm:p-14 text-center space-y-6 shadow-[0_12px_40px_rgba(58,84,165,0.03)] backdrop-blur-md relative overflow-hidden">
                                {/* Decorative gradient accent at top */}
                                <div className="absolute top-0 left-0 right-0 h-1 bg-linear-to-r from-[#3A54A5] via-[#6EBE44] to-[#C8A951]" />
                                
                                <span className="text-[11px] font-bold tracking-widest text-[#3A54A5] uppercase">A word on admission</span>
                                <p className="mx-auto max-w-2xl text-lg leading-relaxed font-extrabold text-zinc-900 font-display">
                                    The PIN is curated on both sides. Companies earn their place by being assessed; investors earn theirs by being who they say they are.
                                </p>
                                <p className="mx-auto mt-4 max-w-xl text-xs leading-relaxed font-medium text-zinc-500">
                                    We verify status, and we admit deliberately, because a network is only as valuable as its most careless member. If that is the kind of room you want to be in, apply below.
                                </p>
                            </div>
                        </FadeUp>
                    </div>
                </section>

                {/* ── Divider Image ── */}
                <div className="overflow-hidden">
                    <img
                        src="/investor_network_divider.png"
                        alt="Pinpoint Investment Network — curated, verified dealflow"
                        className="w-full object-cover max-h-72 object-center"
                        loading="lazy"
                    />
                </div>

                {/* ── Membership Application Form ── */}
                <section id="apply" ref={applyRef} className="bg-white py-24 border-t border-zinc-250/60">
                    <div className="mx-auto max-w-3xl px-6 md:px-8">
                        <div className="mx-auto mb-14 max-w-2xl text-center">
                            <span className="text-[11px] font-bold tracking-widest text-[#3A54A5] uppercase">Application</span>
                            <h2 className="font-display sm:text-4.5xl mt-3 text-3xl font-bold tracking-tight text-zinc-950">
                                Application for membership
                            </h2>
                            <p className="mt-3 text-sm font-medium text-zinc-500">
                                A few minutes. No cost to apply. We confirm your status before admitting you, and we treat everything you share in confidence.
                            </p>
                        </div>

                        <AnimatePresence mode="wait">
                            {submitted ? (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.98 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="border border-zinc-200 bg-zinc-50 rounded-3xl p-8 sm:p-12 text-center space-y-6 shadow-xs"
                                >
                                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                                        <Check className="h-8 w-8 stroke-[2.5]" />
                                    </div>
                                    <div className="space-y-3">
                                        <h3 className="font-display text-2xl font-bold text-zinc-950">Application received.</h3>
                                        <p className="text-sm leading-relaxed text-zinc-650 max-w-md mx-auto">
                                            Thank you. We review every application individually and verify investor status before admission. You will hear from us at the email you provided.
                                        </p>
                                        <p className="text-[11px] font-medium text-zinc-400 pt-4 max-w-sm mx-auto">
                                            If we need anything further to confirm your eligibility, we will ask for it directly.
                                        </p>
                                    </div>
                                </motion.div>
                            ) : (
                                <form onSubmit={handleSubmit} className="border border-white/80 rounded-4xl bg-white/40 p-6 sm:p-12 space-y-12 shadow-[0_8px_30px_rgba(58,84,165,0.02)] backdrop-blur-md">
                                    
                                    {/* Step 1: Who is applying */}
                                    <div className="space-y-6">
                                        <div className="flex items-center gap-3">
                                            <span className="font-mono text-xs font-bold text-white bg-[#3A54A5] h-6 w-6 rounded-full flex items-center justify-center">1</span>
                                            <h3 className="text-md font-bold text-zinc-950">Who is applying</h3>
                                        </div>
                                        
                                        <div className="space-y-3">
                                            <label className="text-zinc-455 mb-1.5 block text-[10px] font-bold tracking-wider uppercase">Investor Type *</label>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                                                {[
                                                    { value: 'angel', label: 'Angel investor', sub: 'Investing personally' },
                                                    { value: 'vc', label: 'Venture fund', sub: 'Seed / growth VC' },
                                                    { value: 'family_office', label: 'Family office', sub: 'Principal capital' },
                                                    { value: 'syndicate', label: 'Syndicate / network', sub: 'Angel group or lead' },
                                                    { value: 'dfi', label: 'DFI / impact', sub: 'Development finance' },
                                                    { value: 'corporate', label: 'Corporate / CVC', sub: 'Strategic investor' },
                                                ].map(type => (
                                                    <button
                                                        key={type.value}
                                                        type="button"
                                                        onClick={() => handleTypeSelect(type.value)}
                                                        className={cn(
                                                            'flex flex-col text-left p-4 rounded-xl border transition-all duration-200',
                                                            data.investor_type === type.value
                                                                ? 'border-[#3A54A5] bg-white ring-2 ring-[#3A54A5] shadow-xs'
                                                                : 'border-zinc-200 bg-white/60 hover:bg-white hover:border-zinc-300'
                                                        )}
                                                    >
                                                        <span className="text-xs font-bold text-zinc-900">{type.label}</span>
                                                        <span className="text-[10px] text-zinc-400 mt-1 font-medium">{type.sub}</span>
                                                    </button>
                                                ))}
                                            </div>
                                            {errors.investor_type && (
                                                <p className="text-xs font-semibold text-red-500">{errors.investor_type}</p>
                                            )}
                                        </div>
                                    </div>
 
                                    {/* Step 2: Your details */}
                                    <div className="space-y-6 border-t border-zinc-200 pt-8">
                                        <div className="flex items-center gap-3">
                                            <span className="font-mono text-xs font-bold text-white bg-[#3A54A5] h-6 w-6 rounded-full flex items-center justify-center">2</span>
                                            <h3 className="text-md font-bold text-zinc-950">Your details</h3>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <label className="text-zinc-455 mb-1.5 block text-[10px] font-bold tracking-wider uppercase">Full Name *</label>
                                                <input
                                                    type="text"
                                                    value={data.name}
                                                    onChange={e => { setData('name', e.target.value); clearErrors('name'); }}
                                                    placeholder="Ada Okonkwo"
                                                    className={inputCls('name')}
                                                />
                                                {errors.name && <p className="text-xs font-semibold text-red-500">{errors.name}</p>}
                                            </div>

                                            <div className="space-y-2">
                                                <label className="text-zinc-455 mb-1.5 block text-[10px] font-bold tracking-wider uppercase">Work Email *</label>
                                                <input
                                                    type="email"
                                                    value={data.email}
                                                    onChange={e => { setData('email', e.target.value); clearErrors('email'); }}
                                                    placeholder="ada@fund.com"
                                                    className={inputCls('email')}
                                                />
                                                {errors.email && <p className="text-xs font-semibold text-red-500">{errors.email}</p>}
                                            </div>

                                            <div className="space-y-2">
                                                <label className="text-zinc-455 mb-1.5 block text-[10px] font-bold tracking-wider uppercase">
                                                    {data.investor_type === 'angel' ? 'Organisation (if any)' : 'Organisation *'}
                                                </label>
                                                <input
                                                    type="text"
                                                    value={data.organisation}
                                                    onChange={e => { setData('organisation', e.target.value); clearErrors('organisation'); }}
                                                    placeholder="e.g. Pinpoint Ventures"
                                                    className={inputCls('organisation')}
                                                />
                                                {errors.organisation && <p className="text-xs font-semibold text-red-500">{errors.organisation}</p>}
                                            </div>

                                            <div className="space-y-2">
                                                <label className="text-zinc-455 mb-1.5 block text-[10px] font-bold tracking-wider uppercase">Your Role</label>
                                                <input
                                                    type="text"
                                                    value={data.role}
                                                    onChange={e => setData('role', e.target.value)}
                                                    placeholder="Partner, Principal, Director…"
                                                    className={inputCls('role')}
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <label className="text-zinc-455 mb-1.5 block text-[10px] font-bold tracking-wider uppercase">Country of Residence *</label>
                                                <select
                                                    value={data.country}
                                                    onChange={e => { setData('country', e.target.value); clearErrors('country'); }}
                                                    className={inputCls('country')}
                                                >
                                                    <option value="">Select country</option>
                                                    {COUNTRIES.map(c => (
                                                        <option key={c} value={c}>{c}</option>
                                                    ))}
                                                </select>
                                                {errors.country && <p className="text-xs font-semibold text-red-500">{errors.country}</p>}
                                            </div>

                                            <div className="space-y-2">
                                                <label className="text-zinc-455 mb-1.5 block text-[10px] font-bold tracking-wider uppercase">Website or LinkedIn</label>
                                                <input
                                                    type="text"
                                                    value={data.website}
                                                    onChange={e => setData('website', e.target.value)}
                                                    placeholder="https://"
                                                    className={inputCls('website')}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Step 3: Your mandate */}
                                    <div className="space-y-8 border-t border-zinc-200 pt-8">
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-3">
                                                <span className="font-mono text-xs font-bold text-white bg-[#3A54A5] h-6 w-6 rounded-full flex items-center justify-center">3</span>
                                                <h3 className="text-md font-bold text-zinc-950">Your mandate</h3>
                                            </div>
                                            <p className="text-[10px] text-zinc-400 font-bold tracking-wider pl-9 uppercase">
                                                What you invest in — so that what you see matches what you back. Select all that apply.
                                            </p>
                                        </div>

                                        <div className="space-y-6">
                                            {/* Stages */}
                                            <div className="space-y-2">
                                                <label className="text-zinc-455 mb-1.5 block text-[10px] font-bold tracking-wider uppercase">Investment Stages</label>
                                                <div className="flex flex-wrap gap-2">
                                                    {STAGES.map(s => {
                                                        const isSelected = data.stages.includes(s.value);
                                                        return (
                                                            <button
                                                                key={s.value}
                                                                type="button"
                                                                onClick={() => toggleMultiSelect('stages', s.value)}
                                                                className={cn(
                                                                    'px-3 py-1.5 rounded-full text-xs font-semibold border transition-all',
                                                                    isSelected
                                                                        ? 'border-[#3A54A5] bg-[#3A54A5]/5 text-[#3A54A5]'
                                                                        : 'border-zinc-200 bg-white text-zinc-600 hover:border-zinc-350'
                                                                )}
                                                            >
                                                                {s.label}
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                            </div>

                                            {/* Sectors */}
                                            <div className="space-y-2">
                                                <label className="text-zinc-455 mb-1.5 block text-[10px] font-bold tracking-wider uppercase">Sectors of Interest</label>
                                                <div className="flex flex-wrap gap-2">
                                                    {SECTORS.map(s => {
                                                        const isSelected = data.sectors.includes(s.value);
                                                        return (
                                                            <button
                                                                key={s.value}
                                                                type="button"
                                                                onClick={() => toggleMultiSelect('sectors', s.value)}
                                                                className={cn(
                                                                    'px-3 py-1.5 rounded-full text-xs font-semibold border transition-all',
                                                                    isSelected
                                                                        ? 'border-[#3A54A5] bg-[#3A54A5]/5 text-[#3A54A5]'
                                                                        : 'border-zinc-200 bg-white text-zinc-600 hover:border-zinc-350'
                                                                )}
                                                            >
                                                                {s.label}
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                            </div>

                                            {/* Geographies */}
                                            <div className="space-y-2">
                                                <label className="text-zinc-455 mb-1.5 block text-[10px] font-bold tracking-wider uppercase">Target Geographies</label>
                                                <div className="flex flex-wrap gap-2">
                                                    {GEOGRAPHIES.map(g => {
                                                        const isSelected = data.geographies.includes(g.value);
                                                        return (
                                                            <button
                                                                key={g.value}
                                                                type="button"
                                                                onClick={() => toggleMultiSelect('geographies', g.value)}
                                                                className={cn(
                                                                    'px-3 py-1.5 rounded-full text-xs font-semibold border transition-all',
                                                                    isSelected
                                                                        ? 'border-[#3A54A5] bg-[#3A54A5]/5 text-[#3A54A5]'
                                                                        : 'border-zinc-200 bg-white text-zinc-600 hover:border-zinc-350'
                                                                )}
                                                            >
                                                                {g.label}
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                            </div>

                                            {/* Select details */}
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                <div className="space-y-2">
                                                    <label className="text-zinc-455 mb-1.5 block text-[10px] font-bold tracking-wider uppercase">Typical cheque size</label>
                                                    <select
                                                        value={data.cheque_size}
                                                        onChange={e => setData('cheque_size', e.target.value)}
                                                        className={inputCls('cheque_size')}
                                                    >
                                                        <option value="">Select range</option>
                                                        {CHEQUE_SIZES.map(range => (
                                                            <option key={range} value={range}>{range}</option>
                                                        ))}
                                                    </select>
                                                </div>

                                                <div className="space-y-2">
                                                    <label className="text-zinc-455 mb-1.5 block text-[10px] font-bold tracking-wider uppercase">Instruments</label>
                                                    <select
                                                        value={data.instrument}
                                                        onChange={e => setData('instrument', e.target.value)}
                                                        className={inputCls('instrument')}
                                                    >
                                                        <option value="">Select instrument</option>
                                                        {INSTRUMENTS.map(ins => (
                                                            <option key={ins} value={ins}>{ins}</option>
                                                        ))}
                                                    </select>
                                                </div>

                                                <div className="space-y-2">
                                                    <label className="text-zinc-455 mb-1.5 block text-[10px] font-bold tracking-wider uppercase">Deals per year</label>
                                                    <select
                                                        value={data.deals_per_year}
                                                        onChange={e => setData('deals_per_year', e.target.value)}
                                                        className={inputCls('deals_per_year')}
                                                    >
                                                        <option value="">Select target</option>
                                                        {DEALS_PER_YEAR.map(count => (
                                                            <option key={count} value={count}>{count}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                            </div>

                                            {/* Optional fields */}
                                            {data.investor_type && data.investor_type !== 'angel' && (
                                                <motion.div
                                                    initial={{ opacity: 0, y: -10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    className="space-y-2"
                                                >
                                                    <label className="text-zinc-455 mb-1.5 block text-[10px] font-bold tracking-wider uppercase">Fund / AUM detail</label>
                                                    <input
                                                        type="text"
                                                        value={data.fund_detail}
                                                        onChange={e => setData('fund_detail', e.target.value)}
                                                        placeholder="e.g. $20m fund, second vintage"
                                                        className={inputCls('fund_detail')}
                                                    />
                                                </motion.div>
                                            )}

                                            <div className="space-y-2">
                                                <label className="text-zinc-455 mb-1.5 block text-[10px] font-bold tracking-wider uppercase">Thesis notes</label>
                                                <textarea
                                                    value={data.thesis_notes}
                                                    onChange={e => setData('thesis_notes', e.target.value)}
                                                    placeholder="What you look for, what you avoid, how you like to work with founders."
                                                    rows={4}
                                                    className={cn(inputCls('thesis_notes'), 'resize-none')}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Step 4: Eligibility & consent */}
                                    <div className="space-y-6 border-t border-zinc-200 pt-8">
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-3">
                                                <span className="font-mono text-xs font-bold text-white bg-[#3A54A5] h-6 w-6 rounded-full flex items-center justify-center">4</span>
                                                <h3 className="text-md font-bold text-zinc-950">Eligibility & consent</h3>
                                            </div>
                                            <p className="text-[10px] text-zinc-400 font-bold tracking-wider pl-9 uppercase">
                                                These reflect the Investor Terms. They are what keep the network clean, and lawful.
                                            </p>
                                        </div>
 
                                        <div className="space-y-4 pl-1 sm:pl-9">
                                            {[
                                                {
                                                    key: 'investor_status',
                                                    label: 'I confirm that I qualify under applicable law to receive information on, and to invest in, early-stage and growth companies — including, where relevant, as a sophisticated, professional, qualified, or high-net-worth investor within the meaning of the Investments and Securities Act 2025 and SEC rules. *'
                                                },
                                                {
                                                    key: 'risk_understood',
                                                    label: 'I understand that early-stage investment is high-risk and illiquid, that I may lose my entire capital, and that I make each investment decision on my own judgement and diligence. *'
                                                },
                                                {
                                                    key: 'no_recommendation',
                                                    label: 'I understand that Pinpoint provides curated visibility only — it does not recommend, endorse, advise on, or arrange any investment, and is not my adviser, agent, or broker. *'
                                                },
                                                {
                                                    key: 'aml_source_of_funds',
                                                    label: 'I confirm that any funds I invest will derive from lawful sources, and I agree to provide such identity, status, and source-of-funds information as Pinpoint may reasonably require. *'
                                                },
                                                {
                                                    key: 'terms_agreed',
                                                    label: 'I have read and agree to the Investor Terms, the Terms of Service, and the Privacy Policy. *'
                                                }
                                            ].map(item => (
                                                <label key={item.key} className="flex items-start gap-3 cursor-pointer group select-none">
                                                    <input
                                                        type="checkbox"
                                                        checked={data.confirmations[item.key as keyof typeof data.confirmations]}
                                                        onChange={() => handleCheckboxChange(item.key as keyof typeof data.confirmations)}
                                                        className="sr-only"
                                                    />
                                                    <div className={cn(
                                                        'mt-0.5 flex h-4.5 w-4.5 shrink-0 items-center justify-center rounded border transition-colors',
                                                        data.confirmations[item.key as keyof typeof data.confirmations]
                                                            ? 'border-[#2D4182] bg-[#2D4182] text-white'
                                                            : 'border-zinc-200 bg-white group-hover:border-[#2D4182]/45'
                                                    )}>
                                                        {data.confirmations[item.key as keyof typeof data.confirmations] && <Check className="h-3 w-3 stroke-3" />}
                                                    </div>
                                                    <span className="text-xs text-zinc-550 leading-relaxed group-hover:text-zinc-750">
                                                        {item.label}
                                                    </span>
                                                </label>
                                            ))}
 
                                            {(errors['confirmations.investor_status'] ||
                                                errors['confirmations.risk_understood'] ||
                                                errors['confirmations.no_recommendation'] ||
                                                errors['confirmations.aml_source_of_funds'] ||
                                                errors['confirmations.terms_agreed']) && (
                                                <p className="text-xs text-red-500 font-semibold pt-2">
                                                    Please confirm all conditions and terms to apply.
                                                </p>
                                            )}
                                        </div>
                                    </div>
 
                                    {/* Submit area */}
                                    <div className="border-t border-zinc-200 pt-8 space-y-4 text-center">
                                        <button
                                            type="submit"
                                            disabled={processing}
                                            className="flex h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-full bg-[#3A54A5] text-sm font-bold text-white shadow-md transition hover:bg-[#2D4182] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
                                        >
                                            {processing ? 'Submitting...' : 'Submit Application'} <ArrowRight className="h-4 w-4" />
                                        </button>
                                        <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">
                                            Admission is at Pinpoint's discretion. We will be in touch after reviewing your application.
                                        </p>
                                    </div>
                                </form>
                            )}
                        </AnimatePresence>
                    </div>
                </section>

                {/* ── Footer ── */}
                <footer className="border-t border-zinc-200/50 bg-zinc-50 py-12">
                    <div className="mx-auto max-w-5xl px-6 text-center">
                        <p className="text-[11px] font-bold tracking-wider text-zinc-400 uppercase">
                            Pinpoint Launchpad
                        </p>
                        <p className="mx-auto mt-3 max-w-2xl text-[11px] leading-relaxed font-medium text-zinc-400/80">
                            The PIN is a curated visibility channel, not a brokerage or investment adviser. Membership is subject to the Investor Terms. Nothing on this page is an offer of securities or investment advice.
                        </p>
                    </div>
                </footer>
            </div>
        </>
    );
}
