import { Head } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { CheckCircle, Clock, Mail, Shield } from 'lucide-react';

import { PinpointLogo } from '@/components/pinpoint-logo';
import DiagnosticLayout from '@/layouts/diagnostic-layout';

interface PageProps {
    tier:        string;
    amount_paid: number;
    signed_at:   string | null;
    email:       string | null;
}

export default function DashboardIndex({ tier, amount_paid, signed_at, email }: PageProps) {
    return (
        <DiagnosticLayout glowColor="#10B981" hideWordmark>
            <Head title="Dashboard — PARAGON Certification" />

            <div className="flex min-h-screen flex-col items-center justify-center px-4 py-16">

                <motion.div
                    className="w-full max-w-2xl"
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                >
                    {/* Wordmark */}
                    <div className="mb-10 flex justify-center">
                        <PinpointLogo height={26} variant="dark" />
                    </div>

                    {/* Success card */}
                    <div className="overflow-hidden rounded-2xl border border-white/[0.07] bg-slate-800 shadow-[0_24px_60px_-10px_rgba(0,0,0,0.6)]">

                        {/* Top banner */}
                        <div className="flex items-center gap-4 border-b border-white/[0.06] bg-emerald-500/10 px-8 py-6">
                            <CheckCircle className="size-8 shrink-0 text-emerald-400" strokeWidth={1.5} />
                            <div>
                                <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-emerald-400">
                                    Agreement Confirmed
                                </p>
                                <h1 className="mt-0.5 text-[20px] font-semibold text-white">
                                    You're in — PARAGON Audit Begins Soon
                                </h1>
                            </div>
                        </div>

                        {/* Body */}
                        <div className="px-8 py-8">
                            <p className="mb-8 text-[14px] leading-relaxed text-white/55">
                                Your Pinpoint Investment Warrant has been signed and your audit has been queued.
                                An analyst will reach out within <strong className="text-white/80">2–3 business days</strong> to
                                begin your PARAGON Certification process.
                            </p>

                            {/* Details grid */}
                            <div className="mb-8 grid gap-4 sm:grid-cols-2">
                                <div className="rounded-xl border border-white/[0.07] bg-white/[0.03] p-5">
                                    <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.15em] text-white/35">Audit Tier</p>
                                    <p className="text-[16px] font-semibold text-white">{tier} Audit</p>
                                </div>
                                <div className="rounded-xl border border-white/[0.07] bg-white/[0.03] p-5">
                                    <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.15em] text-white/35">Amount Paid</p>
                                    <p className="text-[16px] font-semibold text-white">${Number(amount_paid).toLocaleString()} USD</p>
                                </div>
                                {email && (
                                    <div className="rounded-xl border border-white/[0.07] bg-white/[0.03] p-5">
                                        <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.15em] text-white/35">Email</p>
                                        <p className="truncate text-[14px] font-medium text-white/80">{email}</p>
                                    </div>
                                )}
                                {signed_at && (
                                    <div className="rounded-xl border border-white/[0.07] bg-white/[0.03] p-5">
                                        <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.15em] text-white/35">Signed At</p>
                                        <p className="text-[14px] font-medium text-white/80">{new Date(signed_at).toLocaleString()}</p>
                                    </div>
                                )}
                            </div>

                            {/* What's next */}
                            <div className="space-y-4">
                                <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-white/30">What Happens Next</p>

                                {[
                                    { icon: <Mail className="size-4 text-blue-400" />,    text: 'Confirmation email sent to your inbox with your signed agreement.' },
                                    { icon: <Clock className="size-4 text-amber-400" />,  text: 'Analyst assigned within 2–3 business days to begin your audit.' },
                                    { icon: <Shield className="size-4 text-emerald-400" />, text: 'PARAGON Certification issued upon successful audit completion.' },
                                ].map(({ icon, text }) => (
                                    <div key={text} className="flex items-start gap-3 text-[13px] leading-relaxed text-white/50">
                                        <span className="mt-0.5 shrink-0">{icon}</span>
                                        <span>{text}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <p className="mt-6 text-center text-[12px] text-white/25">
                        Questions? Email <span className="text-white/40">support@pinpointlaunchpad.com</span>
                    </p>
                </motion.div>
            </div>
        </DiagnosticLayout>
    );
}
