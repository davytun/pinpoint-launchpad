import { Head, router } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { LoaderCircle, RefreshCw } from 'lucide-react';
import { useEffect, useState } from 'react';

import DiagnosticLayout from '@/layouts/diagnostic-layout';

const ease = [0.16, 1, 0.3, 1] as [number, number, number, number];

/**
 * Thin wait state only. Once BoldSign confirms, /onboarding/complete redirects
 * to founder setup (or login if the account already exists).
 */
export default function OnboardingVerifying({ signer_email }: { signer_email?: string }) {
    const [timedOut, setTimedOut] = useState(false);

    useEffect(() => {
        if (timedOut) return;

        let attempts = 0;
        const interval = setInterval(() => {
            attempts += 1;
            if (attempts >= 20) {
                clearInterval(interval);
                setTimedOut(true);
                return;
            }
            // Full visit so a verified signature can 302 to founder setup.
            router.visit('/onboarding/complete', { replace: true, preserveState: true });
        }, 3000);

        return () => clearInterval(interval);
    }, [timedOut]);

    return (
        <DiagnosticLayout glowColor={timedOut ? '#F59E0B' : '#3A54A5'} hideWordmark>
            <Head title="Confirming — Pinpoint" />

            <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-[420px] flex-col justify-center px-5 py-12 sm:px-6">
                <img src="/pinpoint-logo.png" alt="Pinpoint" className="mb-10 h-7 w-auto" />

                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, ease }}>
                    {timedOut ? (
                        <>
                            <h1 className="font-display text-[1.75rem] leading-tight font-bold tracking-tight text-zinc-950">
                                Still confirming
                            </h1>
                            <p className="mt-3 text-[15px] leading-relaxed text-zinc-600">
                                Your signature is saved. We are waiting on the signing provider — this can take a minute.
                            </p>
                            <button
                                type="button"
                                onClick={() => {
                                    setTimedOut(false);
                                    router.visit('/onboarding/complete');
                                }}
                                className="mt-8 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#3A54A5] px-5 text-[14px] font-semibold text-white transition-colors hover:bg-[#2D4182]"
                            >
                                Check again
                                <RefreshCw className="size-4" />
                            </button>
                        </>
                    ) : (
                        <>
                            <div className="mb-6 flex size-12 items-center justify-center rounded-xl border border-[#3A54A5]/20 bg-[#3A54A5]/8">
                                <LoaderCircle className="size-6 animate-spin text-[#3A54A5]" strokeWidth={1.7} />
                            </div>
                            <h1 className="font-display text-[1.75rem] leading-tight font-bold tracking-tight text-zinc-950">
                                Confirming your signature
                            </h1>
                            <p className="mt-3 text-[15px] leading-relaxed text-zinc-600">
                                Almost done — we will move you to account setup as soon as this clears.
                            </p>
                            <button
                                type="button"
                                onClick={() => router.visit('/onboarding/complete')}
                                className="mt-8 inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-[#3A54A5] transition-colors hover:text-[#2D4182]"
                            >
                                Check status now
                                <RefreshCw className="size-3.5" />
                            </button>
                        </>
                    )}

                    {signer_email ? (
                        <p className="mt-8 text-[13px] text-zinc-500">
                            Signed as {signer_email}
                        </p>
                    ) : null}

                    <a
                        href="mailto:support@pinpointlaunchpad.com"
                        className="mt-4 inline-block text-[13px] font-medium text-zinc-500 hover:text-[#3A54A5]"
                    >
                        Need help? Email support
                    </a>
                </motion.div>
            </div>
        </DiagnosticLayout>
    );
}
