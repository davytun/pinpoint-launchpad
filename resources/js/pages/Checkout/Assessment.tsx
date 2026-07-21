import { Head, router, usePage } from '@inertiajs/react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, BarChart3, Check, Crosshair, Layout, Shield, Users } from 'lucide-react';
import { useRef, useState } from 'react';

import { PinpointLogo } from '@/components/pinpoint-logo';
import { cn } from '@/lib/utils';

// ─── Data ─────────────────────────────────────────────────────────────────────

const PILLARS = [
    {
        letter: 'P',
        name: 'Potential',
        subtitle: 'Market, wedge, why-now, founder–market fit. The dimension founders most want to discuss and evidence worst.',
        question: 'Which customers would be genuinely damaged if you shut down on Friday? Name them.',
        criteria: 5,
        icon: Crosshair,
    },
    {
        letter: 'A',
        name: 'Agility',
        subtitle: 'Learning velocity, adaptation, capital efficiency, decision rights.',
        question: 'What would have to be true for you to abandon the current strategy?',
        criteria: 4,
        icon: BarChart3,
    },
    {
        letter: 'R',
        name: 'Risk',
        subtitle: 'Licensing, IP chain of title, contracts, data protection, concentration, financial crime.',
        question: 'Who wrote the code, and what document assigns it to the company?',
        criteria: 6,
        icon: Shield,
    },
    {
        letter: 'A',
        name: 'Alignment',
        subtitle: 'Unit economics, model integrity, cap table, incentives, use of funds, valuation realism.',
        question: 'Take one customer. Show us every naira in and every naira out.',
        criteria: 6,
        icon: ScaleIcon,
    },
    {
        letter: 'G',
        name: 'Governance',
        subtitle: 'Corporate standing, constitutional documents, board, financial controls, tax.',
        question: 'Who can move money out of this company, and who checks?',
        criteria: 5,
        icon: Shield,
    },
    {
        letter: 'O',
        name: 'Operations',
        subtitle: 'Revenue quality, product and technology, team, systems, delivery.',
        question: 'Produce your five most important numbers, right now, without preparing them.',
        criteria: 5,
        icon: Layout,
    },
    {
        letter: 'N',
        name: 'Network',
        subtitle:
            'Two strands. Suppliers, channels and partners on one; your deck, your data room and your investor conversations on the other. The dimension the other six leave behind, and where most fundable African companies actually lose.',
        question: 'Send us your data room. Now, in this meeting.',
        criteria: 6,
        icon: Users,
    },
];

function ScaleIcon(props: React.SVGProps<SVGSVGElement>) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="m16 16 3-8 3 8c-.87.65-2.24 1-3 1s-2.13-.35-3-1Z" />
            <path d="m2 16 3-8 3 8c-.87.65-2.24 1-3 1s-2.13-.35-3-1Z" />
            <path d="M7 21h10" />
            <path d="M12 3v18" />
            <path d="M3 7h18" />
        </svg>
    );
}

const WHY_ITEMS = [
    {
        num: '01',
        title: 'We read the documents',
        body: 'Your cap table is reconciled to your CAC filings. Your deck is reconciled to your management accounts. Your model is reconciled to your bank. Most founders have never had this done. A meaningful number do not survive it.',
    },
    {
        num: '02',
        title: 'We interview your co-founders separately',
        body: 'The same questions, asked apart. What would make you personally happy in five years. What is the least you would sell for. Founder disagreement is the most common cause of early failure and the least often diagnosed, because it is invisible in a joint meeting.',
    },
    {
        num: '03',
        title: 'We call the customers who left',
        body: 'You cannot ring your own churned customers and get an honest answer. We can. Where their account of you differs from yours, that difference is the finding.',
    },
    {
        num: '04',
        title: 'We run the panel before they do',
        body: 'A closed-door session run exactly as an investment committee runs one, briefed in advance on your weakest findings and instructed to press there. The first time you are properly interrogated should not be in front of the person you need money from.',
    },
    {
        num: '05',
        title: 'We benchmark you',
        body: 'A score of 62 means nothing on its own. A score of 62 against a median of 48 for companies at your stage, in your sector, in your market, that is a position you can act on.',
    },
    {
        num: '06',
        title: 'We write down the part nobody says',
        body: "One section of your report is written in the investor's voice: how a mandate-matched fund would read this company, and why they would pass. It is the least comfortable thing we produce and the reason most founders say the assessment paid for itself.",
    },
];

