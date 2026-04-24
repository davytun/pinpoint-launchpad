import { Head, router } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { Clock, Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import DiagnosticLayout from '@/layouts/diagnostic-layout';

interface PageProps {
    signature_verified: boolean;
}

const MAX_ATTEMPTS = 40; // 40 × 3s = 2 minutes

export default function OnboardingVerifying({ signature_verified }: PageProps) {
    const [attempts,  setAttempts]  = useState(0);
    const [timedOut,  setTimedOut]  = useState(false);

    useEffect(() => {
        if (signature_verified) {
            const t = setTimeout(() => router.visit('/dashboard'), 100);
            return () => clearTimeout(t);
        }

        if (attempts >= MAX_ATTEMPTS) {
            setTimedOut(true);
            return;
        }

        const interval = setInterval(() => {
            setAttempts(prev => prev + 1);
            router.reload({
                only: ['signature_verified'],
                onSuccess: (page) => {
                    if ((page.props as unknown as PageProps).signature_verified) {
                        clearInterval(interval);
                        router.visit('/dashboard');
                    }
                },
            });
        }, 3000);

        return () => clearInterval(interval);
    }, [signature_verified, attempts]);

    if (timedOut) {
        return (
            <DiagnosticLayout glowColor="#F59E0B" hideWordmark>
                <Head title="Verifying Signature — PARAGON Certification" />

                <div className="flex min-h-screen items-center justify-center px-4">
                    <motion.div
                        className="w-full max-w-md overflow-hidden rounded-2xl border border-white/[0.07] bg-slate-800 p-10 text-center shadow-[0_24px_48px_-10px_rgba(0,0,0,0.5)]"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                    >
                        <div className="mb-6 flex justify-center">
                            <Clock className="text-amber-400" style={{ width: 48, height: 48 }} strokeWidth={1.5} />
                        </div>

                        <h1 className="font-display mb-3 text-[20px] font-semibold tracking-tight text-white">
                            Taking longer than expected
                        </h1>

                        <p className="mb-7 text-[13px] leading-relaxed text-white/55">
                            Your signature has been recorded by BoldSign. Our system is confirming it —
                            this can occasionally take a few minutes.
                        </p>

                        <div className="flex flex-col items-center gap-3">
                            <Button
                                onClick={() => { setTimedOut(false); setAttempts(0); }}
                                className="w-full bg-blue-600 hover:bg-blue-500"
                            >
                                Check Again
                            </Button>
                            <a
                                href="mailto:hello@pinpointlaunchpad.com"
                                className="text-[13px] text-white/40 hover:text-white/60 transition-colors"
                            >
                                Contact Support
                            </a>
                        </div>

                        <p className="mt-6 text-[11px] text-white/25">
                            If this persists, email us with your payment reference and we'll confirm your signing manually.
                        </p>
                    </motion.div>
                </div>
            </DiagnosticLayout>
        );
    }

    return (
        <DiagnosticLayout glowColor="#2563EB" hideWordmark>
            <Head title="Verifying Signature — PARAGON Certification" />

            <div className="flex min-h-screen items-center justify-center px-4">
                <motion.div
                    className="w-full max-w-md overflow-hidden rounded-2xl border border-white/[0.07] bg-slate-800 p-10 text-center shadow-[0_24px_48px_-10px_rgba(0,0,0,0.5)]"
                    initial={{ opacity: 0, y: 20, filter: 'blur(8px)' }}
                    animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                    transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                >
                    <div className="mb-7 flex justify-center">
                        <Loader2
                            className="animate-spin text-blue-500"
                            style={{ width: 60, height: 60 }}
                            strokeWidth={1.5}
                        />
                    </div>

                    <h1 className="font-display mb-3 text-[22px] font-semibold tracking-tight text-white">
                        Verifying Your Signature...
                    </h1>

                    <p className="mb-5 text-[14px] leading-relaxed text-white/55">
                        This usually takes just a few seconds.
                        <br />
                        Please don't close this page.
                    </p>

                    <p className="text-[12px] text-white/30">
                        You'll be redirected automatically once confirmed.
                    </p>
                </motion.div>
            </div>
        </DiagnosticLayout>
    );
}
