import { Head, router } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { ArrowRight, Check, Clock, LoaderCircle, Mail, RefreshCw } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

import DiagnosticLayout from '@/layouts/diagnostic-layout';

const ease = [0.16, 1, 0.3, 1] as [number, number, number, number];

function ConfirmationSpinner() {
    return (
        <div className="flex size-16 items-center justify-center rounded-2xl border border-[#3A54A5]/20 bg-[#3A54A5]/8">
            <LoaderCircle className="size-7 animate-spin text-[#3A54A5]" strokeWidth={1.7} />
        </div>
    );
}

function ResendInviteButton({ email }: { email?: string }) {
    const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
    const [cooldown, setCooldown] = useState(0);

    useEffect(() => {
        if (cooldown <= 0) return;
        const timer = setInterval(() => setCooldown((current) => current - 1), 1000);
        return () => clearInterval(timer);
    }, [cooldown]);

    async function handleResend() {
        if (!email || status === 'sending' || cooldown > 0) return;
        setStatus('sending');

        try {
            const response = await fetch('/onboarding/resend-invite', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content ?? '',
                },
                body: JSON.stringify({ email }),
            });

            if (response.ok) {
                setStatus('sent');
                setCooldown(60);
            } else {
                setStatus('error');
            }
        } catch {
            setStatus('error');
        }

        setTimeout(() => setStatus('idle'), 4000);
    }

    const label = status === 'sending' ? 'Sending email' : status === 'sent' ? 'Setup email sent' : status === 'error' ? 'Could not send email. Try again.' : cooldown > 0 ? `Resend available in ${cooldown}s` : 'Resend setup email';

    return (
        <button type="button" onClick={handleResend} disabled={status === 'sending' || cooldown > 0} className="mt-4 inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-[#3A54A5] transition-colors hover:text-[#2D4182] disabled:cursor-not-allowed disabled:opacity-45">
            {status === 'sending' && <LoaderCircle className="size-4 animate-spin" />}
            {label}
        </button>
    );
}

function ConfirmedScreen({ signer_email, tier_label, amount_paid, signed_at, setup_url }: { signer_email?: string; tier_label?: string; amount_paid?: string; signed_at?: string; setup_url?: string }) {
    return (
        <DiagnosticLayout glowColor="#3A54A5" hideWordmark>
            <Head title="Agreement Signed | PARAGON Certification" />

            <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-[520px] flex-col items-center justify-center px-5 py-10 sm:px-6">
                <img src="/pinpoint-logo.png" alt="Pinpoint" className="mb-8 h-7 w-auto" />

                <motion.main className="w-full rounded-[2rem] border border-white bg-white p-7 shadow-[0_20px_52px_rgba(38,57,115,0.10)] sm:p-9" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease }}>
                    <div className="flex size-11 items-center justify-center rounded-full bg-emerald-50 text-emerald-700"><Check className="size-5" strokeWidth={2.5} /></div>
                    <p className="mt-6 text-[11px] font-bold tracking-[0.16em] text-[#3A54A5] uppercase">Agreement signed</p>
                    <h1 className="font-display mt-2 text-3xl font-extrabold tracking-[-0.04em] text-zinc-950">You are all set.</h1>
                    <p className="mt-3 text-sm leading-6 text-zinc-600">Your assessment request is confirmed. Pinpoint will contact you as soon as possible with the next requirements.</p>

                    <dl className="mt-7 grid grid-cols-2 gap-x-6 gap-y-5 border-y border-zinc-200 py-5">
                        <div><dt className="text-[10px] font-bold tracking-[0.1em] text-zinc-500 uppercase">Assessment</dt><dd className="mt-1 text-sm font-semibold leading-5 text-zinc-900">{tier_label || 'PARAGON Audit'}</dd></div>
                        <div><dt className="text-[10px] font-bold tracking-[0.1em] text-zinc-500 uppercase">Amount paid</dt><dd className="mt-1 text-sm font-semibold leading-5 text-zinc-900">{amount_paid || 'Not available'}</dd></div>
                        <div><dt className="text-[10px] font-bold tracking-[0.1em] text-zinc-500 uppercase">Signed</dt><dd className="mt-1 text-sm font-semibold leading-5 text-zinc-900">{signed_at || 'Confirmed'}</dd></div>
                        <div><dt className="text-[10px] font-bold tracking-[0.1em] text-zinc-500 uppercase">Email</dt><dd className="mt-1 truncate text-sm font-semibold leading-5 text-zinc-900" title={signer_email}>{signer_email || 'Not available'}</dd></div>
                    </dl>

                    {setup_url ? (
                        <a href={setup_url} className="group mt-7 flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#3A54A5] px-5 text-sm font-bold text-white transition-colors hover:bg-[#2D4182]">
                            Set up Founder workspace
                            <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
                        </a>
                    ) : (
                        <div className="mt-7 flex items-start gap-3 rounded-xl bg-[#F5F7FF] p-4">
                            <Mail className="mt-0.5 size-5 shrink-0 text-[#3A54A5]" />
                            <div><p className="text-sm font-semibold text-zinc-900">Set up your workspace from your inbox.</p><p className="mt-1 text-sm leading-5 text-zinc-600">We sent a secure setup link to {signer_email}.</p><ResendInviteButton email={signer_email} /></div>
                        </div>
                    )}
                </motion.main>

                <a href="mailto:support@pinpointlaunchpad.com" className="mt-5 min-h-11 py-2 text-sm font-semibold text-[#3A54A5] hover:text-[#2D4182]">Need help? Contact Pinpoint</a>
            </div>
        </DiagnosticLayout>
    );
}

