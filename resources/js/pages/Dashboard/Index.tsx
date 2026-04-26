import { Head } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { CheckCircle, Clock, FileText, Mail, Shield, Sparkles } from 'lucide-react';

const ease = [0.16, 1, 0.3, 1] as [number, number, number, number];

const fadeUp = (delay = 0) => ({
    initial:    { opacity: 0, y: 16, filter: 'blur(4px)' },
    animate:    { opacity: 1, y: 0,  filter: 'blur(0px)' },
    transition: { duration: 0.5, ease, delay },
});

interface PageProps {
    tier:        string;
    amount_paid: number;
    signed_at:   string | null;
    email:       string | null;
}

export default function DashboardIndex({ tier, amount_paid, signed_at, email }: PageProps) {
    const NEXT_STEPS = [
        {
            icon:  <Mail className="size-4 text-blue-400" />,
            label: 'Confirmation sent',
            body:  'Your signed agreement has been emailed to your inbox.',
        },
        {
            icon:  <Clock className="size-4 text-amber-400" />,
            label: 'Analyst assigned',
            body:  'An analyst will reach out within 2–3 business days to begin your audit.',
        },
        {
            icon:  <Shield className="size-4 text-emerald-400" />,
            label: 'PARAGON Certification',
            body:  'Your certification is issued upon successful audit completion.',
        },
    ];

    return (
        <div className="relative min-h-screen bg-[#050505] text-white antialiased">
            <Head title="You're In — PARAGON Certification" />

            {/* Background */}
            <div className="waitlist-shell pointer-events-none fixed inset-0 z-0" />
            <div className="waitlist-grid  pointer-events-none fixed inset-0 z-0" />
            <div
                className="pointer-events-none absolute inset-x-0 top-0 z-0 h-80"
                style={{ background: 'radial-gradient(ellipse 80% 50% at 50% 0%, rgba(16,185,129,0.12) 0%, transparent 100%)' }}
            />

            <div className="relative z-10 mx-auto max-w-2xl px-4 py-16 sm:px-6 sm:py-24">

                {/* Logo */}
                <motion.div {...fadeUp(0)} className="mb-14 flex justify-center">
                    <img
                        src="/pinpoint-logo.png"
                        alt="Pinpoint"
                        className="block h-7 w-auto select-none"
                        style={{ maxWidth: 150 }}
                    />
                </motion.div>

                {/* ── Hero confirmation ── */}
                <motion.div {...fadeUp(0.08)} className="mb-10 text-center">
                    {/* Animated check */}
                    <div className="mb-6 flex justify-center">
                        <motion.div
                            initial={{ scale: 0.5, opacity: 0 }}
                            animate={{ scale: 1,   opacity: 1 }}
                            transition={{ duration: 0.5, ease, delay: 0.15 }}
                            className="flex h-16 w-16 items-center justify-center rounded-full border border-emerald-500/30 bg-emerald-500/10"
                            style={{ boxShadow: '0 0 60px rgba(16,185,129,0.15)' }}
                        >
                            <CheckCircle className="size-8 text-emerald-400" strokeWidth={1.5} />
                        </motion.div>
                    </div>

                    <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.26em] text-emerald-400/70">
                        Agreement Confirmed
                    </p>
                    <h1 className="font-display text-3xl font-semibold leading-tight tracking-tight text-white sm:text-4xl">
                        You're in.
                    </h1>
                    <p className="mx-auto mt-3 max-w-md text-[14px] leading-relaxed text-white/40">
                        Your Pinpoint Investment Warrant has been signed and your PARAGON audit has been queued.
                    </p>
                </motion.div>

                {/* ── Details grid ── */}
                <motion.div {...fadeUp(0.18)} className="mb-8 grid gap-3 sm:grid-cols-2">
                    <div className="rounded-2xl border border-white/[0.07] bg-white/[0.03] p-5">
                        <p className="mb-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-white/30">
                            Audit Tier
                        </p>
                        <div className="flex items-center gap-2">
                            <Sparkles className="size-4 text-blue-400" strokeWidth={1.5} />
                            <p className="text-[17px] font-semibold text-white">{tier} Audit</p>
                        </div>
                    </div>

                    <div className="rounded-2xl border border-white/[0.07] bg-white/[0.03] p-5">
                        <p className="mb-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-white/30">
                            Amount Paid
                        </p>
                        <div className="flex items-center gap-2">
                            <FileText className="size-4 text-emerald-400" strokeWidth={1.5} />
                            <p className="text-[17px] font-semibold text-white">
                                ${Number(amount_paid).toLocaleString()} USD
                            </p>
                        </div>
                    </div>

                    {email && (
                        <div className="rounded-2xl border border-white/[0.07] bg-white/[0.03] p-5">
                            <p className="mb-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-white/30">
                                Email
                            </p>
                            <p className="truncate text-[14px] font-medium text-white/70">{email}</p>
                        </div>
                    )}

                    {signed_at && (
                        <div className="rounded-2xl border border-white/[0.07] bg-white/[0.03] p-5">
                            <p className="mb-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-white/30">
                                Signed
                            </p>
                            <p className="text-[14px] font-medium text-white/70">
                                {new Date(signed_at).toLocaleString(undefined, {
                                    dateStyle: 'medium',
                                    timeStyle: 'short',
                                })}
                            </p>
                        </div>
                    )}
                </motion.div>

                {/* ── What's next ── */}
                <motion.div
                    {...fadeUp(0.26)}
                    className="rounded-2xl border border-white/[0.07] bg-white/[0.03] p-6"
                >
                    <p className="mb-5 text-[10px] font-bold uppercase tracking-[0.22em] text-white/30">
                        What happens next
                    </p>
                    <div className="flex flex-col gap-5">
                        {NEXT_STEPS.map(({ icon, label, body }, i) => (
                            <motion.div
                                key={label}
                                initial={{ opacity: 0, x: -8 }}
                                animate={{ opacity: 1,  x:  0 }}
                                transition={{ duration: 0.4, ease, delay: 0.3 + i * 0.08 }}
                                className="flex items-start gap-3.5"
                            >
                                <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-white/[0.07] bg-white/[0.03]">
                                    {icon}
                                </div>
                                <div>
                                    <p className="text-[13px] font-semibold text-white/80">{label}</p>
                                    <p className="mt-0.5 text-[12px] leading-relaxed text-white/38">{body}</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>

                {/* Support line */}
                <motion.p {...fadeUp(0.38)} className="mt-7 text-center text-[11px] text-white/22">
                    Questions?{' '}
                    <a
                        href="mailto:support@pinpointlaunchpad.com"
                        className="text-white/38 underline underline-offset-2 transition-colors hover:text-white/60"
                    >
                        support@pinpointlaunchpad.com
                    </a>
                </motion.p>

            </div>
        </div>
    );
}
