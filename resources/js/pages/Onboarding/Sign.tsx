import { Head, router } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { CheckCircle, Lock, Loader2, Percent, ShieldCheck, XCircle } from 'lucide-react';
import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';

import { PinpointLogo } from '@/components/pinpoint-logo';
import { Badge } from '@/components/ui/badge';
import DiagnosticLayout from '@/layouts/diagnostic-layout';

interface PageProps {
    embed_url:    string;
    signer_email: string;
    tier_label:   string;
    document_id:  string;
}

interface TrustPoint {
    icon:  React.ReactNode;
    title: string;
    body:  string;
}

function TrustItem({ icon, title, body }: TrustPoint) {
    return (
        <div className="flex items-start gap-3">
            <div className="mt-0.5 shrink-0">{icon}</div>
            <div>
                <p className="text-[14px] font-semibold text-white/90">{title}</p>
                <p className="mt-1 text-[13px] leading-relaxed text-white/45">{body}</p>
            </div>
        </div>
    );
}

export default function OnboardingSign({ embed_url, signer_email, tier_label, document_id }: PageProps) {
    const [iframeLoaded, setIframeLoaded] = useState(false);
    const [signComplete, setSignComplete] = useState(false);
    const [iframeError,  setIframeError]  = useState(false);

    // Listen for BoldSign postMessage events
    useEffect(() => {
        function handleMessage(event: MessageEvent) {
            const data = event.data;
            if (! data) return;

            const action = typeof data === 'string' ? data : (data.action ?? data.event ?? '');

            if (action === 'onDocumentSigned' || action === 'documentSigned') {
                setSignComplete(true);
                setTimeout(() => router.visit('/onboarding/complete'), 1200);
            }

            if (action === 'onDocumentDeclined' || action === 'documentDeclined') {
                router.visit('/onboarding/sign');
            }

            if (data?.type === 'boldsign' && data?.action === 'error') {
                setIframeError(true);
            }
        }

        window.addEventListener('message', handleMessage);
        return () => window.removeEventListener('message', handleMessage);
    }, []);

    // Auto-reload after 25 minutes to get a fresh embed URL before expiry
    useEffect(() => {
        const timer = setTimeout(() => {
            router.reload({ preserveUrl: true });
        }, 25 * 60 * 1000);
        return () => clearTimeout(timer);
    }, []);

    const trustPoints: TrustPoint[] = [
        {
            icon:  <ShieldCheck className="size-5 text-emerald-500" />,
            title: 'Why sign now?',
            body:  'This protects your trade secrets and confirms your 100% credit toward the success fee.',
        },
        {
            icon:  <Percent className="size-5 text-blue-500" />,
            title: 'The 2% Rule',
            body:  'This is a standard strategic advisory warrant. It aligns our team to work as your external Series A department.',
        },
        {
            icon:  <Lock className="size-5 text-slate-400" />,
            title: 'Secure & Compliant',
            body:  'Encrypted via BoldSign. SOC 2 Type II and eIDAS certified.',
        },
    ];

    return (
        <DiagnosticLayout glowColor="#2563EB" hideWordmark>
            <Head title="Sign Your Agreement — PARAGON Certification" />

            {/* ── Signing complete overlay ── */}
            {signComplete && (
                <motion.div
                    className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-5 bg-slate-950/95 backdrop-blur-md"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                >
                    <motion.div
                        initial={{ scale: 0.7, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                    >
                        <CheckCircle className="size-16 text-emerald-400" strokeWidth={1.5} />
                    </motion.div>
                    <p className="text-[18px] font-semibold text-white">Agreement Signed</p>
                    <p className="text-[13px] text-white/45">Confirming your signature...</p>
                </motion.div>
            )}

            <div className="flex min-h-screen flex-col lg:flex-row">

                {/* ── Left: Trust Sidebar ── */}
                <motion.aside
                    className="flex w-full flex-col justify-between px-6 py-10 lg:w-[40%] lg:px-12 lg:py-14"
                    initial={{ opacity: 0, x: -24 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
                >
                    {/* Wordmark */}
                    <div className="mb-10">
                        <PinpointLogo height={26} variant="dark" />
                    </div>

                    <div className="flex-1">
                        {/* Step label */}
                        <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.22em] text-white/40">
                            🛡️ Final Step
                        </p>

                        {/* Headline */}
                        <h1 className="font-display mb-4 text-[28px] font-semibold leading-tight tracking-tight text-white lg:text-[32px]">
                            Secure Your Position
                        </h1>

                        {/* Sub */}
                        <p className="mb-10 max-w-[360px] text-[14px] leading-relaxed text-white/50">
                            To begin your analyst-led audit and secure your place in the PIN Network, please sign
                            the Success Fee &amp; Confidentiality Agreement.
                        </p>

                        {/* Trust points */}
                        <div className="space-y-7">
                            {trustPoints.map((tp) => (
                                <TrustItem key={tp.title} {...tp} />
                            ))}
                        </div>
                    </div>

                    {/* Tier confirmation pill */}
                    <div className="mt-12 hidden rounded-xl border border-white/[0.07] bg-white/[0.03] p-5 lg:block">
                        <Badge
                            className="mb-3 border px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.15em]"
                            style={{
                                background:   'rgba(37,99,235,0.08)',
                                borderColor:  'rgba(37,99,235,0.3)',
                                color:        '#60A5FA',
                            }}
                        >
                            {tier_label} Audit — Secured
                        </Badge>
                        <p className="text-[12px] text-white/35">{signer_email}</p>
                    </div>
                </motion.aside>

                {/* ── Right: BoldSign iframe ── */}
                <motion.section
                    className="flex w-full flex-1 flex-col items-center justify-center px-4 pb-10 pt-4 lg:w-[60%] lg:px-10 lg:py-14"
                    initial={{ opacity: 0, x: 24 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
                >
                    <div className="relative w-full overflow-hidden rounded-xl border border-slate-700 bg-white shadow-[0_20px_60px_-10px_rgba(0,0,0,0.5)]">

                        {/* Loading overlay */}
                        {!iframeLoaded && !iframeError && (
                            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-4 bg-white">
                                <Loader2 className="size-10 animate-spin text-blue-600" />
                                <p className="text-[13px] text-slate-500">Loading your agreement...</p>
                            </div>
                        )}

                        {/* Expiry / error state */}
                        {iframeError ? (
                            <div className="flex h-[500px] flex-col items-center justify-center gap-5 bg-slate-900 sm:h-[600px] lg:h-[700px]">
                                <XCircle className="size-12 text-red-400" strokeWidth={1.5} />
                                <div className="text-center">
                                    <p className="mb-1 text-[16px] font-semibold text-white">
                                        Your signing session has expired.
                                    </p>
                                    <p className="text-[13px] text-white/50">
                                        This happens if the page has been open for too long.
                                    </p>
                                </div>
                                <Button
                                    onClick={() => router.reload({ preserveUrl: true })}
                                    className="bg-blue-600 hover:bg-blue-500"
                                >
                                    Refresh Agreement →
                                </Button>
                            </div>
                        ) : (
                            <iframe
                                src={embed_url}
                                title="Pinpoint Investment Warrant"
                                width="100%"
                                className="block h-[500px] sm:h-[600px] lg:h-[700px]"
                                allow="encrypted-media"
                                loading="lazy"
                                referrerPolicy="strict-origin-when-cross-origin"
                                onLoad={() => setIframeLoaded(true)}
                                style={{ border: 'none', display: 'block' }}
                            />
                        )}
                    </div>

                    <p className="mt-4 text-center text-[12px] text-white/25">
                        Document ID: <span className="font-mono">{document_id}</span>
                    </p>
                </motion.section>

            </div>
        </DiagnosticLayout>
    );
}