const DELIVERABLES = [
    { title: 'Deal-Stopper Register', desc: 'Everything that would end a diligence process, with cost, cure and timeline. Before anything else.' },
    {
        title: 'The verdict',
        desc: 'Your score, your band, your benchmark position, and a straight answer to whether you should raise now (including, where it is warranted, no).',
    },
    { title: 'The PARAGON profile', desc: 'Seven dimensions, with substance and evidence graded separately, set against your cohort.' },
    { title: 'Dimension findings', desc: 'All thirty-seven criteria: what we found, what we verified, and what we could not.' },
    { title: "The investor's view", desc: 'How a mandate-matched fund would read this company, written in their voice. The section nobody enjoys.' },
    { title: 'Panel debrief', desc: 'Question-level feedback from the simulation, including the ones you could not answer.' },
    { title: 'The 90-day roadmap', desc: 'Prioritised, sequenced and costed. What to fix, in what order, and what it buys you.' },
    {
        title: 'Fundability forecast',
        desc: 'A realistic valuation range on comparable African transactions, the investor profiles that fit you, and expected time to a term sheet (now and after remediation).',
    },
    { title: 'Evidence appendix', desc: 'Everything we reviewed, everything we asked for and did not receive, and what that absence means.' },
];

const EVIDENCE_GRADES = [
    {
        claim: 'Our largest customer is on a two-year contract.',
        grade: 'A',
        label: 'Full score',
        color: '#059669',
        bg: 'rgba(5,150,105,0.04)',
        border: 'rgba(5,150,105,0.15)',
        score: 5,
        max: 5,
        context: 'Grade A: the contract is executed, dated and in the data room. It says what you say it says.',
    },
    {
        claim: 'Our churn is running at about five percent.',
        grade: 'B',
        label: 'Capped at 4 / 5',
        color: '#D97706',
        bg: 'rgba(217,119,6,0.04)',
        border: 'rgba(217,119,6,0.15)',
        score: 4,
        max: 5,
        context: 'No churn report, no system export, no customer log. Just the number.',
    },
    {
        claim: 'We will get the IP assignments signed shortly.',
        grade: 'C',
        label: 'Capped at 2 / 5',
        color: '#DC2626',
        bg: 'rgba(220,38,38,0.04)',
        border: 'rgba(220,38,38,0.15)',
        score: 2,
        max: 5,
        context: 'No assignment exists. The code is not owned by the company.',
    },
];

const DEAL_STOPPERS = [
    'Core IP is not owned by the company',
    'The cap table does not reconcile to your CAC filings',
    'Personal and company funds are commingled',
];

const STATIC_TIERS = [
    {
        key: 'foundation',
        tier: 'Tier 1 · Concept',
        price: '$500',
        headline: 'Idea to MVP. Little or no revenue. Seeking validation before you approach anyone.',
        lines: [
            '21 core criteria',
            'One 90-minute founder session',
            'Corporate documents, cap table and bank statements reviewed',
            'Benchmarked against your stage cohort',
            'Written report and debrief',
        ],
        meta: '10–12 analyst hours · 7 working days',
        featured: false,
    },
    {
        key: 'growth',
        tier: 'Tier 2 · Seed',
        price: '$1,500',
        headline: 'Trading, under $500k a year, preparing for a first institutional cheque.',
        lines: [
            'All 37 criteria',
            'Three founder sessions, with co-founders questioned separately',
            'Full data room: contracts, accounts, model, IP chain, tax',
            'Three customer reference calls',
            '60-minute Investor Simulation panel',
            'Benchmarked on stage and sector',
        ],
        meta: '25–30 analyst hours · 12 working days',
        featured: true,
    },
    {
        key: 'institutional',
        tier: 'Tier 3 · Growth',
        price: '$3,500+',
        headline: 'Above $500k a year, established processes, raising a larger round or growth equity.',
        lines: [
            'All 37 criteria, at maximum depth',
            'Partner-led. Five or more sessions, full team triangulation',
            'Code review, open-source licence audit, security posture',
            'Customers, churned customers, suppliers, partners and prior investors called',
            '90-minute panel including an external investor',
            'Named comparable transactions',
        ],
        meta: '60+ analyst hours · 20 working days · scoped and quoted before invoice',
        featured: false,
    },
];

const COUNTRIES = [
    'Nigeria',
    'Ghana',
    'Kenya',
    'South Africa',
    'Egypt',
    'Rwanda',
    "Côte d'Ivoire",
    'Senegal',
    'Other African Country',
    'Outside Africa',
];

const RAISE_TARGETS = ['Under $100k', '$100k–$500k', '$500k–$2m', '$2m–$10m', 'Over $10m', 'Not sure yet'];

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

// ─── Evidence Widget ──────────────────────────────────────────────────────────

