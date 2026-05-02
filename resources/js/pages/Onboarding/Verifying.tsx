import { Head, router } from '@inertiajs/react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Clock, Mail, MailCheck, RefreshCw, Send } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

const ease = [0.16, 1, 0.3, 1] as [number, number, number, number];
const MAX_ATTEMPTS  = 40; // 40 × 3s = 2 min
const MAX_REMINDERS = 2;

// Animated ring spinner
function RingSpinner() {
    return (
        <div className="relative flex h-20 w-20 items-center justify-center">
            <motion.div
                className="absolute inset-0 rounded-full border-2 border-transparent"
                style={{ borderTopColor: 'rgba(37,99,235,0.6)', borderRightColor: 'rgba(37,99,235,0.15)' }}
                animate={{ rotate: 360 }}
                transition={{ duration: 2.4, repeat: Infinity, ease: 'linear' }}
            />
            <motion.div
                className="absolute inset-[6px] rounded-full border-2 border-transparent"
                style={{ borderTopColor: 'rgba(92,163,54,0.7)', borderLeftColor: 'rgba(92,163,54,0.15)' }}
                animate={{ rotate: -360 }}
                transition={{ duration: 1.6, repeat: Infinity, ease: 'linear' }}
            />
            <div
                className="h-2.5 w-2.5 rounded-full"
                style={{ background: 'radial-gradient(circle, #60A5FA 0%, rgba(37,99,235,0.4) 100%)' }}
            />
        </div>
    );
}

function PulseRow({ attempts }: { attempts: number }) {
    return (
        <div className="flex items-center gap-1.5">
            {[0, 1, 2].map((i) => (
                <motion.div
                    key={i}
                    className="h-1 w-1 rounded-full bg-blue-500"
                    animate={{ opacity: [0.2, 1, 0.2], scale: [0.8, 1.2, 0.8] }}
                    transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2, ease: 'easeInOut' }}
                />
            ))}
            <span className="ml-1 font-mono text-[10px] text-white/20">
                {attempts > 0 ? `check ${attempts}` : 'waiting'}
            </span>
        </div>
    );
}

