import { Head, router } from '@inertiajs/react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Clock, Mail, MailCheck, Send } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

import { cn } from '@/lib/utils';

const ease = [0.16, 1, 0.3, 1] as [number, number, number, number];
const MAX_ATTEMPTS = 40; // 40 × 3s = 2 min

// Animated protocol ring
function ProtocolRing() {
    return (
        <div className="relative flex h-24 w-24 items-center justify-center">
            <motion.div
                className="absolute inset-0 rounded-full border-2 border-[#4468BB]/10"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
            />
            <motion.div
                className="absolute inset-0 rounded-full border-t-2 border-r-2 border-[#4468BB]"
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            />
            <motion.div
                className="absolute inset-4 rounded-full border border-[#4468BB]/20"
                animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.6, 0.3] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            />
            <div className="relative z-10 flex h-12 w-12 items-center justify-center rounded-full bg-[#1B294B]/20 ring-1 ring-[#232C43]">
                <Send className="size-5 text-[#576FA8]" />
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
    const [status, setStatus]   = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
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
                className="inline-flex items-center gap-2 rounded-lg border border-[#232C43] bg-[#101623] px-4 py-2.5 text-[12px] font-semibold text-[#576FA8] transition-all hover:border-[#4468BB]/40 hover:text-[#ECF0F9] disabled:cursor-not-allowed disabled:opacity-40"
            >
                {status === 'sending' && <span className="size-3.5 animate-spin rounded-full border-2 border-[#4468BB] border-t-transparent" />}
                {status === 'sent'    && <span className="text-emerald-400">✓</span>}
                {status === 'sending' ? 'Sending…'
                    : status === 'sent' ? 'Email sent!'
                    : status === 'error' ? 'Failed — try again'
                    : cooldown > 0 ? `Resend in ${cooldown}s`
                    : 'Resend setup email'}
            </button>
        </div>
    );
}