function EvidenceWidget() {
    const [active, setActive] = useState(0);
    const eg = EVIDENCE_GRADES[active];

    return (
        <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-[0_8px_30px_rgba(0,0,0,0.04)] sm:p-8">
            <span className="text-[10px] font-bold tracking-widest text-[#3A54A5] uppercase">Evidence Grade Simulator</span>

            <div className="mt-5 flex flex-col gap-2">
                {EVIDENCE_GRADES.map((item, i) => (
                    <button
                        key={i}
                        type="button"
                        onClick={() => setActive(i)}
                        className={cn(
                            'w-full rounded-2xl border px-5 py-3.5 text-left text-xs font-semibold transition-all duration-205 active:scale-[0.99] sm:text-sm',
                            active === i
                                ? 'border-[#3A54A5] bg-[#3A54A5]/5 text-[#3A54A5]'
                                : 'border-zinc-250/70 text-zinc-550 hover:border-zinc-350 bg-[#FAFBFF] hover:text-zinc-800',
                        )}
                    >
                        {item.claim}
                    </button>
                ))}
            </div>

            <AnimatePresence mode="wait">
                <motion.div
                    key={active}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.2 }}
                    className="mt-5 rounded-2xl border bg-white p-5 shadow-xs"
                    style={{ borderColor: eg.border }}
                >
                    <div className="mb-3 flex items-center justify-between">
                        <span className="text-4xl font-extrabold tracking-tight" style={{ color: eg.color }}>
                            {eg.grade}
                        </span>
                        <div className="text-right">
                            <p className="text-xl font-bold tracking-tight" style={{ color: eg.color }}>
                                {eg.score} / {eg.max}
                            </p>
                            <p className="text-[9px] font-bold tracking-wider uppercase" style={{ color: eg.color }}>
                                {eg.label}
                            </p>
                        </div>
                    </div>
                    <div className="mb-3 h-1.5 w-full overflow-hidden rounded-full bg-zinc-100">
                        <motion.div
                            className="h-1.5 rounded-full"
                            style={{ backgroundColor: eg.color }}
                            initial={{ width: 0 }}
                            animate={{ width: `${(eg.score / eg.max) * 100}%` }}
                            transition={{ duration: 0.45, ease: 'easeOut' }}
                        />
                    </div>
                    <p className="text-zinc-650 text-xs leading-relaxed italic">{eg.context}</p>
                </motion.div>
            </AnimatePresence>
        </div>
    );
}

// ─── Interactive Pillar Tabs ──────────────────────────────────────────────────

function PillarInteractiveSection() {
    const [activePillar, setActivePillar] = useState(0);
    const p = PILLARS[activePillar];
    const Icon = p.icon;

    return (
        <div className="grid items-start gap-6 lg:grid-cols-[1fr_2.4fr]">
            {/* Left pillar letter selector */}
            <div className="grid grid-cols-7 gap-2 lg:flex lg:flex-col">
                {PILLARS.map((item, idx) => (
                    <button
                        key={idx}
                        type="button"
                        onClick={() => setActivePillar(idx)}
                        className={cn(
                            'flex aspect-square w-full items-center justify-center gap-3.5 rounded-2xl border text-xs font-bold transition-all duration-200 active:scale-[0.98] sm:text-sm lg:aspect-auto lg:h-12 lg:px-5',
                            activePillar === idx
                                ? 'border-[#3A54A5] bg-[#3A54A5] text-white shadow-md'
                                : 'text-zinc-550 border-zinc-200 bg-white hover:border-zinc-300 hover:bg-zinc-50',
                        )}
                    >
                        <span
                            className={cn(
                                'flex h-6 w-6 shrink-0 items-center justify-center rounded-lg text-[10px] font-black transition-colors',
                                activePillar === idx ? 'bg-white/20 text-white' : 'bg-zinc-100 text-zinc-600',
                            )}
                        >
                            {item.letter}
                        </span>
                        <span className="hidden text-[11px] font-bold tracking-wider uppercase lg:inline">{item.name}</span>
                    </button>
                ))}
            </div>

            {/* Right details card */}
            <div className="flex min-h-[280px] flex-col justify-between rounded-3xl border border-zinc-200 bg-white p-6 shadow-[0_8px_30px_rgba(0,0,0,0.03)] sm:p-8">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activePillar}
                        initial={{ opacity: 0, x: 8 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -8 }}
                        transition={{ duration: 0.2 }}
                        className="flex h-full flex-col justify-between"
                    >
                        <div>
                            <div className="mb-4 flex items-center gap-3.5">
                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#3A54A5]/8 text-[#3A54A5]">
                                    <Icon className="h-5 w-5" strokeWidth={1.8} />
                                </div>
                                <div>
                                    <span className="text-[9px] font-bold tracking-widest text-[#3A54A5] uppercase">PARAGON Dimension</span>
                                    <h3 className="text-xl leading-none font-bold text-zinc-950">{p.name}</h3>
                                </div>
                            </div>
                            <p className="text-zinc-550 mb-6 text-sm leading-relaxed">{p.subtitle}</p>
                        </div>

                        <div className="border-zinc-150 rounded-2xl border bg-zinc-50 p-5">
                            <span className="mb-1.5 block text-[9px] font-black tracking-widest text-zinc-400 uppercase">Uncomfortable question</span>
                            <p className="text-sm leading-relaxed font-bold text-zinc-800 italic sm:text-base">{p.question}</p>
                            <span className="mt-4 inline-flex items-center gap-1 rounded-full border border-zinc-200 bg-white px-2.5 py-0.5 text-[9px] font-bold text-zinc-600">
                                {p.criteria} audit criteria
                            </span>
                        </div>
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    );
}

