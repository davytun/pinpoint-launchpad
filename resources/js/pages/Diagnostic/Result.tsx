import DiagnosticLayout from '@/layouts/diagnostic-layout';
import { Head } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { Activity, AlertCircle, AlertTriangle, ArrowRight, Cpu, Network, Scale, ShieldCheck, Target, TrendingUp, Zap } from 'lucide-react';
import { useState } from 'react';
import { PolarAngleAxis, PolarGrid, Radar, RadarChart, ResponsiveContainer } from 'recharts';

// ─── Types ─────────────────────────────────────────────────────────────────────

interface PillarScores {
    potential: number;
    agility: number;
    risk: number;
    alignment: number;
    governance: number;
    operations: number;
    network: number;
}

interface PageProps {
    score: number;
    score_band: 'low' | 'mid_low' | 'mid_high' | 'high';
    pillar_scores: PillarScores;
    score_band_label: string;
    score_band_message: string;
    next_action: string;
    completed_at: string;
    hard_flags?: string[];
    weakest_dimensions?: string[];
    network_strands?: { commercial: number; capital: number };
}

// ─── Constants ─────────────────────────────────────────────────────────────────

const PILLAR_KEYS: (keyof PillarScores)[] = ['potential', 'agility', 'risk', 'alignment', 'governance', 'operations', 'network'];
const PILLAR_LABELS: Record<keyof PillarScores, string> = {
    potential: 'Potential',
    agility: 'Agility',
    risk: 'Risk',
    alignment: 'Alignment',
    governance: 'Governance',
    operations: 'Operations',
    network: 'Network',
};

const PILLAR_ICONS: Record<keyof PillarScores, React.ElementType> = {
    potential: Zap,
    agility: Activity,
    risk: ShieldCheck,
    alignment: Target,
    governance: Scale,
    operations: Cpu,
    network: Network,
};

const BAND_META: Record<
    string,
    {
        color: string;
        border: string;
        bg: string;
        textColor: string;
        badgeLabel: string;
        Icon: React.ElementType;
    }
> = {
    low: {
        color: '#EF4444',
        border: 'rgba(239,68,68,0.5)',
        bg: 'rgba(239,68,68,0.08)',
        textColor: '#FCA5A5',
        badgeLabel: 'Too Early',
        Icon: AlertCircle,
    },
    mid_low: {
        color: '#F97316',
        border: 'rgba(249,115,22,0.5)',
        bg: 'rgba(249,115,22,0.08)',
        textColor: '#FDBA74',
        badgeLabel: 'Foundations Missing',
        Icon: AlertTriangle,
    },
    mid_high: {
        color: '#3A54A5',
        border: 'rgba(58,84,165,0.6)',
        bg: 'rgba(58,84,165,0.12)',
        textColor: '#93C5FD',
        badgeLabel: 'Close to Ready',
        Icon: TrendingUp,
    },
    high: {
        color: '#10B981', // Premium emerald green
        border: 'rgba(16,185,129,0.6)',
        bg: 'rgba(16,185,129,0.12)',
        textColor: '#86efac',
        badgeLabel: 'Investment Ready',
        Icon: Zap,
    },
};

interface RemediationInfo {
    headline: string;
    actions: string[];
    strandCallout?: string;
}

