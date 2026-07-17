import { Head, router } from '@inertiajs/react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, Clock, Mail, MailCheck, Send } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

import DiagnosticLayout from '@/layouts/diagnostic-layout';
import { cn } from '@/lib/utils';

const ease = [0.16, 1, 0.3, 1] as [number, number, number, number];
const MAX_ATTEMPTS = 40; // 40 × 3s = 2 min

// Animated protocol ring
function ProtocolRing() {
    return (
        <div className="relative flex h-24 w-24 items-center justify-center">
            <motion.div className="absolute inset-0 rounded-full border-2 border-[#3A54A5]/10" initial={{ opacity: 0 }} animate={{ opacity: 1 }} />
            <motion.div
                className="absolute inset-0 rounded-full border-t-2 border-r-2 border-[#3A54A5]"
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            />
            <motion.div
                className="absolute inset-4 rounded-full border border-[#3A54A5]/20"
                animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.6, 0.3] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            />
            <div className="relative z-10 flex h-12 w-12 items-center justify-center rounded-full border border-[#3A54A5]/25 bg-[#3A54A5]/10">
                <Send className="size-5 text-[#3A54A5]" />
            </div>
        </div>
    );
}

const PROTOCOL_STEPS = [
    { id: 'recording', label: 'Recording signature' },
    { id: 'encrypting', label: 'Encrypting agreement' },
    { id: 'securing', label: 'Securing legal chain' },
    { id: 'provisioning', label: 'Provisioning dashboard' },
];

// ── Resend invite button with cooldown
function ResendInviteButton({ email }: { email?: string }) {
    const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
    const [cooldown, setCooldown] = useState(0);

    useEffect(() => {
        if (cooldown <= 0) return;
        const t = setInterval(() => setCooldown((c) => c - 1), 1000);
        return () => clearInterval(t);
    }, [cooldown]);

    async function handleResend() {
        if (!email || status === 'sending' || cooldown > 0) return;
        setStatus('sending');
        try {
            const res = await fetch('/onboarding/resend-invite', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content ?? '',
                },
                body: JSON.stringify({ email }),
            });
            if (res.ok) {
                setStatus('sent');
                setCooldown(60);
                setTimeout(() => setStatus('idle'), 4000);
            } else {
                setStatus('error');
                setTimeout(() => setStatus('idle'), 3000);
            }
        } catch {
            setStatus('error');
            setTimeout(() => setStatus('idle'), 3000);
        }
    }

    return (
        <div className="mt-5">
            <button
                onClick={handleResend}
                disabled={status === 'sending' || cooldown > 0}
                className="inline-flex items-center gap-2 rounded-lg border border-zinc-200 bg-white px-4 py-2.5 text-[12px] font-semibold text-zinc-700 shadow-xs transition-all hover:border-zinc-300 hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
                {status === 'sending' && <span className="size-3.5 animate-spin rounded-full border-2 border-[#3A54A5] border-t-transparent" />}
                {status === 'sent' && <span className="text-emerald-500">✓</span>}
                {status === 'sending'
                    ? 'Sending…'
                    : status === 'sent'
                      ? 'Email sent!'
                      : status === 'error'
                        ? 'Failed — try again'
                        : cooldown > 0
                          ? `Resend in ${cooldown}s`
                          : 'Resend setup email'}
            </button>
        </div>
    );
}

