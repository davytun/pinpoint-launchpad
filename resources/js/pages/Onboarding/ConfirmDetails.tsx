import { Head, useForm } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { Lock, Loader2 } from 'lucide-react';

import { PinpointLogo } from '@/components/pinpoint-logo';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import DiagnosticLayout from '@/layouts/diagnostic-layout';

interface PageProps {
    email:      string;
    tier_label: string;
}

const fieldVariants = {
    hidden:  { opacity: 0, y: 12 },
    visible: (i: number) => ({
        opacity: 1,
        y:       0,
        transition: { delay: i * 0.05 + 0.2, duration: 0.4, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] },
    }),
};

export default function ConfirmDetails({ email, tier_label }: PageProps) {
    const { data, setData, post, processing, errors } = useForm({
        full_name:    '',
        company_name: '',
    });

    function submit(e: React.FormEvent) {
        e.preventDefault();
        post(route('onboarding.confirm-details'));
    }

    return (
        <DiagnosticLayout glowColor="#2563EB" hideWordmark>
            <Head title="Confirm Your Details — PARAGON Certification" />

            <div className="flex min-h-screen items-center justify-center px-4 py-16">
                <motion.div
                    className="w-full max-w-md"
                    initial={{ opacity: 0, y: 24, filter: 'blur(8px)' }}
                    animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                    transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
                >
                    {/* Wordmark */}
                    <div className="mb-8 flex justify-center">
                        <PinpointLogo height={24} variant="dark" />
                    </div>

                    <div className="overflow-hidden rounded-2xl border border-white/[0.07] bg-slate-800 shadow-[0_24px_60px_-10px_rgba(0,0,0,0.6)]">
                        <div className="px-8 pt-8 pb-2">
                            {/* Step indicator */}
                            <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.2em] text-white/35">
                                Step 1 of 2 — Confirm Your Details
                            </p>

                            <h1 className="font-display mb-2 text-[24px] font-semibold leading-tight tracking-tight text-white">
                                Almost There
                            </h1>

                            <p className="mb-7 text-[13px] leading-relaxed text-white/50">
                                We need a few details to prepare your agreement. This information will appear
                                on your signed Pinpoint Investment Warrant.
                            </p>
                        </div>

                        <form onSubmit={submit} className="px-8 pb-8 space-y-5">
                            {/* Full Name */}
                            <motion.div custom={0} variants={fieldVariants} initial="hidden" animate="visible">
                                <Label className="mb-1.5 block text-[13px] font-medium text-white/70">
                                    Your Full Name
                                </Label>
                                <Input
                                    type="text"
                                    value={data.full_name}
                                    onChange={e => setData('full_name', e.target.value)}
                                    placeholder="e.g. John Adeyemi"
                                    className="border-white/10 bg-slate-700/60 text-white placeholder:text-white/25 focus:border-blue-500 focus:ring-blue-500/20"
                                    disabled={processing}
                                    autoFocus
                                />
                                <p className="mt-1 text-[11px] text-white/35">
                                    As it should appear on the legal document
                                </p>
                                {errors.full_name && (
                                    <p className="mt-1 text-[11px] text-red-400">{errors.full_name}</p>
                                )}
                            </motion.div>

                            {/* Company Name */}
                            <motion.div custom={1} variants={fieldVariants} initial="hidden" animate="visible">
                                <Label className="mb-1.5 block text-[13px] font-medium text-white/70">
                                    Company / Venture Name
                                </Label>
                                <Input
                                    type="text"
                                    value={data.company_name}
                                    onChange={e => setData('company_name', e.target.value)}
                                    placeholder="e.g. Acme Technologies Ltd."
                                    className="border-white/10 bg-slate-700/60 text-white placeholder:text-white/25 focus:border-blue-500 focus:ring-blue-500/20"
                                    disabled={processing}
                                />
                                <p className="mt-1 text-[11px] text-white/35">
                                    The legal entity signing this agreement
                                </p>
                                {errors.company_name && (
                                    <p className="mt-1 text-[11px] text-red-400">{errors.company_name}</p>
                                )}
                            </motion.div>

                            {/* Email — read-only */}
                            <motion.div custom={2} variants={fieldVariants} initial="hidden" animate="visible">
                                <Label className="mb-1.5 block text-[13px] font-medium text-white/70">
                                    Email Address
                                </Label>
                                <Input
                                    type="email"
                                    value={email}
                                    readOnly
                                    className="cursor-not-allowed border-white/10 bg-slate-700/30 text-white/40 opacity-50"
                                />
                            </motion.div>

                            {/* Submit */}
                            <motion.div custom={3} variants={fieldVariants} initial="hidden" animate="visible" className="pt-2">
                                <Button
                                    type="submit"
                                    disabled={processing}
                                    className="w-full bg-blue-600 py-2.5 text-[14px] font-semibold hover:bg-blue-500 disabled:opacity-60"
                                >
                                    {processing ? (
                                        <>
                                            <Loader2 className="mr-2 size-4 animate-spin" />
                                            Generating your document...
                                        </>
                                    ) : (
                                        'Prepare My Agreement →'
                                    )}
                                </Button>
                            </motion.div>
                        </form>

                        {/* Trust note */}
                        <div className="flex items-center justify-center gap-2 border-t border-white/[0.05] px-8 py-4">
                            <Lock className="size-3.5 shrink-0 text-slate-500" />
                            <p className="text-[11px] text-slate-500">
                                Your details are used only for the legal agreement and are never shared.
                            </p>
                        </div>
                    </div>

                    {/* Tier badge */}
                    <p className="mt-4 text-center text-[12px] text-white/25">
                        {tier_label} Audit — {email}
                    </p>
                </motion.div>
            </div>
        </DiagnosticLayout>
    );
}