// ── Confirmed / "check your email" screen ──
function ConfirmedScreen({ signer_email }: { signer_email?: string }) {
    const [remindersLeft, setRemindersLeft] = useState(MAX_REMINDERS);
    const [sending,       setSending]       = useState(false);
    const [lastSent,      setLastSent]      = useState<string | null>(null);
    const [error,         setError]         = useState<string | null>(null);

    async function handleResend() {
        if (sending || remindersLeft <= 0) return;
        setSending(true);
        setError(null);
        try {
            const csrfToken = decodeURIComponent(
                document.cookie.split('; ').find((c) => c.startsWith('XSRF-TOKEN='))?.split('=').slice(1).join('=') ?? ''
            );
            const res = await fetch('/onboarding/resend-invite', {
                method:  'POST',
                headers: { 'X-XSRF-TOKEN': csrfToken, 'Accept': 'application/json', 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: signer_email }),
            });
            if (!res.ok) throw new Error('Failed to resend.');
            setRemindersLeft((n) => n - 1);
            setLastSent(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
        } catch {
            setError('Could not resend right now. Please try again shortly.');
        } finally {
            setSending(false);
        }
    }

    const exhausted = remindersLeft <= 0;

    return (
        <div className="min-h-screen overflow-y-auto bg-[#050505] text-white antialiased">
            <Head title="Agreement Signed — PARAGON Certification" />
            <div className="waitlist-shell pointer-events-none fixed inset-0 z-0" />
            <div className="waitlist-grid  pointer-events-none fixed inset-0 z-0" />
            <div
                className="pointer-events-none fixed inset-x-0 top-0 z-0 h-72"
                style={{ background: 'radial-gradient(ellipse 70% 50% at 50% 0%, rgba(110,190,68,0.14) 0%, transparent 100%)' }}
            />

            <motion.div
                className="relative z-10 mx-auto flex w-full max-w-sm flex-col items-center px-6 py-16 text-center"
                initial={{ opacity: 0, y: 20, filter: 'blur(8px)' }}
                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                transition={{ duration: 0.55, ease }}
            >
                <img src="/pinpoint-logo.png" alt="Pinpoint" className="mb-12 block h-6 w-auto select-none opacity-60" style={{ maxWidth: 130 }} />

                <motion.div
                    initial={{ scale: 0.7, opacity: 0 }}
                    animate={{ scale: 1,   opacity: 1 }}
                    transition={{ duration: 0.5, ease }}
                    className="mb-7 flex h-16 w-16 items-center justify-center rounded-full border border-emerald-500/25 bg-emerald-500/10"
                    style={{ boxShadow: '0 0 48px rgba(110,190,68,0.15)' }}
                >
                    <MailCheck className="size-8 text-emerald-400" strokeWidth={1.5} />
                </motion.div>

                <p className="mb-1.5 text-[10px] font-bold uppercase tracking-[0.22em] text-emerald-500/70">
                    Agreement Confirmed
                </p>
                <h1 className="font-display mb-4 text-[22px] font-semibold tracking-tight text-white">
                    Check your email
                </h1>
                <p className="mb-2 text-[13px] leading-relaxed text-white/50">
                    We've sent a setup link to
                </p>
                {signer_email && (
                    <p className="mb-6 rounded-lg border border-white/[0.07] bg-white/[0.04] px-4 py-2 font-mono text-[13px] text-white/80">
                        {signer_email}
                    </p>
                )}
                <p className="mb-8 text-[13px] leading-relaxed text-white/40">
                    Click the link in that email to create your password and access your PARAGON dashboard. The link expires in 48 hours.
                </p>

                {/* Steps */}
                <div className="mb-8 w-full rounded-2xl border border-white/[0.06] bg-white/[0.02] px-5 py-4 text-left">
                    <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.18em] text-white/25">What happens next</p>
                    <div className="space-y-3">
                        {[
                            { n: '01', text: 'Open the email from Pinpoint Launchpad' },
                            { n: '02', text: 'Click "Set up your account" to create a password' },
                            { n: '03', text: 'Log in and upload your audit documents' },
                        ].map((s) => (
                            <div key={s.n} className="flex items-start gap-3">
                                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-white/[0.08] bg-white/[0.03] text-[9px] font-bold text-white/30">
                                    {s.n}
                                </span>
                                <p className="text-[12px] leading-relaxed text-white/45">{s.text}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Resend section */}
                <div className="w-full rounded-2xl border border-white/[0.06] bg-white/[0.02] px-5 py-4 text-left">
                    <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.18em] text-white/25">
                        Didn't receive the email?
                    </p>
                    <p className="mb-4 text-[12px] leading-relaxed text-white/35">
                        Check your spam folder first. If it's not there, you can request a reminder
                        {remindersLeft < MAX_REMINDERS
                            ? ` (${remindersLeft} ${remindersLeft === 1 ? 'reminder' : 'reminders'} left)`
                            : ` up to ${MAX_REMINDERS} times`}.
                    </p>

                    <AnimatePresence mode="wait">
                        {lastSent && (
                            <motion.p
                                key="sent-notice"
                                initial={{ opacity: 0, y: -4 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0 }}
                                className="mb-3 flex items-center gap-1.5 text-[11px] text-emerald-400/70"
                            >
                                <MailCheck className="size-3.5 shrink-0" />
                                Reminder sent at {lastSent}
                            </motion.p>
                        )}
                        {error && (
                            <motion.p
                                key="error-notice"
                                initial={{ opacity: 0, y: -4 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0 }}
                                className="mb-3 text-[11px] text-red-400/70"
                            >
                                {error}
                            </motion.p>
                        )}
                    </AnimatePresence>

                    {!exhausted ? (
                        <button
                            onClick={handleResend}
                            disabled={sending}
                            className="group flex w-full items-center justify-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.04] py-2.5 text-[12px] font-semibold text-white/60 transition-all hover:border-white/[0.14] hover:bg-white/[0.07] hover:text-white/80 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {sending ? (
                                <RefreshCw className="size-3.5 animate-spin" />
                            ) : (
                                <Send className="size-3.5 transition-transform group-hover:translate-x-0.5" />
                            )}
                            {sending ? 'Sending…' : 'Resend setup email'}
                        </button>
                    ) : (
                        <p className="text-[11px] text-white/25">
                            You've used all available reminders.
                        </p>
                    )}
                </div>

                {/* Support */}
                <p className="mt-6 text-[11px] text-white/20">
                    Still nothing? Email us at{' '}
                    <a
                        href="mailto:hello@pinpointlaunchpad.com"
                        className="underline underline-offset-2 transition-colors hover:text-white/40"
                    >
                        hello@pinpointlaunchpad.com
                    </a>{' '}
                    and we'll sort it out manually.
                </p>
            </motion.div>
        </div>
    );
}

