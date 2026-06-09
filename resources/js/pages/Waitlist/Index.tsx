import { ParagonRadarChart } from '@/components/ParagonRadarChart';
import { cn } from '@/lib/utils';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { AnimatePresence, motion, useInView, useReducedMotion, useScroll, useSpring } from 'framer-motion';
import {
    ArrowRight,
    CheckCircle2,
    ChevronDown,
    ChevronLeft,
    Facebook,
    Landmark,
    Linkedin,
    Rocket,
    ShieldCheck,
    Sparkles,
    Twitter,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

// ─── Types ────────────────────────────────────────────────────────────────────

interface SelectOption {
    value: string;
    label: string;
}

interface FlashStatus {
    variant: 'success' | 'error';
    message: string;
}

interface PageProps {
    selectedAudience: 'founder' | 'investor' | null;
    founderStages: SelectOption[];
    investorRoles: SelectOption[];
    founderStatus: FlashStatus | null;
    investorStatus: FlashStatus | null;
    diagnosticSession?: {
        id: number;
        score: number;
        score_band: 'low' | 'mid_low' | 'mid_high' | 'high';
    } | null;
}

// ─── Audience config ──────────────────────────────────────────────────────────

const AUDIENCES = {
    founder: {
        slug: 'founder' as const,
        label: 'For Founders',
        badge: 'bg-[#5CA336] text-white',
        badgeGlow: 'shadow-[0_0_20px_rgba(92,163,54,0.4)]',
        // Card headline — specific and outcome-focused
        title: 'Find out why VCs say no before you\u00a0walk\u00a0in.',
        lead: 'PARAGON audits your venture across seven critical pillars and delivers a verification credential investors\u00a0actually\u00a0trust.',
        perk: 'Join the waitlist to receive the PARAGON Readiness Checklist immediately, plus priority access to the inaugural audit\u00a0batch.',
        supportTitle: 'What you get as a founder',
        // Objection-answering, not restating
        supportItems: [
            'A structured audit score across seven pillars — so you know exactly what to fix before pitching.',
            'The PARAGON credential signals readiness to investors without you having to explain your traction from scratch.',
            'Your first report ships within 5 business days. No interview required.',
        ],
        footerQuote: {
            text: 'In 2026, capital isn\'t scarce, but trust is. Pinpoint Launchpad provides the \'Credit Rating\' for startups, de-risking the bridge between visionary founders and institutional capital',
            attribution: 'Pinpoint Launchpad, Investor Relations Brief, Q1 2026',
        },
        submitRoute: 'waitlist.founders.store',
        submitLabel: 'Join the Founder Waitlist',
        Icon: Rocket,
        accent: '#5CA336',
        glowColor: 'rgba(92,163,54,0.14)',
        cardBorderHover: 'hover:border-[#5CA336]/30 hover:shadow-[0_0_70px_rgba(92,163,54,0.1)]',
        glowClass: 'from-[#5CA336]/20 via-[#5CA336]/5 to-transparent',
        iconClass: 'text-[#5CA336]',
        focusRingClass: 'focus:ring-[#5CA336]/15 focus:border-[#5CA336]/50',
        selectActiveClass: 'bg-[#5CA336]/10 text-white',
    },
    investor: {
        slug: 'investor' as const,
        label: 'For Investors',
        badge: 'bg-[#2F4587] text-white',
        badgeGlow: 'shadow-[0_0_20px_rgba(60,83,168,0.4)]',
        // Card headline — speaks to investor skepticism, not founder anxiety
        title: 'Stop sourcing on gut feel.\u00a0Start with verified\u00a0signal.',
        lead: 'Access a pre-screened pipeline where every founder has passed a structured, seven-pillar audit before you spend a\u00a0single\u00a0hour\u00a0on\u00a0diligence.',
        perk: 'Get early access to the PIN Verification Portal and our first institutional-grade cohort of audited\u00a0founders.',
        supportTitle: 'What you get as an investor',
        // Speaks to skepticism, not just features
        supportItems: [
            'Each founder in the pipeline has completed a structured audit no warm intros required, no deck-sifting.',
            'Pinpoint\'s seven-pillar model surfaces the signals your team would spend weeks trying to extract manually.',
            'Filter by stage, pillar score, and sector. Every mandate fit, no noise.',
        ],
        footerQuote: {
            text: 'Deploying capital isn\'t the challenge, but finding founders you can trust is. Pinpoint Launchpad is being built as the verification layer between your institutional capital and visionary founders.',
            attribution: 'Pinpoint Launchpad, Investor Relations Brief, Q1 2026',
        },
        submitRoute: 'waitlist.investors.store',
        submitLabel: 'Join the Investor Waitlist',
        Icon: Landmark,
        accent: '#2F4587',
        glowColor: 'rgba(60,83,168,0.14)',
        cardBorderHover: 'hover:border-[#2F4587]/30 hover:shadow-[0_0_70px_rgba(60,83,168,0.1)]',
        glowClass: 'from-[#2F4587]/20 via-[#2F4587]/5 to-transparent',
        iconClass: 'text-[#2F4587]',
        focusRingClass: 'focus:ring-[#2F4587]/15 focus:border-[#2F4587]/50',
        selectActiveClass: 'bg-[#2F4587]/10 text-white',
    },
} as const;

type AudienceKey = keyof typeof AUDIENCES;
type AudienceConfig = (typeof AUDIENCES)[AudienceKey];

// ─── Animation variants ───────────────────────────────────────────────────────

const fadeUp = {
    hidden: { opacity: 0, y: 24, filter: 'blur(4px)' },
    show: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.55, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] } },
};

const stagger = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.05 } },
};


// ─── Hero headline ────────────────────────────────────────────────────────────

function AnimatedHeadline() {
    // Tighter: one punchy line, then the value prop — not two competing claims
    const line1 = 'Fundraising is broken.'.split(' ');
    const line2 = "We're fixing the proof problem.".split(' ');

    const wordVariant = {
        hidden: { opacity: 0, y: 20, filter: 'blur(6px)' },
        show: (i: number) => ({
            opacity: 1, y: 0, filter: 'blur(0px)',
            transition: { duration: 0.5, delay: i * 0.07, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] },
        }),
    };

    const allWords = [...line1.map((w, i) => ({ word: w, i, gradient: false })), ...line2.map((w, i) => ({ word: w, i: line1.length + i, gradient: true }))];

    return (
        <h1 className="mt-8 inline-flex flex-wrap justify-center gap-x-[0.25em] font-display text-3xl font-semibold leading-[1.15] tracking-tight sm:text-4xl md:text-[3.6rem]">
            {allWords.map(({ word, i, gradient }) => (
                <motion.span
                    key={i}
                    custom={i}
                    variants={wordVariant}
                    initial="hidden"
                    animate="show"
                    className={gradient
                        ? 'inline-block text-white/50 font-bold'
                        : 'inline-block text-white'
                    }
                >
                    {word}
                </motion.span>
            ))}
        </h1>
    );
}

// ─── PARAGON section (radar chart + explanation) ──────────────────────────────

