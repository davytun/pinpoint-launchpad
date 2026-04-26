import { ParagonRadarChart } from '@/components/ParagonRadarChart';
import { cn } from '@/lib/utils';
import { Head, Link, useForm } from '@inertiajs/react';
import { AnimatePresence, motion, useInView, useReducedMotion, useScroll, useSpring } from 'framer-motion';
import {
    ArrowRight,
    CheckCircle2,
    ChevronDown,
    ChevronLeft,
    Landmark,
    Rocket,
    ShieldCheck,
    Sparkles,
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
        badge: 'bg-[#3C53A8] text-white',
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
        accent: '#3C53A8',
        glowColor: 'rgba(60,83,168,0.14)',
        cardBorderHover: 'hover:border-[#3C53A8]/30 hover:shadow-[0_0_70px_rgba(60,83,168,0.1)]',
        glowClass: 'from-[#3C53A8]/20 via-[#3C53A8]/5 to-transparent',
        iconClass: 'text-[#3C53A8]',
        focusRingClass: 'focus:ring-[#3C53A8]/15 focus:border-[#3C53A8]/50',
        selectActiveClass: 'bg-[#3C53A8]/10 text-white',
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

// ─── Scroll progress bar ──────────────────────────────────────────────────────

function ScrollProgressBar() {
    const { scrollYProgress } = useScroll();
    const scaleX = useSpring(scrollYProgress, { stiffness: 200, damping: 30, restDelta: 0.001 });
    return (
        <motion.div
            style={{ scaleX, transformOrigin: '0%' }}
            className="fixed top-0 left-0 right-0 z-[100] h-[2px]"
            aria-hidden="true"
        >
            <div className="h-full w-full" style={{ background: 'linear-gradient(90deg, #5ca336 0%, #3c53a8 100%)' }} />
        </motion.div>
    );
}

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
                        ? 'inline-block text-white/50'
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

function ParagonSection() {
    const ref = useRef<HTMLDivElement>(null);
    const inView = useInView(ref, { once: true, margin: '-80px' });

    return (
        <motion.section
            ref={ref}
            initial={{ opacity: 0, y: 40, filter: 'blur(6px)' }}
            animate={inView ? { opacity: 1, y: 0, filter: 'blur(0px)' } : {}}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
            className="mt-24 flex flex-col items-center text-center"
        >
            <span className="inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.04] px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.28em] text-white/50 backdrop-blur-sm">
                <span className="h-1.5 w-1.5 rounded-full bg-[#3C53A8]" />
                The PARAGON Model
            </span>

            <motion.h2
                initial={{ opacity: 0, y: 16 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.55, delay: 0.15, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
                className="mt-6 font-display text-3xl font-semibold leading-tight tracking-tight text-white md:text-4xl"
            >
                Seven pillars. One verdict.
            </motion.h2>

            <motion.p
                initial={{ opacity: 0, y: 12 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.55, delay: 0.25, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
                className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-white/45"
            >
                Our proprietary PARAGON model audits your venture across 7 critical pillars from IP Governance to Unit Economics. It's the credential that turns a "Maybe" into a "Yes".
            </motion.p>

            <motion.div
                initial={{ opacity: 0, scale: 0.96 }}
                animate={inView ? { opacity: 1, scale: 1 } : {}}
                transition={{ duration: 0.7, delay: 0.35, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
                className="waitlist-radar relative mt-12 w-full max-w-2xl"
            >
                <div className="pointer-events-none absolute left-1/2 top-1/2 -z-10 h-[60%] w-[60%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-tr from-[#5CA336]/20 to-[#3C53A8]/20 blur-[60px]" />
                <ParagonRadarChart />
            </motion.div>
        </motion.section>
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

// ─── Audience card (landing) ──────────────────────────────────────────────────

const MotionLink = motion.create(Link);

function AudienceCard({ config }: { config: AudienceConfig }) {
    const { Icon } = config;

    return (
        <MotionLink
            variants={fadeUp}
            href={route('waitlist.index', { audience: config.slug })}
            className={cn(
                'waitlist-card group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-white/[0.07] p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] transition-all duration-500 md:rounded-[1.75rem] md:p-10',
                config.cardBorderHover,
            )}
        >
            <div
                className="pointer-events-none absolute inset-x-0 top-0 h-[2px] opacity-60 transition-opacity duration-500 group-hover:opacity-100"
                style={{ background: `linear-gradient(90deg, transparent, ${config.accent}, transparent)` }}
            />
            <div
                className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full blur-[80px] opacity-30 transition-opacity duration-700 group-hover:opacity-70"
                style={{ background: `radial-gradient(circle, ${config.glowColor}, transparent 70%)` }}
            />
            <Icon
                className={cn('pointer-events-none absolute -bottom-8 -right-8 h-56 w-56 opacity-[0.03] transition-all duration-500 group-hover:opacity-[0.06] group-hover:-translate-x-1 group-hover:-translate-y-1', config.iconClass)}
                strokeWidth={0.6}
            />

            <div className="relative">
                <span className={cn('inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-[10px] font-bold uppercase tracking-[0.28em]', config.badge, config.badgeGlow)}>
                    {config.label}
                </span>

                <h2 className="mt-6 font-display text-[1.75rem] font-semibold leading-[1.2] tracking-tight text-white md:text-[2rem]">
                    {config.title}
                </h2>
                <p className="mt-3.5 text-[15px] leading-[1.75] text-white/40 transition-colors duration-300 group-hover:text-white/60">
                    {config.lead}
                </p>

                <div className="mt-7 flex items-start gap-3 border-t border-white/[0.05] pt-5">
                    <div
                        className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md"
                        style={{ backgroundColor: `${config.accent}22` }}
                    >
                        <ShieldCheck className="h-3 w-3" style={{ color: config.accent }} />
                    </div>
                    <p className="text-[13px] leading-relaxed text-white/45 transition-colors duration-300 group-hover:text-white/60">
                        {config.perk}
                    </p>
                </div>
            </div>

            <div className="relative mt-8 flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-[0.24em] text-white/20 transition-colors duration-300 group-hover:text-white/45">
                    Get started
                </span>
                <div
                    className="flex h-10 w-10 items-center justify-center rounded-full transition-all duration-300 group-hover:translate-x-1 group-hover:scale-105"
                    style={{ backgroundColor: config.accent, boxShadow: `0 0 20px ${config.accent}55` }}
                >
                    <ArrowRight className="h-4 w-4 text-white" />
                </div>
            </div>
        </MotionLink>
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
            <div
                className="pointer-events-none absolute inset-x-0 top-0 h-px"
                style={{ background: `linear-gradient(90deg, transparent, ${config.accent}60, transparent)` }}
            />

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

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function Waitlist({ selectedAudience, founderStages, investorRoles, founderStatus, investorStatus }: PageProps) {
    const config = selectedAudience ? AUDIENCES[selectedAudience] : null;
    const status = selectedAudience === 'founder' ? founderStatus : investorStatus;

    return (
        <>
            <Head title={config ? config.label : 'Join the Waitlist'} />

            <ScrollProgressBar />

            <div className="relative min-h-screen overflow-x-hidden bg-[#050505]">
                <div className="waitlist-shell pointer-events-none fixed inset-0 z-0" />
                <div className="waitlist-grid pointer-events-none fixed inset-0 z-0" />
                <div className="waitlist-wireframe pointer-events-none absolute -left-[15%] top-[15%] z-0 aspect-square w-[110vw] max-w-[600px] opacity-40 mix-blend-overlay md:-left-[5%] md:top-[20%]" />
                <div className="waitlist-wireframe waitlist-float-delay pointer-events-none absolute -right-[15%] top-[40%] z-0 aspect-square w-[90vw] max-w-[500px] opacity-30 mix-blend-overlay md:-right-[5%] md:top-[45%]" />

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
                                    <div className="pointer-events-none absolute left-1/2 top-1/2 -z-10 aspect-square w-[50vw] max-w-[400px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#5CA336]/10 blur-[80px] md:blur-[100px]" />
                                    <div className="pointer-events-none absolute left-1/2 top-1/2 -z-10 aspect-square w-[30vw] max-w-[300px] -translate-x-1/2 translate-y-[20%] rounded-full bg-[#3C53A8]/15 blur-[60px] md:blur-[80px]" />
                                    <motion.div variants={fadeUp} className="flex justify-center">
                                        <div className="mx-auto inline-flex max-w-[85vw] items-center justify-center rounded-[2rem] border border-white/[0.08] bg-white/[0.03] px-5 py-2.5 backdrop-blur-sm sm:max-w-none sm:rounded-full">
                                            <span className="text-center text-[9px] font-semibold uppercase leading-tight tracking-[0.15em] text-white/40 sm:text-[11px] sm:tracking-[0.3em]">
                                                Spring 2026 Now accepting early access
                                            </span>
                                        </div>
                                    </motion.div>

                                    <AnimatedHeadline />

                                    <motion.div variants={fadeUp} className="mx-auto mt-6 flex justify-center">
                                        <span className="h-px w-24 bg-gradient-to-r from-[#5ca336]/40 via-white/10 to-[#3c53a8]/40" />
                                    </motion.div>

                                    <motion.p variants={fadeUp} className="mx-auto mt-6 max-w-xl text-base leading-[1.85] text-white/40 md:text-[17px]">
                                        The first institutional-grade verification platform for the 2026 venture ecosystem. Stop&nbsp;guessing. Start&nbsp;proving.
                                    </motion.p>
                                </motion.section>

                                {/* Section label */}
                                <motion.div variants={fadeUp} className="mt-16 mb-6 flex items-center gap-4">
                                    <span className="h-px flex-1 bg-gradient-to-r from-white/10 to-transparent" />
                                    <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/20">Who are you?</span>
                                    <span className="h-px flex-1 bg-gradient-to-l from-white/10 to-transparent" />
                                </motion.div>

                                {/* Brief framing so users understand why they're choosing */}
                                <motion.p variants={fadeUp} className="mb-8 text-center text-sm text-white/30">
                                    Pinpoint serves two distinct audiences each with a tailored experience.
                                </motion.p>

                                <motion.section variants={stagger} className="grid gap-4 lg:grid-cols-2">
                                    <AudienceCard config={AUDIENCES.founder} />
                                    <AudienceCard config={AUDIENCES.investor} />
                                </motion.section>

                                {/* PARAGON section */}
                                <ParagonSection />

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
                </div>
            </div>
        </>
    );
}