const REMEDIATION_COPY: Record<string, RemediationInfo> = {
    potential: {
        headline:
            'An investor reads a weak Potential score as “interesting, but I cannot see how this becomes big.” They will be polite. They will not lead.',
        actions: [
            'Rebuild your market size from the bottom up: reachable customers × realistic price × realistic penetration. Bin the top-down report figure.',
            'Write one paragraph answering “why now” that names a specific change — a rule, a technology, a shift in behaviour — and show it in your data.',
            'Find and document three customers who would be genuinely annoyed if you shut down tomorrow. That is your wedge.',
        ],
    },
    agility: {
        headline:
            'Slow iteration and short runway together tell an investor that you will be back asking for more money before you have proved anything.',
        actions: [
            'Put your runway on a single page: current burn, months remaining, and the date you must close by. Then plan your raise nine months before it, not three.',
            'Institute a two-week build–measure–decide cycle and keep a written log of what each cycle changed.',
            'Prepare one honest story about a time evidence made you change course. Investors trust founders who have been wrong on purpose.',
        ],
    },
    risk: {
        headline:
            'Risk is where deals die quietly. An unassigned line of code or an unlicensed activity turns an enthusiastic investor into an unresponsive one, and nobody will tell you why.',
        actions: [
            'Get every founder, employee and past contractor to sign an IP assignment to the company. Do this before anything else on this list.',
            'Establish your regulatory position in writing — whether you need a licence, and if so, where the application stands. “We are looking into it” is not an answer.',
            "Map your key-person dependencies and start moving what is in people's heads into systems.",
        ],
    },
    alignment: {
        headline:
            'Weak Alignment says the founder does not know whether the business works. No amount of growth compensates for that — it makes it worse.',
        actions: [
            'Calculate CAC, LTV and payback period by channel. If the numbers embarrass you, that is the finding.',
            'Prove that a single sale makes money before overheads. If it does not, fix pricing or cost before you raise anything.',
            'Rewrite your use of funds as a milestone: what the money buys, by when, and what the company will have proved at the end of it.',
        ],
    },
    governance: {
        headline:
            'Governance gaps rarely stop a term sheet — they stop the closing. Expect months of delay, a lower valuation, or a withdrawn offer.',
        actions: [
            'Bring statutory filings current and reconstitute the register of members and share certificates.',
            "Sign a founders' or shareholders' agreement with vesting, leaver provisions and reserved matters. Do it while everyone still gets on.",
            'Constitute an advisory board that meets quarterly and keep minutes. It costs little and it changes how you are read.',
        ],
    },
    operations: {
        headline:
            'Operations is the difference between a company and a project. Weak here, and the investor concludes there is nothing to buy but you.',
        actions: [
            'Move to a real accounting system and produce monthly management accounts. Separate business and personal money completely, today.',
            'Define five to eight KPIs you can produce on demand and review them weekly with the team.',
            'Put contracts in place for every full-time person and map the key hires for the next twelve months.',
        ],
    },
};

function getNetworkRemediation(network_strands: { commercial: number; capital: number }): RemediationInfo {
    const isCommercialWeaker = network_strands.commercial < network_strands.capital;
    const weakerStrandLabel = isCommercialWeaker ? 'Commercial network' : 'Capital & narrative';

    const commercialActions = [
        'Paper your critical supplier and vendor relationships: written contracts with pricing, notice periods and service levels. Start with the one you could not trade without tomorrow.',
        'Identify every channel or platform sitting between you and your customers. Contract the ones you depend on, and start building a second route to market for anything above half your volume.',
        'Convert your MOUs into live, revenue-generating integrations — or drop them. An unexecuted partnership on a slide is worse than none, because it invites the question you cannot answer.',
    ];

    const capitalActions = [
        'Build the deck around evidence, not vision. Every claim needs a number behind it, and every number needs to exist in the model.',
        'Assemble an indexed data room before anyone asks. The founder who sends it within the hour is read as a different founder to the one who takes two weeks.',
        'Get to ten real investor conversations. Ask each one what would have to be true for them to invest, write down the answer, and stop guessing what the market thinks of you.',
    ];

    const actions = isCommercialWeaker ? [...commercialActions, capitalActions[0]] : [...capitalActions, commercialActions[0]];

    return {
        headline:
            'Network is the dimension the other six leave behind, and it is where most fundable African companies actually lose. On one side, a business running on relationships nobody wrote down — one supplier decision or one platform policy change from having nothing to sell. On the other, a real business that no investor ever properly understood, because the package and the conversations were never built.',
        strandCallout: `The weaker strand is ${weakerStrandLabel}. Start there.`,
        actions,
    };
}

// ─── Fade-in-up wrapper ────────────────────────────────────────────────────────

function FadeUp({ delay, children, className }: { delay: number; children: React.ReactNode; className?: string }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
            className={className}
        >
            {children}
        </motion.div>
    );
}

// ─── Page ───────────────────────────────────────────────────────────────────────