function ParagonPillarsSection() {
    const ref = useRef<HTMLDivElement>(null);
    const inView = useInView(ref, { once: true, margin: '-80px' });
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

    const pillars = [
        {
            name: 'Potential & Scale',
            desc: 'Validating addressable market size, business model leverage, and scale vectors.',
            color: '#5CA336', // Founder green
        },
        {
            name: 'Agility & Execution',
            desc: 'Auditing MVP velocity, deployment cycles, user feedback loops, and pivot capacity.',
            color: '#5CA336', // Founder green
        },
        {
            name: 'Risk Mitigation',
            desc: 'Examining client dependencies, technical debt exposure, and capital runways.',
            color: '#2F4587', // Investor blue
        },
        {
            name: 'Alignment & Vision',
            desc: 'Evaluating cap-table structures, founder vesting, and key executive alignments.',
            color: '#2F4587', // Investor blue
        },
        {
            name: 'Corporate Governance',
            desc: 'Auditing boardroom processes, IP assignment records, and corporate structures.',
            color: '#5CA336', // Founder green
        },
        {
            name: 'Operational Systems',
            desc: 'Validating unit economics, CAC/LTV ratios, cohort retention, and stack scalability.',
            color: '#2F4587', // Investor blue
        },
        {
            name: 'Network & Ecosystem',
            desc: 'Reviewing strategic supplier contracts, integration channels, and partnership networks.',
            color: '#5CA336', // Founder green
        },
    ];

    return (
        <section ref={ref} className="mt-28 w-full border-t border-white/[0.06] pt-20">
            <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 items-start">
                
                {/* Left Column: Editorial Information & Radar Chart */}
                <div className="space-y-8 text-left">
                    <div>
                        <span className="inline-flex items-center gap-2 rounded-sm border border-white/[0.08] bg-white/[0.04] px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-white/50">
                            The PARAGON Model
                        </span>
                        <h2 className="mt-6 font-display text-3xl font-bold leading-tight tracking-tight text-white md:text-4xl">
                            Seven pillars. One verdict.
                        </h2>
                        <p className="mt-4 text-sm leading-relaxed text-[#94A3B8]">
                            Our proprietary PARAGON model audits your venture across 7 critical pillars from IP Governance to Unit Economics. It's the credential that turns a "Maybe" into a "Yes".
                        </p>
                    </div>

                    {/* Radar Chart Container */}
                    <div className="waitlist-radar relative w-full flex justify-center pt-4">
                        <div className="pointer-events-none absolute left-1/2 top-1/2 -z-10 h-[60%] w-[60%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-tr from-[#5CA336]/10 to-[#2F4587]/10 blur-[60px]" />
                        <div className="w-full max-w-lg">
                            <ParagonRadarChart />
                        </div>
                    </div>
                </div>

                {/* Right Column: 7 Pillars List (clean, typography-driven list) */}
                <div className="divide-y divide-white/5">
                    {pillars.map((p, i) => {
                        const isHovered = hoveredIndex === i;
                        return (
                            <div
                                key={i}
                                onMouseEnter={() => setHoveredIndex(i)}
                                onMouseLeave={() => setHoveredIndex(null)}
                                className="py-5 text-left transition-all duration-300 cursor-pointer"
                            >
                                <div className="flex items-start gap-5">
                                    <span
                                        className="font-display text-xl font-bold tracking-tight transition-colors duration-300 leading-none select-none"
                                        style={{ color: isHovered ? p.color : 'rgba(255, 255, 255, 0.12)' }}
                                    >
                                        {String(i + 1).padStart(2, '0')}
                                    </span>
                                    <div className="flex-1">
                                        <h4
                                            className="font-display text-sm sm:text-base font-bold text-white/80 transition-colors duration-300"
                                            style={{ color: isHovered ? '#ffffff' : 'rgba(255, 255, 255, 0.75)' }}
                                        >
                                            {p.name}
                                        </h4>
                                        <p className="mt-1.5 text-xs leading-relaxed text-[#94A3B8]/60 transition-colors duration-300">
                                            {p.desc}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

            </div>
        </section>
    );
}

// ─── Quote — with attribution ─────────────────────────────────────────────────

const QUOTE_TEXT = `In 2026, capital isn't scarce but trust is. Pinpoint Launchpad provides the credit rating for startups, de-risking the bridge between visionary founders and institutional capital.`;

function TypewriterQuote() {
    const ref = useRef<HTMLDivElement>(null);
    const inView = useInView(ref, { once: true, margin: '-60px' });
    const reduce = useReducedMotion();
    const [displayed, setDisplayed] = useState('');
    const [done, setDone] = useState(false);

    useEffect(() => {
        if (!inView) return;
        if (reduce) { setDisplayed(QUOTE_TEXT); setDone(true); return; }
        let i = 0;
        const interval = setInterval(() => {
            i++;
            setDisplayed(QUOTE_TEXT.slice(0, i));
            if (i >= QUOTE_TEXT.length) { clearInterval(interval); setDone(true); }
        }, 18);
        return () => clearInterval(interval);
    }, [inView, reduce]);

    const trustIndex = displayed.indexOf('trust is.');
    const before = trustIndex >= 0 ? displayed.slice(0, trustIndex) : displayed;
    const trust = trustIndex >= 0 ? displayed.slice(trustIndex, trustIndex + 9) : '';
    const after = trustIndex >= 0 ? displayed.slice(trustIndex + 9) : '';

    return (
        <motion.section
            ref={ref}
            initial={{ opacity: 0, y: 24 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
            className="mx-auto mt-20 max-w-2xl text-center"
        >
                <div className="mb-4 flex justify-center">
                    <span className="h-px w-10 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                </div>
                <p className="font-display text-lg font-medium leading-relaxed text-white/70 md:text-xl">
                    {before}
                    {trust && <span className="text-white">{trust}</span>}
                    {after}
                    {!done && (
                        <motion.span
                            animate={{ opacity: [1, 0] }}
                            transition={{ duration: 0.5, repeat: Infinity, repeatType: 'reverse' }}
                            className="ml-0.5 inline-block h-[1.1em] w-[2px] bg-white/60 align-middle"
                        />
                    )}
                </p>
                {done && (
                    <div className="mt-6 flex justify-center">
                        <span className="h-px w-10 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                    </div>
                )}
        </motion.section>
    );
}

// ─── Custom select ────────────────────────────────────────────────────────────

interface CustomSelectProps {
    id: string;
    value: string;
    onChange: (value: string) => void;
    options: SelectOption[];
    placeholder: string;
    focusRingClass: string;
    selectActiveClass: string;
}

function CustomSelect({ id, value, onChange, options, placeholder, focusRingClass, selectActiveClass }: CustomSelectProps) {
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);
    const selected = options.find((o) => o.value === value);

    useEffect(() => {
        const close = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
        };
        document.addEventListener('mousedown', close);
        return () => document.removeEventListener('mousedown', close);
    }, []);

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Escape') { setOpen(false); return; }
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setOpen((p) => !p); return; }
        if (!open) return;
        const idx = options.findIndex((o) => o.value === value);
        if (e.key === 'ArrowDown') { e.preventDefault(); onChange(options[Math.min(idx + 1, options.length - 1)].value); }
        if (e.key === 'ArrowUp')   { e.preventDefault(); onChange(options[Math.max(idx - 1, 0)].value); }
    };

    return (
        <div ref={ref} className="relative">
            <button
                type="button"
                id={id}
                role="combobox"
                aria-expanded={open}
                aria-haspopup="listbox"
                onKeyDown={handleKeyDown}
                onClick={() => setOpen((p) => !p)}
                className={cn(
                    'waitlist-input flex items-center justify-between text-left',
                    !selected && 'text-white/25',
                    focusRingClass,
                )}
            >
                <span className="truncate">{selected ? selected.label : placeholder}</span>
                <ChevronDown
                    className={cn('h-4 w-4 shrink-0 text-white/30 transition-transform duration-200', open && 'rotate-180 text-white/60')}
                />
            </button>

            <AnimatePresence>
                {open && (
                    <motion.div
                        role="listbox"
                        initial={{ opacity: 0, y: 8, scale: 0.97 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.97 }}
                        transition={{ duration: 0.15, ease: 'easeOut' }}
                        className="absolute bottom-full z-50 mb-2 w-full overflow-hidden rounded-xl border border-white/10 bg-[#161616] shadow-[0_0_50px_rgba(0,0,0,0.9)] backdrop-blur-2xl"
                    >
                        <div className="max-h-56 overflow-y-auto py-1.5">
                            {options.map((opt) => (
                                <button
                                    key={opt.value}
                                    type="button"
                                    role="option"
                                    aria-selected={value === opt.value}
                                    onClick={() => { onChange(opt.value); setOpen(false); }}
                                    className={cn(
                                        'w-full px-4 py-2.5 text-left text-sm outline-none transition-colors duration-100',
                                        value === opt.value
                                            ? cn('font-medium', selectActiveClass)
                                            : 'text-white/55 hover:bg-white/[0.06] hover:text-white',
                                    )}
                                >
                                    {opt.label}
                                </button>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

// ─── Field error ──────────────────────────────────────────────────────────────

function FieldError({ message }: { message?: string }) {
    return (
        <AnimatePresence>
            {message && (
                <motion.p
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-1.5 ml-1 text-xs text-rose-400"
                >
                    {message}
                </motion.p>
            )}
        </AnimatePresence>
    );
}

// ─── Status banner ────────────────────────────────────────────────────────────

function StatusBanner({ status }: { status: FlashStatus }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn(
                'flex items-start gap-3 rounded-xl border px-4 py-3.5 text-sm leading-relaxed',
                status.variant === 'success'
                    ? 'border-[#5CA336]/30 bg-[#5CA336]/10 text-[#c8edbb]'
                    : 'border-rose-400/25 bg-rose-500/10 text-rose-200',
            )}
        >
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 opacity-80" />
            {status.message}
        </motion.div>
    );
}

// ─── Founder form ─────────────────────────────────────────────────────────────

function FounderForm({ config, stages, status }: { config: AudienceConfig; stages: SelectOption[]; status: FlashStatus | null }) {
    const form = useForm({ name: '', email: '', company_name: '', stage: '' });
    const submitted = status?.variant === 'success';

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        form.post(route(config.submitRoute), { preserveScroll: true });
    };

    if (submitted) return <SuccessState config={config} status={status!} />;

    return (
        <form onSubmit={submit} className="mt-8 grid gap-5" noValidate>
            {status && <StatusBanner status={status} />}

            <div className="grid gap-5 sm:grid-cols-2">
                <Field label="Full Name" id="f-name" error={form.errors.name}>
                    <input id="f-name" className={cn('waitlist-input', config.focusRingClass)} placeholder="Adaora Okafor"
                        value={form.data.name} onChange={e => form.setData('name', e.target.value)} />
                </Field>
                <Field label="Email" id="f-email" error={form.errors.email}>
                    <input id="f-email" type="email" className={cn('waitlist-input', config.focusRingClass)} placeholder="founder@startup.com"
                        value={form.data.email} onChange={e => form.setData('email', e.target.value)} />
                </Field>
            </div>

            <Field label="Company Name" id="f-company" error={form.errors.company_name}>
                <input id="f-company" className={cn('waitlist-input', config.focusRingClass)} placeholder="Vertex Labs"
                    value={form.data.company_name} onChange={e => form.setData('company_name', e.target.value)} />
            </Field>

            <Field label="Stage" id="f-stage" error={form.errors.stage}>
                <CustomSelect id="f-stage" value={form.data.stage} onChange={v => form.setData('stage', v)}
                    options={stages} placeholder="Select your startup stage"
                    focusRingClass={config.focusRingClass} selectActiveClass={config.selectActiveClass} />
            </Field>

            <SubmitButton label={config.submitLabel} processing={form.processing} accent={config.accent} />
        </form>
    );
}

// ─── Investor form ────────────────────────────────────────────────────────────

function InvestorForm({ config, roles, status }: { config: AudienceConfig; roles: SelectOption[]; status: FlashStatus | null }) {
    const form = useForm({ name: '', email: '', firm_name: '', role: '' });
    const submitted = status?.variant === 'success';

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        form.post(route(config.submitRoute), { preserveScroll: true });
    };

    if (submitted) return <SuccessState config={config} status={status!} />;

    return (
        <form onSubmit={submit} className="mt-8 grid gap-5" noValidate>
            {status && <StatusBanner status={status} />}

            <div className="grid gap-5 sm:grid-cols-2">
                <Field label="Full Name" id="i-name" error={form.errors.name}>
                    <input id="i-name" className={cn('waitlist-input', config.focusRingClass)} placeholder="Tomiwa Balogun"
                        value={form.data.name} onChange={e => form.setData('name', e.target.value)} />
                </Field>
                <Field label="Email" id="i-email" error={form.errors.email}>
                    <input id="i-email" type="email" className={cn('waitlist-input', config.focusRingClass)} placeholder="partner@firm.com"
                        value={form.data.email} onChange={e => form.setData('email', e.target.value)} />
                </Field>
            </div>

            <Field label="Firm Name" id="i-firm" error={form.errors.firm_name}>
                <input id="i-firm" className={cn('waitlist-input', config.focusRingClass)} placeholder="Summit Capital"
                    value={form.data.firm_name} onChange={e => form.setData('firm_name', e.target.value)} />
            </Field>

            <Field label="Type" id="i-role" error={form.errors.role}>
                <CustomSelect id="i-role" value={form.data.role} onChange={v => form.setData('role', v)}
                    options={roles} placeholder="Select your investor role"
                    focusRingClass={config.focusRingClass} selectActiveClass={config.selectActiveClass} />
            </Field>

            <SubmitButton label={config.submitLabel} processing={form.processing} accent={config.accent} />
        </form>
    );
}

// ─── Shared sub-components ────────────────────────────────────────────────────

function Field({ label, id, error, children }: { label: string; id: string; error?: string; children: React.ReactNode }) {
    return (
        <div className="space-y-1.5">
            <label htmlFor={id} className="ml-0.5 block text-[11px] font-semibold uppercase tracking-[0.2em] text-white/40">
                {label}
            </label>
            {children}
            <FieldError message={error} />
        </div>
    );
}

function SubmitButton({ label, processing, accent }: { label: string; processing: boolean; accent: string }) {
    return (
        <button
            type="submit"
            disabled={processing}
            className="group relative mt-2 flex w-full items-center justify-center gap-2 overflow-hidden rounded-xl px-5 py-4 text-[13px] font-bold uppercase tracking-[0.18em] text-white outline-none transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-60"
            style={{
                background: accent,
                boxShadow: `0 0 28px ${accent}55`,
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.filter = 'brightness(1.1)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.filter = ''; }}
        >
            <span className="waitlist-shimmer absolute inset-0 opacity-50 mix-blend-overlay transition-opacity duration-300 group-hover:opacity-100" />
            <span className="relative z-10 flex items-center gap-2">
                {processing ? (
                    <>
                        <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/20 border-t-white" />
                        Submitting…
                    </>
                ) : (
                    <>
                        {label}
                        <ArrowRight className="h-4 w-4" />
                    </>
                )}
            </span>
        </button>
    );
}

function SuccessState({ config, status }: { config: AudienceConfig; status: FlashStatus }) {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col items-center py-12 text-center"
        >
            <div className={cn('mb-6 flex h-14 w-14 items-center justify-center rounded-full', config.iconClass, 'bg-white/5 ring-1 ring-white/10')}>
                <Sparkles className="h-6 w-6" />
            </div>
            <p className="max-w-sm text-base leading-relaxed text-white/70">{status.message}</p>
        </motion.div>
    );
}

// ─── Support panel ────────────────────────────────────────────────────────────

function SupportPanel({ config }: { config: AudienceConfig }) {
    return (
        <motion.aside
            variants={fadeUp}
            initial="hidden"
            animate="show"
            className="waitlist-panel relative overflow-hidden rounded-3xl border border-white/[0.06] p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] md:rounded-[1.75rem] md:p-10"
        >
            <div
                className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full blur-3xl"
                style={{ background: `radial-gradient(circle, ${config.glowColor}, transparent 70%)` }}
            />

            <div className="relative">
                <span className={cn('inline-flex rounded-full px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-[0.25em]', config.badge, config.badgeGlow)}>
                    {config.label}
                </span>

                <h2 className="mt-7 font-display text-2xl font-semibold text-white">{config.supportTitle}</h2>

                <ul className="mt-8 space-y-5">
                    {config.supportItems.map((item, i) => (
                        <motion.li
                            key={i}
                            initial={{ opacity: 0, x: -8 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.12 + 0.2, ease: [0.16, 1, 0.3, 1] }}
                            className="group flex items-start gap-3.5"
                        >
                            <div className={cn('mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white/[0.04] ring-1 ring-white/8 transition-all duration-300 group-hover:bg-white/[0.08] group-hover:ring-white/15', config.iconClass)}>
                                <CheckCircle2 className="h-3 w-3" />
                            </div>
                            <p className="text-sm leading-relaxed text-white/45 transition-colors duration-300 group-hover:text-white/70">
                                {item}
                            </p>
                        </motion.li>
                    ))}
                </ul>

                {/* Quote with attribution */}
                <div className="mt-10 border-t border-white/[0.06] pt-8">
                    <div className="flex gap-3">
                        <ShieldCheck className={cn('mt-0.5 h-4 w-4 shrink-0 opacity-50', config.iconClass)} />
                        <p className="text-[14px] italic leading-relaxed text-white/65">
                            "{config.footerQuote.text}"
                        </p>
                    </div>
                </div>
            </div>
        </motion.aside>
    );
}

// ─── Audience track selector (landing) ────────────────────────────────────────

function AudienceTrackSelector() {
    return (
        <section className="relative mt-24 border-t border-white/[0.06] pt-20">
            <div id="who-are-you" className="mb-16 text-center max-w-2xl mx-auto">
                <span className="text-[10px] font-black uppercase tracking-[0.22em] text-white/40">
                    Get Started
                </span>
                <h2 className="mt-4 font-display text-3xl font-bold text-white leading-tight">
                    Select Your Pathway
                </h2>
                <p className="mt-4 text-sm leading-relaxed text-[#94A3B8]">
                    Pinpoint serves both venture builders and capital allocators with dedicated diligence portals.
                </p>
            </div>

            <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 relative">
                {/* Vertical Divider for lg screens */}
                <div className="hidden lg:block absolute left-1/2 top-0 bottom-0 w-px bg-white/5 -translate-x-1/2" />

                {/* Founder Column */}
                <div className="flex flex-col justify-between text-left space-y-8 pr-0 lg:pr-8">
                    <div>
                        <div className="flex items-center gap-3">
                            <span className="font-display text-[2.5rem] font-bold text-[#5CA336] leading-none select-none tracking-tight">01</span>
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] px-2.5 py-0.5 border border-[#5CA336]/30 bg-[#5CA336]/10 text-[#5CA336] rounded-sm">
                                Founders
                            </span>
                        </div>
                        <h3 className="mt-6 font-display text-2xl font-bold text-white tracking-tight leading-snug">
                            Find out why VCs say no before you walk in.
                        </h3>
                        <p className="mt-4 text-sm leading-relaxed text-[#94A3B8]">
                            PARAGON audits your venture across seven critical pillars and delivers a verification credential investors actually trust.
                        </p>

                        <ul className="mt-8 space-y-4">
                            {[
                                "Structured audit score across seven core pillars — identify deal-breakers early.",
                                "A shareable, secure credential that signals diligence-readiness directly to institutional funds.",
                                "Human analyst forensic review backed by automated diagnostic checks, completed in 5 days.",
                            ].map((item, i) => (
                                <li key={i} className="flex items-start gap-3 text-xs leading-relaxed text-white/45 hover:text-white/60 transition-colors duration-300">
                                    <span className="mt-1.5 flex h-1.5 w-1.5 shrink-0 rounded-full bg-[#5CA336]" />
                                    <span>{item}</span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="pt-4">
                        <Link
                            href={route('waitlist.index', { audience: 'founder' })}
                            className="group inline-flex items-center gap-2 rounded-md bg-[#5CA336] px-5 py-3 text-xs font-bold uppercase tracking-[0.2em] text-white transition-all duration-200 hover:bg-[#5CA336]/90 border border-white/5 shadow-none"
                        >
                            Enter Founder Track
                            <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
                        </Link>
                    </div>
                </div>

                {/* Investor Column */}
                <div className="flex flex-col justify-between text-left space-y-8 pl-0 lg:pl-8">
                    <div>
                        <div className="flex items-center gap-3">
                            <span className="font-display text-[2.5rem] font-bold text-[#2F4587] leading-none select-none tracking-tight">02</span>
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] px-2.5 py-0.5 border border-[#2F4587]/30 bg-[#2F4587]/15 text-[#91A7D8] rounded-sm">
                                Investors
                            </span>
                        </div>
                        <h3 className="mt-6 font-display text-2xl font-bold text-white tracking-tight leading-snug">
                            Stop sourcing on gut feel. Start with verified signal.
                        </h3>
                        <p className="mt-4 text-sm leading-relaxed text-[#94A3B8]">
                            Access a pre-screened pipeline where every founder has passed a structured, seven-pillar audit before you spend a single hour on diligence.
                        </p>

                        <ul className="mt-8 space-y-4">
                            {[
                                "Access a pre-audited pipeline of high-growth ventures — zero warm intro required.",
                                "Structured seven-pillar metrics that cut down diligence cycles from weeks to minutes.",
                                "Filter verified founders by sector, overall scores, and cap-table structure.",
                            ].map((item, i) => (
                                <li key={i} className="flex items-start gap-3 text-xs leading-relaxed text-white/45 hover:text-white/60 transition-colors duration-300">
                                    <span className="mt-1.5 flex h-1.5 w-1.5 shrink-0 rounded-full bg-[#2F4587]" />
                                    <span>{item}</span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="pt-4">
                        <Link
                            href={route('waitlist.index', { audience: 'investor' })}
                            className="group inline-flex items-center gap-2 rounded-md border border-[#2F4587]/30 bg-[#0c121d] px-5 py-3 text-xs font-bold uppercase tracking-[0.2em] text-[#91A7D8] transition-all duration-200 hover:bg-[#2F4587]/10 hover:border-[#2F4587]/50 hover:text-white"
                        >
                            Enter Investor Track
                            <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
                        </Link>
                    </div>
                </div>
            </div>
        </section>
    );
}

// ─── Form panel ───────────────────────────────────────────────────────────────

function FormPanel({
    config, founderStages, investorRoles, status,
}: {
    config: AudienceConfig;
    founderStages: SelectOption[];
    investorRoles: SelectOption[];
    status: FlashStatus | null;
}) {
    return (
        <motion.section
            variants={fadeUp}
            initial="hidden"
            animate="show"
            className="waitlist-panel relative overflow-hidden rounded-3xl border border-white/[0.06] p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] md:rounded-[1.75rem] md:p-10"
        >
            <div className="relative">
                <span className={cn('inline-flex rounded-full px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-[0.25em]', config.badge, config.badgeGlow)}>
                    {config.label}
                </span>
                {/* Form title is distinct from the landing card title — avoid repetition */}
                <h1 className="mt-7 font-display text-3xl font-semibold leading-tight text-white md:text-4xl">
                    {config.slug === 'founder' ? 'Reserve your audit spot.' : 'Join the investor portal.'}
                </h1>
                <p className="mt-3 text-sm leading-relaxed text-white/45">{config.lead}</p>
            </div>

            <div className="relative mt-2">
                {config.slug === 'founder' ? (
                    <FounderForm config={config} stages={founderStages} status={status} />
                ) : (
                    <InvestorForm config={config} roles={investorRoles} status={status} />
                )}
            </div>
        </motion.section>
    );
}

function ProcessSection() {
    const steps = [
        {
            num: '01',
            title: 'Complete Diagnostic',
            desc: 'Answer benchmark questions to evaluate baseline readiness across the 7-pillar model.',
        },
        {
            num: '02',
            title: 'Forensic Analyst Audit',
            desc: 'Investment analysts independently verify bank accounts, Stripe traction, cap tables, and IP registers.',
        },
        {
            num: '03',
            title: 'Secure Verification Verdict',
            desc: 'Get your official PARAGON score, digital credentials, and structured diligence checklist.',
        },
    ];

    return (
        <section className="mt-28 w-full border-t border-white/[0.06] pt-20">
            <div className="text-center max-w-2xl mx-auto mb-16">
                <span className="text-[10px] font-black uppercase tracking-[0.22em] text-white/40">
                    The Blueprint
                </span>
                <h2 className="mt-4 font-display text-3xl font-bold text-white leading-tight">
                    How PARAGON Verification Works
                </h2>
            </div>

            <div className="relative grid gap-8 md:grid-cols-3 md:gap-12">
                {/* Horizontal timeline line for desktop screens */}
                <div className="hidden md:block absolute top-[20px] left-8 right-8 h-px bg-white/5 -z-10" />

                {steps.map((s, i) => (
                    <div key={i} className="flex flex-col text-left space-y-4 group relative">
                        {/* Step Marker */}
                        <div className="flex items-center gap-3">
                            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/10 bg-[#0a0e1a] font-display text-sm font-black text-[#5ca336] transition-all duration-300 group-hover:border-[#5ca336]/40 group-hover:bg-[#5ca336]/5">
                                {s.num}
                            </span>
                            {/* Line connecting steps on mobile */}
                            <span className="h-px flex-1 bg-white/5 md:hidden" />
                        </div>
                        
                        <div>
                            <h3 className="text-base font-bold text-white tracking-tight">
                                {s.title}
                            </h3>
                            <p className="mt-2 text-xs leading-relaxed text-[#94A3B8]">
                                {s.desc}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}



function PricingComparisonMatrix() {
    const ref = useRef<HTMLDivElement>(null);
    const inView = useInView(ref, { once: true, margin: '-80px' });

    const tiers = [
        {
            key: 'foundation',
            label: 'Foundation',
            desc: 'Early-stage roadmap',
            base_price: 350,
            gate_fee: 150,
            qualify: '65+ score',
            hours: 'Email support',
            focus: '7-pillar radar chart & gap analysis',
            redeem: 'No',
            featured: false,
        },
        {
            key: 'growth',
            label: 'Growth',
            desc: 'Seed round prep',
            base_price: 750,
            gate_fee: 150,
            qualify: '70+ score',
            hours: '5 analyst hours',
            focus: 'Cap table audit & financial stress-test',
            redeem: 'No',
            featured: true,
        },
        {
            key: 'institutional',
            label: 'Institutional',
            desc: 'Series A/B SME',
            base_price: 1500,
            gate_fee: 150,
            qualify: '80+ score',
            hours: '15 analyst hours',
            focus: 'Secure diligence URL & warrant credit model',
            redeem: 'Yes (Fully credited)',
            featured: false,
        },
    ];

    const rows = [
        { name: 'Program Goal', key: 'desc' },
        { name: 'Qualification Gate', key: 'qualify' },
        { name: 'Base Pricing', key: 'base_price', format: (val: number) => `$${val}` },
        { name: 'Gate Fee', key: 'gate_fee', format: (val: number) => `$${val}` },
        { name: 'Forensic Analyst Hours', key: 'hours' },
        { name: 'Diligence Scope', key: 'focus' },
        { name: 'Success Credit Model', key: 'redeem' },
    ];

    return (
        <section ref={ref} className="mt-28 w-full border-t border-white/[0.06] pt-20">
            <div className="text-center max-w-2xl mx-auto mb-16">
                <span className="text-[10px] font-black uppercase tracking-[0.22em] text-white/40">
                    Programs & Pricing
                </span>
                <h2 className="mt-4 font-display text-3xl font-bold text-white leading-tight">
                    Verification Comparison Matrix
                </h2>
                <p className="mt-4 text-sm leading-relaxed text-[#94A3B8]">
                    Compare program scopes and baseline requirements. All formal verification cycles require passing the initial diagnostic gate.
                </p>
            </div>

            {/* Desktop Table View */}
            <div className="hidden md:block overflow-hidden rounded-xl border border-white/5 bg-[#161c28]">
                <table className="w-full text-left border-collapse text-sm">
                    <thead>
                        <tr className="border-b border-white/5 bg-[#0a0e1a]/40">
                            <th className="p-6 text-xs font-black uppercase tracking-widest text-white/30 w-[25%]">Diligence Metrics</th>
                            {tiers.map((t) => (
                                <th
                                    key={t.key}
                                    className={cn(
                                        "p-6 w-[25%] relative",
                                        t.featured && "bg-[#5ca336]/5"
                                    )}
                                >
                                    <div className="flex items-center justify-between">
                                        <span className="font-display text-base font-bold text-white">{t.label}</span>
                                        {t.featured && (
                                            <span className="rounded-sm bg-[#5ca336] px-1.5 py-0.5 text-[8px] font-black uppercase tracking-widest text-white leading-none">
                                                Featured
                                            </span>
                                        )}
                                    </div>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {rows.map((row, ri) => (
                            <tr key={ri} className="border-b border-white/5 last:border-0 hover:bg-white/[0.01] transition-colors">
                                <td className="p-6 text-xs font-bold uppercase tracking-wider text-white/40">{row.name}</td>
                                {tiers.map((t) => {
                                    const rawVal = t[row.key as keyof typeof t];
                                    const displayVal = row.format ? row.format(rawVal as number) : rawVal;
                                    return (
                                        <td
                                            key={t.key}
                                            className={cn(
                                                "p-6 text-white/70",
                                                t.featured && "bg-[#5ca336]/5",
                                                row.key === 'base_price' && "font-display text-lg font-bold text-white",
                                                row.key === 'redeem' && rawVal === 'Yes (Fully credited)' && "text-[#5ca336] font-bold"
                                            )}
                                        >
                                            {displayVal}
                                        </td>
                                    );
                                })}
                            </tr>
                        ))}
                        <tr className="bg-[#0a0e1a]/20">
                            <td className="p-6 text-xs font-bold uppercase tracking-wider text-white/40">Action</td>
                            {tiers.map((t) => (
                                <td
                                    key={t.key}
                                    className={cn(
                                        "p-6",
                                        t.featured && "bg-[#5ca336]/5"
                                    )}
                                >
                                    <Link
                                        href={route('diagnostic.index')}
                                        className={cn(
                                            "group inline-flex w-full items-center justify-center gap-1.5 rounded-md py-3 text-xs font-bold uppercase tracking-widest transition-all duration-200 outline-none border",
                                            t.featured
                                                ? "bg-[#5ca336] text-white hover:bg-[#5ca336]/90 border-white/5"
                                                : "bg-[#0c121d] border-[#2F4587]/30 text-[#91A7D8] hover:bg-[#2F4587]/10 hover:border-[#2F4587]/50 hover:text-white"
                                        )}
                                    >
                                        Qualify
                                        <ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
                                    </Link>
                                </td>
                            ))}
                        </tr>
                    </tbody>
                </table>
            </div>

            {/* Mobile Stack View */}
            <div className="grid gap-6 md:hidden">
                {tiers.map((t) => (
                    <div
                        key={t.key}
                        className={cn(
                            "rounded-xl border bg-[#161c28] p-6 text-left space-y-4",
                            t.featured ? "border-[#5ca336]/40 shadow-[0_0_24px_rgba(92,163,54,0.06)]" : "border-white/5"
                        )}
                    >
                        <div className="flex items-center justify-between">
                            <h3 className="font-display text-base font-bold text-white">{t.label}</h3>
                            {t.featured && (
                                <span className="rounded-sm bg-[#5ca336] px-1.5 py-0.5 text-[8px] font-black uppercase tracking-widest text-white">
                                    Featured
                                </span>
                            )}
                        </div>

                        <div className="divide-y divide-white/5 text-xs">
                            {rows.map((row, ri) => {
                                const rawVal = t[row.key as keyof typeof t];
                                const displayVal = row.format ? row.format(rawVal as number) : rawVal;
                                return (
                                    <div key={ri} className="flex justify-between py-2.5">
                                        <span className="text-white/40 font-semibold uppercase tracking-wider text-[9px]">{row.name}</span>
                                        <span className={cn(
                                            "text-white/70 text-right pl-4",
                                            row.key === 'base_price' && "font-display font-bold text-white text-sm"
                                        )}>
                                            {displayVal}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>

                        <div className="pt-2">
                            <Link
                                href={route('diagnostic.index')}
                                className={cn(
                                    "group flex w-full items-center justify-center gap-1.5 rounded-md py-3 text-xs font-bold uppercase tracking-widest transition-all duration-200 outline-none border",
                                    t.featured
                                        ? "bg-[#5ca336] text-white hover:bg-[#5ca336]/90 border-white/5"
                                        : "bg-[#0c121d] border-[#2F4587]/30 text-[#91A7D8] hover:bg-[#2F4587]/10 hover:border-[#2F4587]/50 hover:text-white"
                                )}
                            >
                                Start Diagnostic
                                <ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
                            </Link>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}

function FaqSection() {
    const ref = useRef<HTMLDivElement>(null);
    const inView = useInView(ref, { once: true, margin: '-80px' });
    const [activeIndex, setActiveIndex] = useState<number | null>(null);

    const faqs = [
        {
            q: "What is the PARAGON Model?",
            a: "PARAGON is Pinpoint's proprietary venture diligence framework auditing startups across 7 core pillars: Potential, Agility, Risk, Alignment, Governance, Operations, and Network. It translates operational metrics and corporate structures into a single standardized score trusted by institutional VCs."
        },
        {
            q: "How does the diagnostic scoring work?",
            a: "The diagnostic is a 7-pillar self-assessment. Scoring is calculated dynamically based on baseline risk levels and operational depth. A qualifying score of 65+ (Investment Ready or Top Percentile) qualifies you to enter the formal audit queue and secure verification badges."
        },
        {
            q: "Why is there a $150 Gate Fee?",
            a: "To maintain high data room integrity for our institutional investor network, we charge a $150 entry fee. This fee ensures serious applications and directly funds the manual analyst hours required to review and verify your initial diagnostic uploads."
        },
        {
            q: "How long does the verification audit take?",
            a: "Typically, verification is completed within 5 to 7 business days. Once your diagnostic is complete and you choose your audit tier, our investment team begins forensic reviews of your cap table, corporate registers, and financial accounts."
        },
        {
            q: "How do investors access my verification page?",
            a: "Your verification profile is live on a custom secure URL. Key metrics and badges are visible to verified network investors, but detailed diligence assets (e.g., contracts, models) remain locked. Investors must submit an access request, which you approve or reject from your dashboard."
        },
        {
            q: "What is the success guarantee on Tier 3?",
            a: "For our Institutional audit, the $1,500 fee is credited back to you upon the successful close of a funding round via the PIN Network. This aligns our interests with your success, and our compensation is tied to a standard 2% equity warrant."
        }
    ];

    const toggle = (idx: number) => {
        setActiveIndex(activeIndex === idx ? null : idx);
    };

    return (
        <section ref={ref} className="mt-28 w-full border-t border-white/[0.06] pt-20">
            <div className="text-center max-w-2xl mx-auto mb-16">
                <span className="text-[10px] font-black uppercase tracking-[0.22em] text-white/40">
                    Frequently Asked Questions
                </span>
                <h2 className="mt-4 font-display text-3xl font-bold text-white leading-tight">
                    Everything You Need to Know
                </h2>
            </div>

            <div className="mx-auto max-w-3xl divide-y divide-white/5">
                {faqs.map((faq, i) => {
                    const isOpen = activeIndex === i;
                    return (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 12 }}
                            animate={inView ? { opacity: 1, y: 0 } : {}}
                            transition={{ duration: 0.4, delay: i * 0.05 }}
                            className="py-5 text-left"
                        >
                            <button
                                type="button"
                                onClick={() => toggle(i)}
                                className="flex w-full items-start justify-between text-left focus:outline-none py-2"
                            >
                                <div className="flex gap-4 sm:gap-6 items-start">
                                    <span className="font-mono text-xs font-bold text-white/30 pt-1">
                                        {String(i + 1).padStart(2, '0')}
                                    </span>
                                    <span className="font-display text-sm sm:text-base font-bold text-white tracking-tight leading-snug">
                                        {faq.q}
                                    </span>
                                </div>
                                <span className="ml-6 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/[0.02] text-white/40 transition-transform duration-300">
                                    <ChevronDown className={cn("h-3.5 w-3.5 transition-transform duration-300", isOpen && "rotate-180 text-white")} />
                                </span>
                            </button>

                            <AnimatePresence initial={false}>
                                {isOpen && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0, marginTop: 0 }}
                                        animate={{ height: "auto", opacity: 1, marginTop: 12 }}
                                        exit={{ height: 0, opacity: 0, marginTop: 0 }}
                                        transition={{ duration: 0.25, ease: "easeInOut" }}
                                        className="overflow-hidden"
                                    >
                                        <p className="text-xs sm:text-sm leading-relaxed text-white/50 pl-8 sm:pl-10 mt-3 pr-8">
                                            {faq.a}
                                        </p>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    );
                })}
            </div>
        </section>
    );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function Waitlist({ selectedAudience, founderStages, investorRoles, founderStatus, investorStatus, diagnosticSession }: PageProps) {
    const { auth } = usePage<any>().props;
    const config = selectedAudience ? AUDIENCES[selectedAudience] : null;
    const status = selectedAudience === 'founder' ? founderStatus : investorStatus;
    const [legalModal, setLegalModal] = useState<{ title: string; content: string } | null>(null);

    return (
        <>
            <Head title={config ? config.label : 'Join the Waitlist'} />

            <div className="relative min-h-screen overflow-x-hidden bg-background">
                <div className="waitlist-shell pointer-events-none fixed inset-0 z-0" />

                <div className="relative mx-auto max-w-6xl px-4 pb-16 pt-8 sm:px-6 md:px-8 md:pt-10">
                    {/* Logo */}
                    <motion.div
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="mb-2 flex items-center gap-3"
                    >
                        <Link href={route('waitlist.index')} className="flex items-center outline-none">
                            <img src="/pinpoint-logo.png" alt="Pinpoint" className="h-8 w-auto md:h-10" />
                        </Link>
                    </motion.div>

                    <AnimatePresence mode="wait">
                        {/* ── Landing view ── */}
                        {!config && (
                            <motion.main
                                key="landing"
                                initial="hidden"
                                animate="show"
                                exit={{ opacity: 0, y: -16, transition: { duration: 0.25 } }}
                                variants={stagger}
                                className="pt-16 md:pt-24"
                            >
                                {/* Hero */}
                                <motion.section variants={fadeUp} className="relative mx-auto max-w-3xl text-center">
                                    <div className="pointer-events-none absolute left-1/2 top-1/2 -z-10 aspect-square w-[60vw] max-w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#2F4587]/5 blur-[120px]" />
                                    <motion.div variants={fadeUp} className="flex justify-center">
                                        <div className="mx-auto inline-flex max-w-[85vw] items-center justify-center rounded-[2rem] border border-white/[0.08] bg-white/[0.03] px-5 py-2.5 backdrop-blur-sm sm:max-w-none sm:rounded-full">
                                            <span className="text-center text-[9px] font-semibold uppercase leading-tight tracking-[0.15em] text-white/70 sm:text-[11px] sm:tracking-[0.3em]">
                                                Spring 2026 Now accepting early access
                                            </span>
                                        </div>
                                    </motion.div>

                                    <AnimatedHeadline />

                                    <motion.div variants={fadeUp} className="mx-auto mt-6 flex justify-center">
                                        <span className="h-px w-24 bg-white/10" />
                                    </motion.div>

                                    <motion.p variants={fadeUp} className="mx-auto mt-6 max-w-xl text-base leading-[1.85] text-white/65 md:text-[17px]">
                                        The first institutional-grade verification platform for the 2026 venture ecosystem. Stop&nbsp;guessing. Start&nbsp;proving.
                                    </motion.p>

                                    {/* Action Buttons: Dynamic CTA */}
                                    <motion.div variants={fadeUp} className="mt-8 flex flex-wrap justify-center gap-4">
                                        {auth?.founder ? (
                                            <Link
                                                href={route('founder.dashboard')}
                                                className="group relative flex items-center justify-center gap-2 rounded-md bg-[#5ca336] px-6 py-3.5 text-xs font-bold uppercase tracking-[0.2em] text-white transition-all duration-200 hover:bg-[#5ca336]/90 border border-white/5 shadow-none"
                                            >
                                                Go to Founder Dashboard
                                                <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
                                            </Link>
                                        ) : (auth?.user && (auth.user.role === 'superadmin' || auth.user.role === 'analyst' || auth.user.role === 'support')) ? (
                                            <Link
                                                href={route('admin.dashboard')}
                                                className="group relative flex items-center justify-center gap-2 rounded-md bg-[#5ca336] px-6 py-3.5 text-xs font-bold uppercase tracking-[0.2em] text-white transition-all duration-200 hover:bg-[#5ca336]/90 border border-white/5 shadow-none"
                                            >
                                                Go to Admin Dashboard
                                                <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
                                            </Link>
                                        ) : diagnosticSession ? (
                                            <>
                                                {diagnosticSession.score_band === 'mid_high' ? (
                                                    <Link
                                                        href={route('checkout.index')}
                                                        className="group relative flex items-center justify-center gap-2 rounded-md bg-[#5ca336] px-6 py-3.5 text-xs font-bold uppercase tracking-[0.2em] text-white transition-all duration-200 hover:bg-[#5ca336]/90 border border-white/5 shadow-none"
                                                    >
                                                        Proceed to Certification
                                                        <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
                                                    </Link>
                                                ) : diagnosticSession.score_band === 'high' ? (
                                                    <Link
                                                        href={route('founder.setup')}
                                                        className="group relative flex items-center justify-center gap-2 rounded-md bg-[#5ca336] px-6 py-3.5 text-xs font-bold uppercase tracking-[0.2em] text-white transition-all duration-200 hover:bg-[#5ca336]/90 border border-white/5 shadow-none"
                                                    >
                                                        Fast-Track Audit Setup
                                                        <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
                                                    </Link>
                                                ) : (
                                                    <Link
                                                        href={route('diagnostic.result')}
                                                        className="group relative flex items-center justify-center gap-2 rounded-md bg-[#5ca336] px-6 py-3.5 text-xs font-bold uppercase tracking-[0.2em] text-white transition-all duration-200 hover:bg-[#5ca336]/90 border border-white/5 shadow-none"
                                                    >
                                                        View Diagnostic Results
                                                        <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
                                                    </Link>
                                                )}
                                                <Link
                                                    href={route('diagnostic.result')}
                                                    className="group flex items-center justify-center gap-2 rounded-md border border-[#2F4587]/30 bg-[#0c121d] px-6 py-3.5 text-xs font-bold uppercase tracking-[0.2em] text-[#91A7D8] transition-all duration-200 hover:bg-[#2F4587]/10 hover:border-[#2F4587]/50 hover:text-white"
                                                >
                                                    Score: {diagnosticSession.score}/100
                                                </Link>
                                            </>
                                        ) : (
                                            <>
                                                <Link
                                                    href={route('diagnostic.index')}
                                                    className="group relative flex items-center justify-center gap-2 rounded-md bg-[#5ca336] px-6 py-3.5 text-xs font-bold uppercase tracking-[0.2em] text-white transition-all duration-200 hover:bg-[#5ca336]/90 border border-white/5 shadow-none"
                                                >
                                                    Take PARAGON Diagnostic
                                                    <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
                                                </Link>
                                                <a
                                                    href="#who-are-you"
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        document.getElementById('who-are-you')?.scrollIntoView({ behavior: 'smooth' });
                                                    }}
                                                    className="group flex items-center justify-center gap-2 rounded-md border border-[#2F4587]/30 bg-[#0c121d] px-6 py-3.5 text-xs font-bold uppercase tracking-[0.2em] text-[#91A7D8] transition-all duration-200 hover:bg-[#2F4587]/10 hover:border-[#2F4587]/50 hover:text-white"
                                                >
                                                    Join Waitlist
                                                </a>
                                            </>
                                        )}
                                    </motion.div>
                                </motion.section>

                                {/* Product Mockup Showcase */}
                                <motion.div
                                    variants={fadeUp}
                                    className="mt-16 mx-auto max-w-4xl overflow-hidden rounded-xl border border-white/10 shadow-[0_24px_80px_rgba(0,0,0,0.5)] bg-[#0a0e1a]"
                                >
                                    <img
                                        src="/diligence_dashboard_mockup.png"
                                        alt="Pinpoint Venture Diligence Room Mockup"
                                        className="w-full h-auto object-cover opacity-95 transition-opacity duration-300 hover:opacity-100"
                                        loading="lazy"
                                    />
                                </motion.div>

                                <AudienceTrackSelector />

                                {/* PARAGON section */}
                                <ParagonPillarsSection />

                                {/* New Editorial Sections */}
                                <ProcessSection />
                                <PricingComparisonMatrix />
                                <FaqSection />

                                {/* Quote */}
                                <TypewriterQuote />
                            </motion.main>
                        )}

                        {/* ── Form view ── */}
                        {config && (
                            <motion.main
                                key={`form-${config.slug}`}
                                initial={{ opacity: 0, x: 24, filter: 'blur(6px)' }}
                                animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
                                exit={{ opacity: 0, x: -24, filter: 'blur(6px)' }}
                                transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                                className="pt-10 md:pt-14"
                            >
                                {/* Single back link — no redundant "track selection" language */}
                                <Link
                                    href={route('waitlist.index')}
                                    className="group mb-8 inline-flex items-center gap-2 rounded-2xl border border-white/[0.08] bg-white/[0.03] px-4 py-2.5 text-sm font-medium text-white/55 backdrop-blur-sm transition-all duration-200 hover:border-white/15 hover:bg-white/[0.06] hover:text-white/80"
                                >
                                    <ChevronLeft className="h-4 w-4 transition-transform duration-200 group-hover:-translate-x-0.5" />
                                    Back
                                </Link>

                                <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
                                    <FormPanel config={config} founderStages={founderStages} investorRoles={investorRoles} status={status} />
                                    <SupportPanel config={config} />
                                </div>
                            </motion.main>
                        )}
                    </AnimatePresence>

                    {/* ── Footer ── */}
                    <footer className="mt-28 border-t border-white/[0.06] pt-12 pb-6">
                        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
                            <div className="space-y-2">
                                <p className="text-[12px] text-white/30">
                                    © {new Date().getFullYear()} Pinpoint Launchpad. All rights reserved.
                                </p>
                                <div className="flex flex-wrap gap-x-4 gap-y-1">
                                    <button
                                        type="button"
                                        onClick={() => setLegalModal({
                                            title: 'Terms & Conditions',
                                            content: 'These terms govern your use of the Pinpoint Launchpad waitlist and readiness assessment program. By signing up, you agree to receive program updates, checklists, and cohort announcements.\n\nAll diagnostic feedback is advisory. Pinpoint Launchpad does not guarantee investment, funding, or specific outcomes. Capital raising involves high risks, and all financial metrics provided by users are subject to independent forensic validation.'
                                        })}
                                        className="text-[12px] text-white/45 transition-colors hover:text-white/80 outline-none"
                                    >
                                        Terms & Conditions
                                    </button>
                                    <span className="text-[12px] text-white/20">•</span>
                                    <button
                                        type="button"
                                        onClick={() => setLegalModal({
                                            title: 'Privacy Policy',
                                            content: 'Your privacy is critical to us. We collect email addresses, company names, and growth stage inputs to evaluate waitlist eligibility and send relevant PARAGON Diagnostic information.\n\nWe do not sell, rent, or distribute your personal or startup information to third-party brokers. Data shared with institutional investors is subject to explicit consent and NDA boundaries.'
                                        })}
                                        className="text-[12px] text-white/45 transition-colors hover:text-white/80 outline-none"
                                    >
                                        Privacy Policy
                                    </button>
                                </div>
                            </div>

                            {/* Social Media Links */}
                            <div className="flex items-center gap-4">
                                <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="group flex h-9 w-9 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.02] text-white/45 transition-all duration-200 hover:border-white/15 hover:bg-white/[0.05] hover:text-white/80" aria-label="LinkedIn">
                                    <Linkedin className="h-4 w-4" />
                                </a>
                                <a href="https://x.com" target="_blank" rel="noopener noreferrer" className="group flex h-9 w-9 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.02] text-white/45 transition-all duration-200 hover:border-white/15 hover:bg-white/[0.05] hover:text-white/80" aria-label="Twitter (X)">
                                    <Twitter className="h-4 w-4" />
                                </a>
                                <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="group flex h-9 w-9 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.02] text-white/45 transition-all duration-200 hover:border-white/15 hover:bg-white/[0.05] hover:text-white/80" aria-label="Facebook">
                                    <Facebook className="h-4 w-4" />
                                </a>
                            </div>
                        </div>
                    </footer>

                    {/* ── Legal Modal ── */}
                    <AnimatePresence>
                        {legalModal && (
                            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    onClick={() => setLegalModal(null)}
                                    className="absolute inset-0 bg-black/80 backdrop-blur-md"
                                />
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.95, y: 16 }}
                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95, y: 16 }}
                                    transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                                    className="relative z-10 w-full max-w-lg overflow-hidden rounded-[2rem] border border-white/[0.08] bg-[#0c0c0c] p-8 shadow-[0_0_80px_rgba(0,0,0,0.95)]"
                                >
                                    <h3 className="font-display text-xl font-semibold text-white">
                                        {legalModal.title}
                                    </h3>
                                    <div className="mt-4 max-h-[300px] overflow-y-auto text-sm leading-relaxed text-white/50 pr-2">
                                        <p className="whitespace-pre-line">{legalModal.content}</p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setLegalModal(null)}
                                        className="group relative mt-8 flex w-full items-center justify-center gap-2 overflow-hidden rounded-xl bg-white/[0.04] border border-white/[0.08] px-5 py-3 text-[13px] font-bold uppercase tracking-[0.18em] text-white outline-none transition-all duration-200 hover:bg-white/[0.08] hover:border-white/15"
                                    >
                                        Close
                                    </button>
                                </motion.div>
                            </div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </>
    );
}