// ── Confirmed / "check your email" screen
function ConfirmedScreen({
    signer_email, tier_label, amount_paid, signed_at 
}: { 
    signer_email?: string; 
    tier_label?: string; 
    amount_paid?: string; 
    signed_at?: string;
}) {
    return (
        <div className="min-h-screen overflow-y-auto bg-[#050505] text-white antialiased">
            <Head title="Agreement Confirmed — PARAGON Certification" />
            <div className="waitlist-shell pointer-events-none fixed inset-0 z-0" />
            <div className="waitlist-grid  pointer-events-none fixed inset-0 z-0" />
            <div
                className="pointer-events-none fixed inset-x-0 top-0 z-0 h-96"
                style={{ background: 'radial-gradient(ellipse 70% 50% at 50% 0%, rgba(68,104,187,0.15) 0%, transparent 100%)' }}
            />

            <div className="relative z-10 mx-auto flex w-full max-w-[440px] flex-col items-center px-6 py-16 text-center lg:py-24">
                {/* Logo */}
                <div className="mb-10">
                    <img src="/pinpoint-logo.png" alt="Pinpoint" className="block h-6 w-auto opacity-50 transition-opacity hover:opacity-100" style={{ maxWidth: 130 }} />
                </div>

                {/* Main Success Card */}
                <motion.div
                    className="w-full overflow-hidden rounded-[2.5rem] border border-[#232C43] bg-[#101623] p-8 shadow-2xl sm:p-10"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.55, ease }}
                >
                    <div className="mb-7 flex justify-center">
                        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#1B294B]/20 ring-1 ring-[#232C43]">
                            <MailCheck className="size-8 text-[#4468BB]" strokeWidth={1.5} />
                        </div>
                    </div>

                    <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.22em] text-[#576FA8]">
                        Agreement Confirmed
                    </p>
                    <h1 className="font-display mb-4 text-2xl font-semibold tracking-tight text-[#ECF0F9]">
                        You're in.
                    </h1>
                    <p className="mb-8 text-[14px] leading-relaxed text-[#788CBA]">
                        Your Pinpoint Investment Warrant has been signed and your PARAGON audit has been queued.
                    </p>

                    {/* Receipt Details */}
                    <div className="mb-10 space-y-4 rounded-2xl border border-[#232C43] bg-[#080B11] p-6 text-left">
                        {[
                            { label: 'Audit Tier', value: tier_label },
                            { label: 'Amount Paid', value: amount_paid },
                            { label: 'Email', value: signer_email },
                            { label: 'Signed', value: signed_at },
                        ].map((item) => (
                            <div key={item.label} className="flex flex-col gap-1">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-[#576FA8]">
                                    {item.label}
                                </span>
                                <span className="text-[13px] font-medium text-[#ECF0F9]">
                                    {item.value || '—'}
                                </span>
                            </div>
                        ))}
                    </div>

                    {/* What happens next */}
                    <div className="space-y-6 text-left">
                        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#576FA8]">What happens next</p>
                        {[
                            { title: 'Confirmation sent', text: 'Your signed agreement has been emailed to your inbox.' },
                            { title: 'Analyst assigned', text: 'An analyst will reach out within 2–3 business days to begin your audit.' },
                            { title: 'PARAGON Certification', text: 'Your certification is issued upon successful audit completion.' },
                        ].map((s, idx) => (
                            <div key={idx} className="flex items-start gap-4">
                                <div className="mt-1 flex size-1.5 shrink-0 rounded-full bg-[#4468BB]" />
                                <div className="space-y-1">
                                    <p className="text-[13px] font-bold text-[#ECF0F9]">{s.title}</p>
                                    <p className="text-[12px] leading-relaxed text-[#788CBA]">{s.text}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </motion.div>

                {/* Final CTA — account not yet created; setup invite sent by email */}
                <motion.div
                    className="mt-10 w-full"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                >
                    {/* Check your email card */}
                    <div
                        className="w-full rounded-2xl border border-[#232C43] bg-[#080B11] p-6 text-center"
                        style={{ boxShadow: '0 0 40px rgba(68,104,187,0.08)' }}
                    >
                        <div className="mb-4 flex justify-center">
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#1B294B]/30 ring-1 ring-[#232C43]">
                                <Mail className="size-5 text-[#4468BB]" strokeWidth={1.5} />
                            </div>
                        </div>
                        <p className="mb-1 text-[12px] font-bold uppercase tracking-[0.18em] text-[#576FA8]">
                            One more step
                        </p>
                        <p className="mb-3 text-[15px] font-semibold text-[#ECF0F9]">
                            Check your inbox
                        </p>
                        <p className="text-[13px] leading-relaxed text-[#788CBA]">
                            We've sent a secure account setup link to{' '}
                            <span className="font-medium text-[#ECF0F9]">{signer_email}</span>.
                            {' '}Open that email to create your password and access your dashboard.
                        </p>

                        {/* Resend invite */}
                        <ResendInviteButton email={signer_email} />
                    </div>

                    <p className="mt-6 text-[11px] text-[#576FA8]/40">
                        Questions?{' '}
                        <a href="mailto:support@pinpointlaunchpad.com" className="text-[#4468BB] hover:underline">
                            support@pinpointlaunchpad.com
                        </a>
                    </p>
                </motion.div>
            </div>
        </div>
    );
}

export default function OnboardingVerifying({
    signature_verified, signer_email, tier_label, amount_paid, signed_at 
}: { 
    signature_verified: boolean; 
    signer_email?: string;
    tier_label?: string;
    amount_paid?: string;
    signed_at?: string;
}) {
    const [attempts,  setAttempts]  = useState(0);
    const [timedOut,  setTimedOut]  = useState(false);
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
        return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
    }, [confirmed, attempts]);

    if (confirmed) {
        return (
            <ConfirmedScreen 
                signer_email={signer_email} 
                tier_label={tier_label}
                amount_paid={amount_paid}
                signed_at={signed_at}
            />
        );
    }

    return (
        <div className="fixed inset-0 flex flex-col items-center justify-center bg-[#050505] text-white antialiased">
            <Head title="Verifying Signature — PARAGON Certification" />

            <div className="waitlist-shell pointer-events-none absolute inset-0 z-0" />
            <div className="waitlist-grid  pointer-events-none absolute inset-0 z-0" />
            <div
                className="pointer-events-none absolute inset-x-0 top-0 z-0 h-96"
                style={{ background: timedOut
                    ? 'radial-gradient(ellipse 70% 50% at 50% 0%, rgba(245,158,11,0.12) 0%, transparent 100%)'
                    : 'radial-gradient(ellipse 70% 50% at 50% 0%, rgba(68,104,187,0.15) 0%, transparent 100%)'
                }}
            />

            <div className="relative z-10 flex w-full max-w-sm flex-col items-center px-6 text-center">
                <div className="mb-12">
                    <img src="/pinpoint-logo.png" alt="Pinpoint" className="block h-6 w-auto opacity-50" style={{ maxWidth: 130 }} />
                </div>

                <AnimatePresence mode="wait">
                    {timedOut ? (
                        <motion.div
                            key="timeout"
                            className="w-full rounded-[2rem] border border-[#232C43] bg-[#101623] p-8 shadow-2xl sm:p-10"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                        >
                            <div className="mb-7 flex justify-center">
                                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#1B294B]/20 ring-1 ring-[#232C43]">
                                    <Clock className="size-8 text-amber-400" strokeWidth={1.5} />
                                </div>
                            </div>

                            <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.22em] text-amber-500/60">
                                Network Latency
                            </p>
                            <h1 className="font-display mb-3 text-xl font-semibold text-[#ECF0F9]">
                                Still confirming
                            </h1>
                            <p className="mb-8 text-[13px] leading-relaxed text-[#788CBA]">
                                Our system is awaiting BoldSign confirmation. This occasionally takes an extra minute.
                            </p>

                            <div className="flex flex-col gap-3">
                                <button
                                    onClick={() => { setTimedOut(false); setAttempts(0); }}
                                    className="group flex w-full items-center justify-center gap-2 rounded-xl bg-[#4468BB] py-3 text-[13px] font-bold uppercase tracking-[0.14em] text-white transition-all hover:bg-[#3b5ba5]"
                                    style={{ boxShadow: '0 0 28px rgba(68,104,187,0.3)' }}
                                >
                                    Check Again
                                    <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
                                </button>
                                <a
                                    href="mailto:hello@pinpointlaunchpad.com"
                                    className="py-2 text-[12px] text-[#576FA8] hover:text-[#ECF0F9]"
                                >
                                    Contact Support
                                </a>
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="verifying"
                            className="w-full rounded-[2rem] border border-[#232C43] bg-[#101623] p-8 shadow-2xl sm:p-10"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                        >
                            <div className="mb-8 flex justify-center">
                                <ProtocolRing />
                            </div>

                            <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.24em] text-[#4468BB]">
                                Protocol
                            </p>
                            <h1 className="font-display mb-6 text-2xl font-semibold tracking-tight text-[#ECF0F9]">
                                Finalizing
                            </h1>

                            <div className="space-y-4 text-left">
                                {PROTOCOL_STEPS.map((step, idx) => {
                                    const isActive = idx === Math.min(Math.floor(attempts / 2), PROTOCOL_STEPS.length - 1);
                                    const isDone   = idx < Math.min(Math.floor(attempts / 2), PROTOCOL_STEPS.length - 1);

                                    return (
                                        <div key={step.id} className="flex items-center gap-3">
                                            <div className={cn(
                                                "h-2 w-2 rounded-full ring-2 ring-offset-2 ring-offset-[#101623] transition-all duration-500",
                                                isDone ? "bg-[#4468BB] ring-[#4468BB]/30" :
                                                isActive ? "bg-white animate-pulse ring-white/20" :
                                                "bg-[#232C43] ring-transparent"
                                            )} />
                                            <p className={cn(
                                                "text-[12px] font-medium transition-colors duration-500",
                                                isDone ? "text-[#ECF0F9]" :
                                                isActive ? "text-[#ECF0F9]" :
                                                "text-[#576FA8]"
                                            )}>
                                                {step.label}
                                            </p>
                                        </div>
                                    );
                                })}
                            </div>

                            <p className="mt-10 text-[11px] text-[#576FA8]/60">
                                This process is automated. Please keep this session active.
                            </p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