// ─── Application Form ─────────────────────────────────────────────────────────

function ApplicationForm() {
    const { props } = usePage<{ flash?: { success?: string; error?: string } }>();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [form, setForm] = useState({
        name: '',
        email: '',
        company: '',
        country: '',
        stage: '',
        raise_target: '',
        message: '',
    });
    const [errors, setErrors] = useState<Record<string, string>>({});

    function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
        setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
        setErrors((prev) => ({ ...prev, [e.target.name]: '' }));
    }

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setIsSubmitting(true);
        router.post('/assessment/apply', form, {
            onFinish: () => setIsSubmitting(false),
            onError: (errs) => {
                setErrors(errs as Record<string, string>);
                setIsSubmitting(false);
            },
            onSuccess: () => {
                setForm({ name: '', email: '', company: '', country: '', stage: '', raise_target: '', message: '' });
            },
        });
    }

    const inputCls = (field: string) =>
        cn(
            'w-full rounded-xl border bg-white px-4 py-3.5 text-sm text-zinc-900 placeholder-zinc-400 transition-all duration-300 focus:ring-2 focus:ring-[#3A54A5]/10 focus:outline-none',
            errors[field] ? 'border-red-300 focus:border-red-400 focus:ring-red-100' : 'border-zinc-200 focus:border-[#3A54A5]/40',
        );

    if (props.flash?.success) {
        return (
            <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-3xl border border-zinc-200 bg-white px-8 py-14 text-center shadow-lg"
            >
                <div className="border-zinc-150 mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full border bg-zinc-50">
                    <Check className="h-6 w-6 stroke-[2.5] text-[#3A54A5]" />
                </div>
                <h3 className="mb-2 text-xl font-bold text-zinc-950">Application received.</h3>
                <p className="mx-auto max-w-sm text-sm leading-relaxed text-zinc-500">{props.flash.success}</p>
            </motion.div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="rounded-3.5xl border border-zinc-200 bg-white p-6 shadow-[0_8px_30px_rgba(0,0,0,0.02)] sm:p-10">
            {props.flash?.error && (
                <div className="text-red-650 mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3.5 text-sm font-semibold">
                    {props.flash.error}
                </div>
            )}

            <div className="grid gap-5 md:grid-cols-2">
                <div>
                    <label className="text-zinc-455 mb-1.5 block text-[10px] font-bold tracking-wider uppercase">Full Name *</label>
                    <input
                        id="pia-name"
                        name="name"
                        type="text"
                        required
                        autoComplete="name"
                        value={form.name}
                        onChange={handleChange}
                        placeholder="Your name"
                        className={inputCls('name')}
                    />
                    {errors.name && <p className="mt-1 text-xs font-semibold text-red-500">{errors.name}</p>}
                </div>

                <div>
                    <label className="text-zinc-455 mb-1.5 block text-[10px] font-bold tracking-wider uppercase">Email *</label>
                    <input
                        id="pia-email"
                        name="email"
                        type="email"
                        required
                        autoComplete="email"
                        value={form.email}
                        onChange={handleChange}
                        placeholder="you@company.com"
                        className={inputCls('email')}
                    />
                    {errors.email && <p className="mt-1 text-xs font-semibold text-red-500">{errors.email}</p>}
                </div>

                <div>
                    <label className="text-zinc-455 mb-1.5 block text-[10px] font-bold tracking-wider uppercase">Company Name *</label>
                    <input
                        id="pia-company"
                        name="company"
                        type="text"
                        required
                        value={form.company}
                        onChange={handleChange}
                        placeholder="Acme Technologies Ltd"
                        className={inputCls('company')}
                    />
                    {errors.company && <p className="mt-1 text-xs font-semibold text-red-500">{errors.company}</p>}
                </div>

                <div>
                    <label className="text-zinc-455 mb-1.5 block text-[10px] font-bold tracking-wider uppercase">Country of Operation *</label>
                    <select id="pia-country" name="country" required value={form.country} onChange={handleChange} className={inputCls('country')}>
                        <option value="">Select country…</option>
                        {COUNTRIES.map((c) => (
                            <option key={c} value={c}>
                                {c}
                            </option>
                        ))}
                    </select>
                    {errors.country && <p className="mt-1 text-xs font-semibold text-red-500">{errors.country}</p>}
                </div>

                <div>
                    <label className="text-zinc-455 mb-1.5 block text-[10px] font-bold tracking-wider uppercase">Stage *</label>
                    <select id="pia-stage" name="stage" required value={form.stage} onChange={handleChange} className={inputCls('stage')}>
                        <option value="">Select stage…</option>
                        <option value="concept">Concept: Idea to MVP, seeking validation</option>
                        <option value="seed">Seed: Trading, under $500k a year</option>
                        <option value="growth">Growth: Above $500k a year, raising a larger round</option>
                    </select>
                    {errors.stage && <p className="mt-1 text-xs font-semibold text-red-500">{errors.stage}</p>}
                </div>

                <div>
                    <label className="text-zinc-455 mb-1.5 block text-[10px] font-bold tracking-wider uppercase">Raise Target *</label>
                    <select
                        id="pia-raise-target"
                        name="raise_target"
                        required
                        value={form.raise_target}
                        onChange={handleChange}
                        className={inputCls('raise_target')}
                    >
                        <option value="">Select target…</option>
                        {RAISE_TARGETS.map((r) => (
                            <option key={r} value={r}>
                                {r}
                            </option>
                        ))}
                    </select>
                    {errors.raise_target && <p className="mt-1 text-xs font-semibold text-red-500">{errors.raise_target}</p>}
                </div>
            </div>

            <div className="mt-5">
                <label className="text-zinc-455 mb-1.5 block text-[10px] font-bold tracking-wider uppercase">
                    Anything else we should know? <span className="font-normal normal-case">(optional)</span>
                </label>
                <textarea
                    id="pia-message"
                    name="message"
                    rows={4}
                    value={form.message}
                    onChange={handleChange}
                    placeholder="Tell us about your current raise process, timeline, or specific concerns…"
                    className={cn(inputCls('message'), 'resize-none')}
                />
                {errors.message && <p className="mt-1 text-xs font-semibold text-red-500">{errors.message}</p>}
            </div>

            <button
                id="pia-submit"
                type="submit"
                disabled={isSubmitting}
                className="mt-7 flex h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-full bg-zinc-950 text-sm font-bold text-white transition hover:bg-zinc-800 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
            >
                Submit Application <ArrowRight className="h-4 w-4" />
            </button>
        </form>
    );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function Assessment() {
    const applyRef = useRef<HTMLDivElement>(null);

    function scrollToApply() {
        applyRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    return (
        <>
            <Head title="The Pinpoint Investment Assessment — Pinpoint Launchpad" />
            <meta
                name="description"
                content="Most founders who fail to raise never find out why. The PIA is the diligence process run on your side of the table."
            />

            <div className="relative min-h-screen bg-white font-sans text-zinc-900 selection:bg-zinc-950 selection:text-white">
                {/* Ambient background rays matching standard site rays */}
                <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
                    <div className="bg-radial-to-b absolute top-0 left-1/2 h-[800px] w-full max-w-7xl -translate-x-1/2 from-[#3A54A5]/4 to-transparent opacity-80 blur-3xl" />
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
                                onClick={scrollToApply}
                                className="inline-flex h-9 cursor-pointer items-center justify-center rounded-full bg-zinc-950 px-5 text-xs font-bold whitespace-nowrap text-white transition hover:bg-zinc-800 active:scale-[0.98]"
                            >
                                <span className="hidden sm:inline">Apply for an assessment</span>
                                <span className="sm:hidden">Apply</span>
                            </button>
                        </div>
                    </header>
                </div>

                {/* ── Hero Section ── */}
                <section className="pt-20 pb-24 md:pt-28 md:pb-32">
                    <div className="mx-auto max-w-5xl px-6 md:px-8">
                        <div className="grid items-start gap-12 lg:grid-cols-[1.4fr_1fr]">
                            {/* Left Side: Headline & Intro */}
                            <div>
                                <FadeUp delay={0.06}>
                                    <h1 className="font-display text-4.5xl leading-[0.98] font-bold tracking-tight text-zinc-950 sm:text-6xl lg:text-[4.5rem]">
                                        Most founders who fail to raise never find out why.
                                    </h1>
                                </FadeUp>
                                <FadeUp delay={0.1}>
                                    <p className="mt-8 max-w-2xl text-base leading-relaxed font-medium text-zinc-500 sm:text-lg">
                                        Investors do not tell you. They thank you for your time, they say the timing is not right, and they stop
                                        replying. The reason sits in a document you never showed them, or a number you could not defend.
                                    </p>
                                    <p className="mt-4 max-w-2xl text-sm leading-relaxed font-medium text-zinc-500">
                                        The PIA is the diligence process run on your side of the table, by people whose job is to find what an
                                        investor would find. And to tell you. Built for African founders preparing to raise from $100k to $10m.
                                    </p>
                                </FadeUp>
                                <FadeUp delay={0.14}>
                                    <div className="mt-10 inline-flex flex-col gap-3">
                                        <button
                                            type="button"
                                            onClick={scrollToApply}
                                            className="inline-flex h-12 w-full min-w-[220px] cursor-pointer items-center justify-center gap-2 rounded-full bg-zinc-950 px-8 text-sm font-bold text-white transition hover:bg-zinc-800 active:scale-[0.98] sm:w-auto"
                                        >
                                            Apply for an assessment <ArrowRight className="h-4 w-4" />
                                        </button>
                                        <p className="text-xs font-medium text-zinc-400">
                                            Not sure yet?{' '}
                                            <a
                                                href="/diagnostic"
                                                className="font-semibold text-zinc-600 underline underline-offset-2 transition hover:text-zinc-950"
                                            >
                                                Take the free Self-Scan first
                                            </a>
                                        </p>
                                    </div>
                                </FadeUp>
                            </div>

                            {/* Right Side: Hero Image */}
                            <FadeUp delay={0.18} className="relative lg:mt-6">
                                {/* Asymmetric offset background card to create depth and visual structure */}
                                <div className="absolute -inset-3 -z-10 translate-x-3 translate-y-3 rounded-[32px] border border-zinc-200 bg-zinc-50" />
                                <div className="relative overflow-hidden rounded-3xl bg-zinc-100 shadow-[0_20px_60px_rgba(0,0,0,0.08)]">
                                    <img
                                        src="/images/pia-hero.jpg"
                                        alt="Founder reviewing investment documents"
                                        className="h-[360px] w-full object-cover object-top transition-transform duration-500 hover:scale-[1.02]"
                                        fetchPriority="high"
                                    />
                                </div>
                            </FadeUp>
                        </div>
                    </div>
                </section>

                {/* ── The Mechanism & Evidence Simulator ── */}
                <section className="border-t border-zinc-200/50 bg-white py-24">
                    <div className="mx-auto max-w-5xl px-6 md:px-8">
                        <div className="grid gap-12 lg:grid-cols-[1.1fr_1fr] lg:items-center">
                            <FadeUp>
                                <span className="text-[11px] font-bold tracking-widest text-[#3A54A5] uppercase">The mechanism</span>
                                <h2 className="font-display sm:text-4.5xl mt-3 text-3xl leading-[1.05] font-bold tracking-tight text-zinc-950">
                                    Every score is graded twice.
                                </h2>
                                <p className="mt-5 text-sm leading-relaxed font-semibold text-zinc-700 sm:text-base">
                                    Once for substance, once for proof. The lower one governs.
                                </p>
                                <p className="mt-4 text-sm leading-relaxed font-medium text-zinc-500">
                                    This is the discipline an investment committee applies to you, and it is the one thing you cannot apply to
                                    yourself. Belief in your own numbers is not a flaw of character. It is a condition of the job.
                                </p>
                                <p className="mt-4 text-sm leading-relaxed font-medium text-zinc-500">
                                    A company can be excellent and score badly here. If the excellence cannot be evidenced, no investor can act on it.
                                    The distance between what is true and what is provable is usually the whole distance between you and the money.
                                </p>
                                <ul className="border-zinc-150 mt-7 space-y-4 rounded-2xl border bg-zinc-50 p-5">
                                    {[
                                        {
                                            num: '01',
                                            text: 'We read every document. Your cap table reconciled to your CAC filings. Your model reconciled to your bank.',
                                        },
                                        {
                                            num: '02',
                                            text: 'We interview co-founders separately. The same questions, asked apart. Founder disagreement is invisible in a joint meeting.',
                                        },
                                        {
                                            num: '03',
                                            text: 'We call the customers who left. You cannot ring your own churned customers and get an honest answer. We can.',
                                        },
                                    ].map((item) => (
                                        <li key={item.num} className="flex items-start gap-3">
                                            <span className="mt-0.5 shrink-0 text-xs font-black text-[#3A54A5]/30">{item.num}</span>
                                            <p className="text-xs leading-relaxed font-medium text-zinc-500">{item.text}</p>
                                        </li>
                                    ))}
                                </ul>
                            </FadeUp>
                            <FadeUp delay={0.1}>
                                <EvidenceWidget />
                            </FadeUp>
                        </div>
                    </div>
                </section>

                {/* ── The Instrument (Interactive PARAGON display) ── */}
                <section id="instrument" className="border-t border-zinc-200/50 bg-[#FAFBFF] py-24">
                    <div className="mx-auto max-w-5xl px-6 md:px-8">
                        <FadeUp>
                            <div className="mx-auto mb-12 max-w-2xl text-center">
                                <span className="text-[11px] font-bold tracking-widest text-[#3A54A5] uppercase">The instrument</span>
                                <h2 className="font-display sm:text-4.5xl mt-3 text-3xl font-bold tracking-tight text-zinc-950">
                                    Thirty-seven criteria. Seven dimensions.
                                </h2>
                                <p className="text-zinc-450 mt-2.5 text-xs font-bold tracking-widest uppercase sm:text-sm">
                                    One question you will not enjoy from each.
                                </p>
                            </div>
                        </FadeUp>
                        <FadeUp delay={0.06}>
                            <PillarInteractiveSection />
                        </FadeUp>
                    </div>
                </section>

                {/* ── The Register (Deal-stoppers light mode warning card) ── */}
                <section className="border-t border-zinc-200/50 bg-[#FFF5F5] py-24">
                    <div className="mx-auto max-w-5xl px-6 md:px-8">
                        <FadeUp>
                            <div className="grid gap-12 lg:grid-cols-[1fr_1.3fr] lg:items-start">
                                <div>
                                    <span className="text-[11px] font-bold tracking-widest text-red-600 uppercase">The Register</span>
                                    <h2 className="font-display sm:text-4.5xl mt-3 text-3xl leading-tight font-bold tracking-tight text-zinc-950">
                                        <span className="text-red-650 font-black">22</span> findings that end a process, regardless of how well you
                                        score.
                                    </h2>
                                    <p className="text-zinc-650 mt-5 text-sm leading-relaxed font-medium sm:text-base">
                                        A company can score 78 and be unfundable. An unassigned line of code, a customer at sixty percent of revenue
                                        with nothing in writing, PAYE deducted and never remitted; none of these reduce your score. They end the
                                        conversation, quietly, and nobody tells you which one it was.
                                    </p>
                                    <p className="text-zinc-650 mt-4 text-sm leading-relaxed font-medium">
                                        Every deal-stopper we find is set out on the first page of your report, before anything else: what it is, what
                                        it would cost you in a live process, what it takes to fix, how long, and how much.
                                    </p>
                                </div>

                                <div className="flex flex-col gap-4">
                                    <span className="text-[10px] font-bold tracking-widest text-red-500 uppercase">Sample deal-stoppers</span>
                                    {DEAL_STOPPERS.map((d, i) => (
                                        <div key={i} className="flex items-start gap-4 rounded-2xl border border-red-100 bg-white p-5 shadow-xs">
                                            <span className="mt-1 flex h-4.5 w-4.5 shrink-0 items-center justify-center rounded-full border border-red-200 bg-red-50">
                                                <span className="block h-2 w-2 rounded-full bg-red-500" />
                                            </span>
                                            <p className="text-sm leading-relaxed font-bold text-zinc-800">{d}</p>
                                        </div>
                                    ))}
                                    <p className="mt-2 text-[11px] text-red-600/70 italic">
                                        The full register is not published. Founders who could game the instrument would learn nothing from it.
                                    </p>
                                </div>
                            </div>
                        </FadeUp>
                    </div>
                </section>

                {/* ── Pricing Cards ── */}
                <section id="pricing" className="border-t border-zinc-200/50 bg-[#FAFBFF] py-24">
                    <div className="mx-auto max-w-5xl px-6 md:px-8">
                        <FadeUp>
                            <div className="mx-auto mb-16 max-w-3xl">
                                <div className="mb-10 text-center">
                                    <span className="text-[11px] font-bold tracking-widest text-[#3A54A5] uppercase">Scope and fee</span>
                                    <h2 className="font-display sm:text-4.5xl mt-3 text-3xl font-bold tracking-tight text-zinc-950">
                                        Every criterion is assessed at every tier.
                                    </h2>
                                    <p className="mt-3 text-sm font-medium text-zinc-500">What changes is how far we go to verify it.</p>
                                </div>
                                <div className="grid grid-cols-1 gap-2 rounded-2xl border border-zinc-200 bg-white p-6 shadow-xs sm:grid-cols-2 lg:grid-cols-3">
                                    {[
                                        { label: 'Deal-Stopper Register', note: 'First page of every report' },
                                        { label: 'Full PARAGON profile', note: '7 dimensions, substance + evidence scored' },
                                        { label: 'The investor view', note: 'Written in their voice, not yours' },
                                        { label: 'Panel debrief', note: 'Question-level feedback from the simulation' },
                                        { label: 'The 90-day roadmap', note: 'Prioritised, sequenced, costed' },
                                    ].map((item) => (
                                        <div key={item.label} className="flex items-start gap-2.5 py-2">
                                            <span className="mt-1 flex h-4 w-4 shrink-0 items-center justify-center rounded-md bg-[#3A54A5]/8 text-[#3A54A5]">
                                                <Check className="h-2.5 w-2.5 stroke-[3.5]" />
                                            </span>
                                            <div>
                                                <p className="text-xs font-bold text-zinc-900">{item.label}</p>
                                                <p className="text-[11px] font-medium text-zinc-400">{item.note}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </FadeUp>

                        <div className="grid items-stretch gap-8 lg:grid-cols-3">
                            {STATIC_TIERS.map((tier, i) => (
                                <FadeUp key={tier.key} delay={i * 0.08}>
                                    <div
                                        className={cn(
                                            'relative flex h-full flex-col rounded-3xl border bg-white p-8 shadow-[0_8px_30px_rgba(0,0,0,0.015)] transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl',
                                            tier.featured ? 'border-[#3A54A5] ring-1 ring-[#3A54A5] lg:-mt-4 lg:mb-4' : 'border-zinc-200',
                                        )}
                                    >
                                        <div className="flex-1">
                                            <h3 className="text-xl font-bold text-zinc-900">{tier.tier.split(' · ')[1] || tier.tier}</h3>

                                            <div className="mt-4 flex items-baseline gap-1">
                                                <span className="text-4xl font-extrabold tracking-tight text-zinc-900">{tier.price}</span>
                                                <span className="text-xs text-zinc-400">/ one-off fee</span>
                                            </div>

                                            <p className="mt-3 min-h-[44px] text-xs leading-relaxed font-semibold text-zinc-500">{tier.headline}</p>

                                            <div className="border-zinc-150 my-6 border-t" />

                                            <ul className="text-zinc-650 space-y-3 text-xs font-semibold">
                                                {tier.lines.map((line, fi) => (
                                                    <li key={fi} className="flex items-start gap-3">
                                                        <Check className="mt-0.5 h-4 w-4 shrink-0 stroke-[2.5] text-[#3A54A5]" />
                                                        <span>{line}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>

                                        <div className="mt-8">
                                            <div className="border-zinc-150 my-6 border-t" />
                                            <p className="mb-4 text-[9px] font-bold tracking-widest text-zinc-400 uppercase">{tier.meta}</p>
                                            <button
                                                type="button"
                                                onClick={scrollToApply}
                                                className={cn(
                                                    'group flex h-11 w-full cursor-pointer items-center justify-center rounded-xl text-xs font-bold transition-all duration-200 active:scale-[0.98]',
                                                    tier.featured
                                                        ? 'bg-zinc-950 text-white shadow-md shadow-zinc-950/10 hover:bg-zinc-800'
                                                        : 'text-zinc-850 bg-zinc-100 hover:bg-zinc-200 hover:text-zinc-950',
                                                )}
                                            >
                                                Select plan
                                            </button>
                                        </div>
                                    </div>
                                </FadeUp>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ── Closing Editorial Quote Section ── */}
                <section className="border-t border-zinc-200/50 bg-[#FAFBFF] py-24">
                    <div className="mx-auto max-w-5xl px-6 md:px-8">
                        <FadeUp>
                            <div className="rounded-3.5xl relative overflow-hidden border border-zinc-200 bg-white p-8 text-center shadow-xs sm:p-16">
                                <span className="mb-2 block font-serif text-5xl leading-none text-zinc-300">“</span>
                                <p className="mx-auto max-w-3xl text-xl leading-tight font-bold tracking-tight text-zinc-900 sm:text-3xl">
                                    You will find this out eventually.
                                    <br />
                                    The only question is who pays for the lesson.
                                </p>
                                <p className="mx-auto mt-6 max-w-2xl text-sm leading-relaxed font-medium text-zinc-500 sm:text-base">
                                    A failed raise costs a founder eight to twelve months, a burnt list of introductions that cannot be used twice,
                                    and a valuation set by desperation rather than by evidence. The assessment costs less than a month of runway.
                                </p>
                                <p className="mx-auto mt-5 max-w-xl text-sm font-semibold text-[#3A54A5]">
                                    We will tell you if you are not ready. We would rather lose the fee than sell you a process you are going to lose.
                                </p>
                            </div>
                        </FadeUp>
                    </div>
                </section>

                {/* ── Application Form Section ── */}
                <section id="apply" ref={applyRef} className="border-t border-zinc-200/50 bg-white py-24">
                    <div className="mx-auto max-w-5xl px-6 md:px-8">
                        <FadeUp>
                            <div className="mx-auto mb-14 max-w-2xl text-center">
                                <span className="text-[11px] font-bold tracking-widest text-[#3A54A5] uppercase">Application</span>
                                <h2 className="font-display sm:text-4.5xl mt-3 text-3xl font-bold tracking-tight text-zinc-950">
                                    Apply for an assessment
                                </h2>
                                <p className="mt-3 text-sm font-medium text-zinc-500">
                                    Tell us where you are. We will review your application and come back to you within 48 hours with scope and fee
                                    confirmation.
                                </p>
                            </div>
                        </FadeUp>
                        <FadeUp delay={0.06}>
                            <div className="mx-auto max-w-2xl">
                                <ApplicationForm />
                            </div>
                        </FadeUp>
                    </div>
                </section>

                {/* ── Footer ── */}
                <footer className="border-t border-zinc-200/50 bg-zinc-50 py-12">
                    <div className="mx-auto max-w-5xl px-6 text-center">
                        <p className="text-[11px] font-bold tracking-wider text-zinc-400 uppercase">Pinpoint Launchpad</p>
                        <p className="mx-auto mt-3 max-w-xl text-[11px] leading-relaxed font-medium text-zinc-400/80">
                            The PIA is an investment-readiness assessment. It is not an audit, not a legal opinion, and not investment advice.
                            Findings rest on the evidence made available within the assessment window.
                        </p>
                    </div>
                </footer>
            </div>
        </>
    );
}
