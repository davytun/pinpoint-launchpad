import { Head, router } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { ArrowRight, Clock, Mail } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

const ease = [0.16, 1, 0.3, 1] as [number, number, number, number];
const MAX_ATTEMPTS = 40; // 40 × 3s = 2 min

// Animated ring spinner — matches the brand, not a generic Lucide spinner
function RingSpinner() {
    return (
        <div className="relative flex h-20 w-20 items-center justify-center">
            {/* Outer slow ring */}
            <motion.div
                className="absolute inset-0 rounded-full border-2 border-transparent"
                style={{ borderTopColor: 'rgba(37,99,235,0.6)', borderRightColor: 'rgba(37,99,235,0.15)' }}
                animate={{ rotate: 360 }}
                transition={{ duration: 2.4, repeat: Infinity, ease: 'linear' }}
            />
            {/* Inner fast ring */}
            <motion.div
                className="absolute inset-[6px] rounded-full border-2 border-transparent"
                style={{ borderTopColor: 'rgba(92,163,54,0.7)', borderLeftColor: 'rgba(92,163,54,0.15)' }}
                animate={{ rotate: -360 }}
                transition={{ duration: 1.6, repeat: Infinity, ease: 'linear' }}
            />
            {/* Centre dot */}
            <div
                className="h-2.5 w-2.5 rounded-full"
                style={{ background: 'radial-gradient(circle, #60A5FA 0%, rgba(37,99,235,0.4) 100%)' }}
            />
        </div>
    );
}

// Pulsing dot row — shows live activity
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

export default function OnboardingVerifying({ signature_verified }: { signature_verified: boolean }) {
    const [attempts, setAttempts] = useState(0);
    const [timedOut, setTimedOut] = useState(false);
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

    useEffect(() => {
        if (signature_verified) {
            setTimeout(() => router.visit('/dashboard'), 100);
            return;
        }
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
                        router.visit('/dashboard');
                    }
                },
            });
        }, 3000);
        return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
    }, [signature_verified, attempts]);

    return (
        <div className="fixed inset-0 flex flex-col items-center justify-center bg-[#050505] text-white antialiased">
            <Head title="Verifying Signature — PARAGON Certification" />

            {/* Background */}
            <div className="waitlist-shell pointer-events-none absolute inset-0 z-0" />
            <div className="waitlist-grid  pointer-events-none absolute inset-0 z-0" />
            <div
                className="pointer-events-none absolute inset-x-0 top-0 z-0 h-72"
                style={{ background: timedOut
                    ? 'radial-gradient(ellipse 70% 50% at 50% 0%, rgba(245,158,11,0.12) 0%, transparent 100%)'
                    : 'radial-gradient(ellipse 70% 50% at 50% 0%, rgba(37,99,235,0.14) 0%, transparent 100%)',
                }}
            />

            <motion.div
                key={timedOut ? 'timeout' : 'verifying'}
                className="relative z-10 flex w-full max-w-sm flex-col items-center px-6 text-center"
                initial={{ opacity: 0, y: 20, filter: 'blur(8px)' }}
                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                transition={{ duration: 0.55, ease }}
            >
                {/* Logo */}
                <img
                    src="/pinpoint-logo.png"
                    alt="Pinpoint"
                    className="mb-12 block h-6 w-auto select-none opacity-60"
                    style={{ maxWidth: 130 }}
                />

                {timedOut ? (
                    /* ── Timed-out state ── */
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
                    /* ── Verifying state ── */
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