export default function OnboardingVerifying({ signature_verified, signer_email, tier_label, amount_paid, signed_at, setup_url }: { signature_verified: boolean; signer_email?: string; tier_label?: string; amount_paid?: string; signed_at?: string; setup_url?: string }) {
    const [attempts, setAttempts] = useState(0);
    const [timedOut, setTimedOut] = useState(false);
    const [confirmed, setConfirmed] = useState(signature_verified);
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

    useEffect(() => {
        if (confirmed) return;
        if (attempts >= 20) { setTimedOut(true); return; }

        intervalRef.current = setInterval(() => {
            setAttempts((value) => value + 1);
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

    if (confirmed) return <ConfirmedScreen {...{ signer_email, tier_label, amount_paid, signed_at, setup_url }} />;

    return (
        <DiagnosticLayout glowColor={timedOut ? '#F59E0B' : '#3A54A5'} hideWordmark>
            <Head title="Confirming Signature | PARAGON Certification" />
            <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-6 py-12 text-center">
                <div className="mb-12"><img src="/pinpoint-logo.png" alt="Pinpoint" className="block h-6 w-auto opacity-75" /></div>
                {timedOut ? (
                    <motion.div className="w-full max-w-sm rounded-[2rem] border border-white bg-white p-8 shadow-[0_18px_48px_rgba(38,57,115,0.10)] sm:p-10" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
                        <div className="mb-7 flex justify-center"><div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-amber-200 bg-amber-50"><Clock className="size-8 text-amber-700" strokeWidth={1.5} /></div></div>
                        <p className="mb-2 text-[10px] font-bold tracking-[0.22em] text-amber-700 uppercase">Confirmation delayed</p><h1 className="font-display mb-3 text-2xl font-extrabold text-zinc-950">Your signature is safe.</h1><p className="mb-8 text-sm leading-6 text-zinc-600">We are still waiting for the signing provider to confirm it. This can occasionally take a few minutes.</p>
                        <div className="flex flex-col gap-3"><button type="button" onClick={() => { setTimedOut(false); setAttempts(0); router.reload({ only: ['signature_verified'] }); }} className="group flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#3A54A5] px-4 text-sm font-bold text-white transition-colors hover:bg-[#2D4182]">Check status<RefreshCw className="size-4 transition-transform group-hover:rotate-90" /></button><a href="mailto:support@pinpointlaunchpad.com" className="py-2 text-sm font-semibold text-[#3A54A5] hover:text-[#2D4182]">Contact support</a></div>
                    </motion.div>
                ) : (
                    <motion.div className="w-full max-w-sm rounded-[2rem] border border-white bg-white p-8 shadow-[0_18px_48px_rgba(38,57,115,0.10)] sm:p-10" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
                        <div className="mb-8 flex justify-center"><ConfirmationSpinner /></div><p className="mb-2 text-[10px] font-bold tracking-[0.24em] text-[#3A54A5] uppercase">Agreement signed</p><h1 className="font-display mb-3 text-2xl font-extrabold tracking-tight text-zinc-950">Confirming your signature</h1><p className="text-sm leading-6 text-zinc-600">We are checking the signed agreement with our signing provider. This usually completes in a few seconds.</p>
                        <div className="mt-7 border-t border-zinc-200 pt-5"><button type="button" onClick={() => router.reload({ only: ['signature_verified'] })} className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-[#3A54A5] hover:text-[#2D4182]">Check status now <RefreshCw className="size-3.5" aria-hidden="true" /></button><p className="mt-4 text-xs leading-5 text-zinc-500">You can leave this page and return later. You will not need to sign again.</p></div>
                    </motion.div>
                )}
            </div>
        </DiagnosticLayout>
    );
}