export default function DiagnosticResult({
    score,
    score_band,
    pillar_scores,
    score_band_message,
    hard_flags = [],
    weakest_dimensions = [],
    network_strands = { commercial: 0, capital: 0 },
}: PageProps) {
    const meta = BAND_META[score_band] ?? BAND_META.mid_high;
    const [checklistClicked, setChecklistClicked] = useState(false);
    const [checklistLoading, setChecklistLoading] = useState(false);
    const [checklistError, setChecklistError] = useState(false);

    async function handleSendChecklist() {
        setChecklistLoading(true);
        setChecklistError(false);
        try {
            const xsrfCookie = document.cookie
                .split('; ')
                .find((row) => row.startsWith('XSRF-TOKEN='))
                ?.split('=')
                .slice(1)
                .join('=') ?? '';
            const xsrfToken = decodeURIComponent(xsrfCookie);
            const res = await fetch('/diagnostic/send-checklist', {
                method: 'POST',
                headers: {
                    'X-XSRF-TOKEN': xsrfToken,
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
            });
            if (res.ok) {
                setChecklistClicked(true);
            } else {
                setChecklistError(true);
            }
        } catch {
            setChecklistError(true);
        } finally {
            setChecklistLoading(false);
        }
    }

    const hasFlags = hard_flags.length > 0;

    // CTA routing logic matching specs:
    let ctaTitle = 'Do the two things below first. Then come back.';
    let ctaCopy =
        'We are not going to sell you an assessment you are not ready for. Work the actions in the two cards above, re-run this scan in 60 days, and if the number has moved we would like to hear from you.';
    let primaryBtnText = 'Get the readiness checklist';
    let primaryBtnHref = '/resources';
    let secondaryBtnText = 'Back to Homepage';
    let secondaryBtnHref = '/';

    if (score >= 70 && !hasFlags) {
        ctaTitle = 'You should apply.';
        ctaCopy =
            'You are scoring in the range where a full Pinpoint Investment Assessment stops being a diagnosis and starts being preparation. Apply, and we will scope you into the right tier.';
        primaryBtnText = 'Apply to Pinpoint';
        primaryBtnHref = '/assessment';
        secondaryBtnText = 'How the PARAGON Model works';
        secondaryBtnHref = '/#about';
    } else if (score >= 50 || (score >= 40 && hasFlags)) {
        ctaTitle = 'Close enough that the gaps are worth closing properly.';
        ctaCopy =
            'A Pinpoint Investment Assessment goes where this scan cannot: your actual numbers, your actual documents, your actual cap table — and a report you can act on.' +
            (hasFlags ? ' Given the deal-stoppers above, we would start there.' : ' Most companies in your band are one working quarter from ready.');
        primaryBtnText = 'Apply for a full assessment';
        primaryBtnHref = '/assessment';
        secondaryBtnText = 'See what it costs';
        secondaryBtnHref = '/#pricing';
    }

    // Build Recharts data
    const radarData = PILLAR_KEYS.map((k) => ({
        subject: PILLAR_LABELS[k],
        value: pillar_scores[k],
    }));

    return (
        <>
            <Head title="Your PARAGON Results" />

            <DiagnosticLayout glowColor={meta.color}>
                <div className="mx-auto max-w-4xl px-4 pt-8 pb-24 sm:px-8">
                    {/* Heading */}
                    <FadeUp delay={0.05} className="mb-10">
                        <h1 className="font-display text-3xl font-extrabold tracking-tight text-zinc-950 sm:text-4xl">
                            Your PARAGON Diagnostic Results
                        </h1>
                    </FadeUp>

                    {/* ── Top Hero Section: Score Ring + Analysis Message ── */}
                    <div className="mb-8 grid gap-6 md:grid-cols-12">
                        {/* Score Hero (Left 5 cols) */}
                        <FadeUp delay={0.1} className="md:col-span-5">
                            <div className="dx-card flex h-full flex-col items-center justify-center rounded-2xl p-8">
                                {/* Band badge */}
                                <div
                                    className="mb-6 inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[9px] font-extrabold tracking-[0.2em] uppercase shadow-xs backdrop-blur-xs"
                                    style={{
                                        color: meta.color,
                                        borderColor: `${meta.color}25`,
                                        backgroundColor: `${meta.color}08`,
                                    }}
                                >
                                    <meta.Icon className="size-3" strokeWidth={2.5} />
                                    {meta.badgeLabel}
                                </div>

                                {/* Circular Score Gauge */}
                                <div className="relative mb-6 flex size-44 items-center justify-center">
                                    <svg className="size-full rotate-[-90deg]">
                                        <circle cx="88" cy="88" r="76" className="fill-none" stroke="rgba(58, 84, 165, 0.05)" strokeWidth="8" />
                                        <motion.circle
                                            cx="88"
                                            cy="88"
                                            r="76"
                                            className="fill-none"
                                            stroke={meta.color}
                                            strokeWidth="8"
                                            strokeLinecap="round"
                                            strokeDasharray={2 * Math.PI * 76}
                                            initial={{ strokeDashoffset: 2 * Math.PI * 76 }}
                                            animate={{ strokeDashoffset: 2 * Math.PI * 76 - (score / 100) * (2 * Math.PI * 76) }}
                                            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                                        />
                                    </svg>
                                    <div className="absolute flex flex-col items-center justify-center text-center">
                                        <span className="font-display text-5xl font-black tracking-tight" style={{ color: meta.color }}>
                                            {score}
                                        </span>
                                        <span className="mt-0.5 text-[10px] font-black tracking-widest text-zinc-400 uppercase">/100</span>
                                    </div>
                                </div>

                                <p className="text-[10px] font-extrabold tracking-[0.2em] text-zinc-400 uppercase">Overall Diligence Score</p>
                            </div>
                        </FadeUp>

                        {/* Analysis & CTA (Right 7 cols) */}
                        <FadeUp delay={0.15} className="md:col-span-7">
                            <div className="dx-card flex h-full flex-col justify-center rounded-2xl p-8">
                                <div className="space-y-4">
                                    <div className="flex items-center gap-2">
                                        <div
                                            className="flex size-8 items-center justify-center rounded-lg"
                                            style={{ backgroundColor: `${meta.color}10`, color: meta.color }}
                                        >
                                            <meta.Icon className="size-4" />
                                        </div>
                                        <h3 className="font-display text-base font-bold tracking-wider text-zinc-950 uppercase">What This Means</h3>
                                    </div>
                                    <p className="text-zinc-650 text-sm leading-relaxed">{score_band_message}</p>
                                </div>
                            </div>
                        </FadeUp>
                    </div>

                    {/* ── Section: Deal-Stoppers (Hard Flags) ── */}
                    {hasFlags && (
                        <FadeUp delay={0.16} className="mb-8">
                            <div className="rounded-2xl border border-red-200 bg-red-50/50 p-6 backdrop-blur-xs md:p-8">
                                <div className="flex items-start gap-4">
                                    <div className="text-red-650 flex size-10 shrink-0 items-center justify-center rounded-xl bg-red-100 shadow-xs">
                                        <AlertCircle className="size-5" />
                                    </div>
                                    <div className="space-y-2">
                                        <h4 className="font-display text-base font-bold text-red-950">
                                            Deal-Stoppers Identified ({hard_flags.length})
                                        </h4>
                                        <p className="text-red-750 text-xs leading-relaxed font-semibold">
                                            Regardless of your overall score, these items present major risk markers that typically cause investors to
                                            halt diligence immediately:
                                        </p>
                                        <ul className="mt-3 list-disc space-y-1.5 pl-4 text-xs font-semibold text-red-900">
                                            {hard_flags.map((flag, idx) => (
                                                <li key={idx} className="leading-relaxed">
                                                    {flag}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </FadeUp>
                    )}

                    {/* ── Section: Full-width CTA Banner ── */}
                    <FadeUp delay={0.18} className="mb-8">
                        <div className="dx-card flex flex-col items-center justify-between gap-6 rounded-2xl p-6 md:flex-row md:p-8">
                            <div className="flex-1 space-y-1 text-center md:text-left">
                                <h4 className="font-display text-base font-bold text-zinc-950">{ctaTitle}</h4>
                                <p className="max-w-xl text-xs leading-relaxed text-zinc-500">{ctaCopy}</p>
                            </div>

                            <div className="flex w-full min-w-[240px] shrink-0 flex-col gap-2 md:w-auto">
                                {primaryBtnHref === '/resources' ? (
                                    <button
                                        type="button"
                                        onClick={handleSendChecklist}
                                        disabled={checklistLoading || checklistClicked}
                                        className="group relative flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-white/5 bg-[#3A54A5] px-6 py-4 text-xs font-bold tracking-[0.2em] text-white uppercase shadow-none transition-all duration-300 outline-none hover:scale-[1.005] hover:bg-[#2D4182] hover:shadow-[0_8px_25px_rgba(58,84,165,0.25)] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-70"
                                    >
                                        {checklistLoading ? 'Sending…' : primaryBtnText}
                                        {!checklistLoading && <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />}
                                    </button>
                                ) : (
                                    <a
                                        href={primaryBtnHref}
                                        className="group relative flex w-full items-center justify-center gap-2 rounded-xl border border-white/5 bg-[#3A54A5] px-6 py-4 text-xs font-bold tracking-[0.2em] text-white uppercase shadow-none transition-all duration-300 outline-none hover:scale-[1.005] hover:bg-[#2D4182] hover:shadow-[0_8px_25px_rgba(58,84,165,0.25)] active:scale-[0.99]"
                                    >
                                        {primaryBtnText}
                                        <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
                                    </a>
                                )}

                                <a
                                    href={secondaryBtnHref}
                                    className="w-full rounded-xl border border-zinc-200 bg-white px-6 py-4 text-center text-xs font-bold tracking-[0.2em] text-zinc-700 uppercase transition-all duration-300 hover:border-[#3A54A5]/30 hover:bg-[#3A54A5]/5 hover:text-[#3A54A5] hover:shadow-xs focus:outline-none active:scale-[0.99]"
                                >
                                    {secondaryBtnText}
                                </a>

                                {checklistClicked && primaryBtnHref === '/resources' && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -6 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="rounded-xl border border-emerald-200 bg-emerald-50/50 px-4 py-3 text-center text-xs leading-relaxed font-semibold text-emerald-800"
                                    >
                                        Checklist sent! Check your inbox & spam folder.
                                    </motion.div>
                                )}
                                {checklistError && primaryBtnHref === '/resources' && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -6 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="rounded-xl border border-red-200 bg-red-50/50 px-4 py-3 text-center text-xs leading-relaxed font-semibold text-red-700"
                                    >
                                        Something went wrong. Please try again.
                                    </motion.div>
                                )}
                            </div>
                        </div>
                    </FadeUp>

                    {/* ── Section: Weakest Dimension Tailored Fixes ── */}
                    {weakest_dimensions.length > 0 && (
                        <FadeUp delay={0.19} className="mb-8">
                            <div className="space-y-4">
                                <h3 className="font-display text-sm font-bold tracking-widest text-zinc-400 uppercase">
                                    Prioritized Gap Remediation
                                </h3>
                                <div className="grid gap-6 md:grid-cols-2">
                                    {weakest_dimensions.map((pillar, idx) => {
                                        const info = pillar === 'network' ? getNetworkRemediation(network_strands) : REMEDIATION_COPY[pillar];

                                        if (!info) return null;
                                        const IconComponent = PILLAR_ICONS[pillar as keyof PillarScores] || Zap;
                                        const pillarLabel = PILLAR_LABELS[pillar as keyof PillarScores] || pillar;

                                        return (
                                            <div key={pillar} className="dx-card flex flex-col justify-between rounded-2xl p-6 sm:p-8">
                                                <div className="space-y-4">
                                                    <div className="flex items-center gap-2">
                                                        <div className="flex size-8 items-center justify-center rounded-lg bg-[#3A54A5]/10 text-[#3A54A5]">
                                                            <IconComponent className="size-4.5" />
                                                        </div>
                                                        <h4 className="font-display text-xs font-bold tracking-widest text-zinc-950 uppercase">
                                                            Gap #{idx + 1}: {pillarLabel}
                                                        </h4>
                                                    </div>
                                                    <p className="border-l-2 border-zinc-200 pl-3 text-xs leading-relaxed font-semibold text-zinc-500 italic">
                                                        "{info.headline}"
                                                    </p>

                                                    {pillar === 'network' && info.strandCallout && (
                                                        <div className="rounded-lg bg-[#3A54A5]/5 px-3 py-2 text-[10px] font-bold text-[#3A54A5]">
                                                            Commercial Score: {network_strands.commercial}% | Capital & Narrative:{' '}
                                                            {network_strands.capital}%<div className="mt-1 text-zinc-500">{info.strandCallout}</div>
                                                        </div>
                                                    )}

                                                    <ul className="space-y-3 pt-2">
                                                        {info.actions.map((act, i) => (
                                                            <li
                                                                key={i}
                                                                className="text-zinc-650 flex items-start gap-2.5 text-xs leading-relaxed font-semibold"
                                                            >
                                                                <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-[#3A54A5]/10 text-[10px] font-bold text-[#3A54A5]">
                                                                    {i + 1}
                                                                </span>
                                                                <span>{act}</span>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </FadeUp>
                    )}

                    {/* ── Bottom Section: Radar Chart + Pillar Breakdown Grid ── */}
                    <div className="grid gap-6 md:grid-cols-12">
                        {/* Radar Chart Card (Left 5 cols) */}
                        <FadeUp delay={0.2} className="md:col-span-5">
                            <div className="dx-card flex h-full flex-col justify-between rounded-2xl p-6">
                                <div className="mb-4">
                                    <h3 className="text-xs font-bold tracking-[0.2em] text-zinc-500 uppercase">Pillar Radar footprint</h3>
                                </div>
                                <div className="relative flex flex-1 items-center justify-center">
                                    <ResponsiveContainer width="100%" height={280}>
                                        <RadarChart data={radarData} margin={{ top: 10, right: 10, bottom: 10, left: 10 }} outerRadius="62%">
                                            <PolarGrid stroke="rgba(58, 84, 165, 0.08)" />
                                            <PolarAngleAxis dataKey="subject" tick={{ fill: '#52525b', fontSize: 10, fontWeight: 700 }} />
                                            <Radar
                                                dataKey="value"
                                                stroke={meta.color}
                                                fill={`${meta.color}25`}
                                                strokeWidth={2}
                                                dot={{ fill: meta.color, r: 3 }}
                                            />
                                        </RadarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </FadeUp>

                        {/* Diligence Pillar Grid (Right 7 cols) */}
                        <FadeUp delay={0.25} className="md:col-span-7">
                            <div className="dx-card h-full rounded-2xl p-6">
                                <div className="mb-6">
                                    <h3 className="text-xs font-bold tracking-[0.2em] text-zinc-500 uppercase">Forensic Pillar Breakdown</h3>
                                </div>
                                <div className="grid gap-4 sm:grid-cols-2">
                                    {PILLAR_KEYS.map((key, i) => {
                                        const IconComponent = PILLAR_ICONS[key];
                                        const miniRadius = 16;
                                        const miniCircumference = 2 * Math.PI * miniRadius;
                                        return (
                                            <div
                                                key={key}
                                                className={`flex items-center justify-between gap-3 rounded-xl border border-zinc-200/60 bg-white/45 p-4 shadow-xs backdrop-blur-xs transition-all duration-300 hover:-translate-y-0.5 hover:bg-white/70 hover:shadow-xs ${
                                                    i === PILLAR_KEYS.length - 1 ? 'sm:col-span-2' : ''
                                                }`}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-[#3A54A5]/10 bg-white/90 text-[#3A54A5] shadow-xs">
                                                        <IconComponent className="size-4.5" strokeWidth={2} />
                                                    </div>
                                                    <div className="min-w-0">
                                                        <h4 className="font-display truncate text-xs leading-tight font-bold text-zinc-950">
                                                            {PILLAR_LABELS[key]}
                                                        </h4>
                                                        <p className="mt-0.5 text-[9px] font-extrabold tracking-wider text-zinc-400 uppercase">
                                                            {pillar_scores[key] === 100
                                                                ? 'Verified'
                                                                : pillar_scores[key] >= 80
                                                                  ? 'Excellent'
                                                                  : pillar_scores[key] >= 50
                                                                    ? 'Stable'
                                                                    : 'Review'}
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="relative flex size-10 shrink-0 items-center justify-center">
                                                    <svg className="size-full rotate-[-90deg]">
                                                        <circle
                                                            cx="20"
                                                            cy="20"
                                                            r={miniRadius}
                                                            className="fill-none"
                                                            stroke="rgba(58, 84, 165, 0.05)"
                                                            strokeWidth="3.5"
                                                        />
                                                        <motion.circle
                                                            cx="20"
                                                            cy="20"
                                                            r={miniRadius}
                                                            className="fill-none"
                                                            stroke="#3A54A5"
                                                            strokeWidth="3.5"
                                                            strokeLinecap="round"
                                                            strokeDasharray={miniCircumference}
                                                            initial={{ strokeDashoffset: miniCircumference }}
                                                            animate={{
                                                                strokeDashoffset: miniCircumference - (pillar_scores[key] / 100) * miniCircumference,
                                                            }}
                                                            transition={{ duration: 1.0, delay: 0.3 + i * 0.06, ease: 'easeOut' }}
                                                        />
                                                    </svg>
                                                    <div className="absolute text-[8px] font-black text-zinc-700">{pillar_scores[key]}%</div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </FadeUp>
                    </div>
                </div>
            </DiagnosticLayout>
        </>
    );
}