export default function OnboardingVerifying({ signature_verified, signer_email }: { signature_verified: boolean; signer_email?: string }) {
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
        return <ConfirmedScreen signer_email={signer_email} />;
    }

    return (
        <div className="fixed inset-0 flex flex-col items-center justify-center bg-[#050505] text-white antialiased">
            <Head title="Verifying Signature — PARAGON Certification" />

            <div className="waitlist-shell pointer-events-none absolute inset-0 z-0" />
            <div className="waitlist-grid  pointer-events-none absolute inset-0 z-0" />
            <div
                className="pointer-events-none absolute inset-x-0 top-0 z-0 h-72"
                style={{ background: timedOut
                    ? 'radial-gradient(ellipse 70% 50% at 50% 0%, rgba(245,158,11,0.12) 0%, transparent 100%)'
                    : 'radial-gradient(ellipse 70% 50% at 50% 0%, rgba(37,99,235,0.14) 0%, transparent 100%)'
                }}
            />

            <motion.div
                key={timedOut ? 'timeout' : 'verifying'}
                className="relative z-10 flex w-full max-w-sm flex-col items-center px-6 text-center"
                initial={{ opacity: 0, y: 20, filter: 'blur(8px)' }}
                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                transition={{ duration: 0.55, ease }}
            >
                <img
                    src="/pinpoint-logo.png"
                    alt="Pinpoint"
                    className="mb-12 block h-6 w-auto select-none opacity-60"
                    style={{ maxWidth: 130 }}
                />

                {timedOut ? (
                    <>
                        <div
                            className="mb-7 flex h-16 w-16 items-center justify-center rounded-full border border-amber-500/25 bg-amber-500/8"
                            style={{ boxShadow: '0 0 40px rgba(245,158,11,0.1)' }}
                        >
                            <Clock className="size-7 text-amber-400" strokeWidth={1.5} />
                        </div>

                        <p className="mb-1.5 text-[10px] font-bold uppercase tracking-[0.22em] text-amber-500/60">
                            Taking longer than expected
                        </p>
                        <h1 className="font-display mb-3 text-xl font-semibold text-white">
                            Still confirming
                        </h1>
                        <p className="mb-8 text-[13px] leading-relaxed text-white/40">
                            BoldSign has recorded your signature. Our system is catching up —
                            this occasionally takes a few extra minutes.
                        </p>

                        <div className="flex w-full flex-col gap-3">
                            <button
                                onClick={() => { setTimedOut(false); setAttempts(0); }}
                                className="group flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 py-3 text-[13px] font-bold uppercase tracking-[0.14em] text-white transition-all hover:bg-blue-500"
                                style={{ boxShadow: '0 0 28px rgba(37,99,235,0.3)' }}
                            >
                                Check Again
                                <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
                            </button>
                            <a
                                href="mailto:hello@pinpointlaunchpad.com"
                                className="flex items-center justify-center gap-1.5 py-2 text-[12px] text-white/30 transition-colors hover:text-white/55"
                            >
                                <Mail className="size-3.5" />
                                Contact support
                            </a>
                        </div>

                        <p className="mt-7 text-[11px] leading-relaxed text-white/18">
                            If this persists, email us your payment reference and we'll confirm manually.
                        </p>
                    </>
                ) : (
                    <>
                        <div className="mb-8">
                            <RingSpinner />
                        </div>

                        <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.24em] text-blue-400/70">
                            Processing
                        </p>
                        <h1 className="font-display mb-3 text-[22px] font-semibold tracking-tight text-white">
                            Verifying your signature
                        </h1>
                        <p className="mb-6 text-[13px] leading-relaxed text-white/40">
                            Confirming with BoldSign. This takes a few seconds —
                            please keep this page open.
                        </p>

                        <PulseRow attempts={attempts} />

                        <div className="mt-10 h-px w-24 bg-gradient-to-r from-transparent via-white/[0.08] to-transparent" />
                        <p className="mt-4 text-[11px] text-white/20">
                            You'll be redirected automatically once confirmed.
                        </p>
                    </>
                )}
            </motion.div>
        </div>
    );
}