// ── Confirmed / "check your email" screen
function ConfirmedScreen({
    signer_email,
    tier_label,
    amount_paid,
    signed_at,
    setup_url,
}: {
    signer_email?: string;
    tier_label?: string;
    amount_paid?: string;
    signed_at?: string;
    setup_url?: string;
}) {
    return (
        <DiagnosticLayout glowColor="#3A54A5" hideWordmark>
            <Head title="Agreement Confirmed — PARAGON Certification" />

            <div className="relative z-10 mx-auto flex w-full max-w-[440px] flex-col items-center px-6 py-16 text-center lg:py-24">
                {/* Logo */}
                <div className="mb-10">
                    <img
                        src="/pinpoint-logo.png"
                        alt="Pinpoint"
                        className="block h-6 w-auto opacity-75 transition-opacity hover:opacity-100"
                        style={{ maxWidth: 130 }}
                    />
                </div>

                {/* Main Success Card */}
                <motion.div
                    className="w-full overflow-hidden rounded-[2.5rem] border border-white/80 bg-white/30 p-8 shadow-[0_8px_30px_rgba(0,0,0,0.025)] backdrop-blur-md sm:p-10"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.55, ease }}
                >
                    <div className="mb-7 flex justify-center">
                        <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-[#3A54A5]/25 bg-[#3A54A5]/10">
                            <MailCheck className="size-8 text-[#3A54A5]" strokeWidth={1.5} />
                        </div>
                    </div>

                    <p className="mb-2 text-[10px] font-bold tracking-[0.22em] text-[#3A54A5] uppercase">Agreement Confirmed</p>
                    <h1 className="font-display mb-4 text-2xl font-extrabold tracking-tight text-zinc-950">You're in.</h1>
                    <p className="text-zinc-650 mb-8 text-[14px] leading-relaxed">
                        Your Pinpoint Investment Warrant has been signed and your PARAGON audit has been queued.
                    </p>

                    {/* Receipt Details */}
                    <div className="mb-10 space-y-4 rounded-2xl border border-zinc-200 bg-zinc-50/50 p-6 text-left">
                        {[
                            { label: 'Audit Tier', value: tier_label },
                            { label: 'Amount Paid', value: amount_paid },
                            { label: 'Email', value: signer_email },
                            { label: 'Signed', value: signed_at },
                        ].map((item) => (
                            <div key={item.label} className="flex flex-col gap-1">
                                <span className="text-[10px] font-bold tracking-wider text-zinc-400 uppercase">{item.label}</span>
                                <span className="text-[13px] font-medium text-zinc-800">{item.value || '—'}</span>
                            </div>
                        ))}
                    </div>

                    {/* What happens next */}
                    <div className="space-y-6 text-left">
                        <p className="text-[10px] font-bold tracking-[0.18em] text-zinc-500 uppercase">What happens next</p>
                        {[
                            { title: 'Confirmation sent', text: 'Your signed agreement has been emailed to your inbox.' },
                            { title: 'Analyst assigned', text: 'An analyst will reach out within 2–3 business days to begin your audit.' },
                            { title: 'PARAGON Certification', text: 'Your certification is issued upon successful audit completion.' },
                        ].map((s, idx) => (
                            <div key={idx} className="flex items-start gap-4">
                                <div className="mt-1.5 flex size-1.5 shrink-0 rounded-full bg-[#3A54A5]" />
                                <div className="space-y-1">
                                    <p className="text-zinc-850 text-[13px] font-bold">{s.title}</p>
                                    <p className="text-zinc-550 text-[12px] leading-relaxed">{s.text}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </motion.div>

                {/* Final CTA */}
                <motion.div className="mt-10 w-full" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
                    {setup_url ? (
                        <div
                            className="w-full rounded-2xl border border-zinc-200 bg-white/70 p-6 text-center shadow-xs"
                            style={{ boxShadow: '0 8px 32px rgba(58,84,165,0.03)' }}
                        >
                            <div className="mb-4 flex justify-center">
                                <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-[#3A54A5]/20 bg-[#3A54A5]/10">
                                    <ArrowRight className="size-5 text-[#3A54A5]" strokeWidth={1.5} />
                                </div>
                            </div>
                            <p className="mb-1 text-[12px] font-bold tracking-[0.18em] text-[#3A54A5] uppercase">Complete Setup</p>
                            <p className="mb-3 text-[15px] font-extrabold text-zinc-950">Create your account</p>
                            <p className="text-zinc-650 mb-6 text-[13px] leading-relaxed">
                                Set up your secure password to access your PARAGON Audit dashboard immediately.
                            </p>
                            <a
                                href={setup_url}
                                className="group flex w-full items-center justify-center gap-2 rounded-xl bg-[#3A54A5] py-3.5 text-[13px] font-bold tracking-[0.14em] text-white uppercase transition-all hover:bg-[#2D4182]"
                                style={{ boxShadow: '0 4px 14px rgba(58,84,165,0.25)' }}
                            >
                                Create Account
                                <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
                            </a>
                        </div>
                    ) : (
                        /* Check your email card */
                        <div
                            className="w-full rounded-2xl border border-zinc-200 bg-white/70 p-6 text-center shadow-xs"
                            style={{ boxShadow: '0 8px 32px rgba(58,84,165,0.03)' }}
                        >
                            <div className="mb-4 flex justify-center">
                                <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-[#3A54A5]/20 bg-[#3A54A5]/10">
                                    <Mail className="size-5 text-[#3A54A5]" strokeWidth={1.5} />
                                </div>
                            </div>
                            <p className="mb-1 text-[12px] font-bold tracking-[0.18em] text-[#3A54A5] uppercase">One more step</p>
                            <p className="mb-3 text-[15px] font-extrabold text-zinc-950">Check your inbox</p>
                            <p className="text-zinc-650 text-[13px] leading-relaxed">
                                We've sent a secure account setup link to <span className="font-semibold text-zinc-950">{signer_email}</span>. Open
                                that email to create your password and access your dashboard.
                            </p>

                            {/* Resend invite */}
                            <ResendInviteButton email={signer_email} />
                        </div>
                    )}

                    <p className="mt-6 text-[11px] text-zinc-400">
                        Questions?{' '}
                        <a href="mailto:support@pinpointlaunchpad.com" className="text-[#3A54A5] hover:underline">
                            support@pinpointlaunchpad.com
                        </a>
                    </p>
                </motion.div>
            </div>
        </DiagnosticLayout>
    );
}

export default function OnboardingVerifying({
    signature_verified,
    signer_email,
    tier_label,
    amount_paid,
    signed_at,
    setup_url,
}: {
    signature_verified: boolean;
    signer_email?: string;
    tier_label?: string;
    amount_paid?: string;
    signed_at?: string;
    setup_url?: string;
}) {
    const [attempts, setAttempts] = useState(0);
    const [timedOut, setTimedOut] = useState(false);
    const [confirmed, setConfirmed] = useState(signature_verified);
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

    useEffect(() => {
        if (confirmed) return;
        if (attempts >= MAX_ATTEMPTS) {
            setTimedOut(true);
            return;
        }
        intervalRef.current = setInterval(() => {
            setAttempts((p) => p + 1);
            router.reload({
                only: ['signature_verified'],
                onSuccess: (page) => {
                    if ((page.props as unknown as { signature_verified: boolean }).signature_verified) {
                        if (intervalRef.current) clearInterval(intervalRef.current);
                        setConfirmed(true);
                    }
                },
            });
        }, 3000);
        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, [confirmed, attempts]);

    if (confirmed) {
        return (
            <ConfirmedScreen
                signer_email={signer_email}
                tier_label={tier_label}
                amount_paid={amount_paid}
                signed_at={signed_at}
                setup_url={setup_url}
            />
        );
    }

    return (
        <DiagnosticLayout glowColor={timedOut ? '#F59E0B' : '#3A54A5'} hideWordmark>
            <Head title="Verifying Signature — PARAGON Certification" />

            <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-6 py-12 text-center">
                <div className="mb-12">
                    <img src="/pinpoint-logo.png" alt="Pinpoint" className="block h-6 w-auto opacity-75" style={{ maxWidth: 130 }} />
                </div>

                <AnimatePresence mode="wait">
                    {timedOut ? (
                        <motion.div
                            key="timeout"
                            className="w-full max-w-sm overflow-hidden rounded-[2.5rem] border border-white/80 bg-white/30 p-8 shadow-[0_8px_30px_rgba(0,0,0,0.025)] backdrop-blur-md sm:p-10"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                        >
                            <div className="mb-7 flex justify-center">
                                <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-amber-200 bg-amber-50">
                                    <Clock className="text-amber-650 size-8" strokeWidth={1.5} />
                                </div>
                            </div>

                            <p className="mb-2 text-[10px] font-bold tracking-[0.22em] text-amber-600 uppercase">Network Latency</p>
                            <h1 className="font-display mb-3 text-xl font-extrabold text-zinc-950">Still confirming</h1>
                            <p className="text-zinc-650 mb-8 text-[13px] leading-relaxed">
                                Our system is awaiting BoldSign confirmation. This occasionally takes an extra minute.
                            </p>

                            <div className="flex flex-col gap-3">
                                <button
                                    onClick={() => {
                                        setTimedOut(false);
                                        setAttempts(0);
                                    }}
                                    className="group flex w-full items-center justify-center gap-2 rounded-xl bg-[#3A54A5] py-3 text-[13px] font-bold tracking-[0.14em] text-white uppercase transition-all hover:bg-[#2D4182]"
                                    style={{ boxShadow: '0 4px 14px rgba(58,84,165,0.25)' }}
                                >
                                    Check Again
                                    <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
                                </button>
                                <a
                                    href="mailto:hello@pinpointlaunchpad.com"
                                    className="py-2 text-[12px] font-semibold text-[#3A54A5] hover:text-[#2D4182]"
                                >
                                    Contact Support
                                </a>
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="verifying"
                            className="w-full max-w-sm overflow-hidden rounded-[2.5rem] border border-white/80 bg-white/30 p-8 shadow-[0_8px_30px_rgba(0,0,0,0.025)] backdrop-blur-md sm:p-10"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                        >
                            <div className="mb-8 flex justify-center">
                                <ProtocolRing />
                            </div>

                            <p className="mb-2 text-[10px] font-bold tracking-[0.24em] text-[#3A54A5] uppercase">Protocol</p>
                            <h1 className="font-display mb-6 text-2xl font-extrabold tracking-tight text-zinc-950">Finalizing</h1>

                            <div className="space-y-4 text-left">
                                {PROTOCOL_STEPS.map((step, idx) => {
                                    const isActive = idx === Math.min(Math.floor(attempts / 2), PROTOCOL_STEPS.length - 1);
                                    const isDone = idx < Math.min(Math.floor(attempts / 2), PROTOCOL_STEPS.length - 1);

                                    return (
                                        <div key={step.id} className="flex items-center gap-3">
                                            <div
                                                className={cn(
                                                    'h-2 w-2 rounded-full ring-2 ring-offset-2 ring-offset-white transition-all duration-500',
                                                    isDone
                                                        ? 'bg-[#3A54A5] ring-[#3A54A5]/30'
                                                        : isActive
                                                          ? 'animate-pulse bg-[#3A54A5] ring-[#3A54A5]/25'
                                                          : 'bg-zinc-200 ring-transparent',
                                                )}
                                            />
                                            <p
                                                className={cn(
                                                    'text-[12px] font-medium transition-colors duration-500',
                                                    isDone ? 'font-medium text-zinc-900' : isActive ? 'font-bold text-zinc-900' : 'text-zinc-400',
                                                )}
                                            >
                                                {step.label}
                                            </p>
                                        </div>
                                    );
                                })}
                            </div>

                            <p className="mt-10 text-[11px] text-zinc-400">This process is automated. Please keep this session active.</p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </DiagnosticLayout>
    );
}
