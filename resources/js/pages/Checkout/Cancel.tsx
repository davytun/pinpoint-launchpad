import { Head, Link } from '@inertiajs/react';
import { ArrowRight, RotateCcw } from 'lucide-react';

import { PinpointLogo } from '@/components/pinpoint-logo';
import DiagnosticLayout from '@/layouts/diagnostic-layout';

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function CheckoutCancel() {
    return (
        <DiagnosticLayout glowColor="#3C53A8" hideWordmark>
            <Head title="Payment Cancelled — PARAGON Certification" />

            <div className="flex min-h-screen flex-col items-center justify-center px-4 py-16">

                {/* Wordmark */}
                <div className="mb-8 flex items-center gap-3">
                    <PinpointLogo height={26} variant="dark" />
                </div>

                <div className="w-full max-w-[400px]">
                    {/* Main card */}
                    <div className="relative overflow-hidden rounded-[2rem] border border-[#232C43] bg-[#101623] p-8 text-center shadow-2xl sm:p-10">

                        {/* Icon */}
                        <div className="mb-6 flex justify-center">
                            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-[#1B294B]/20 ring-1 ring-[#232C43]">
                                <RotateCcw className="size-6 text-[#576FA8]" />
                            </div>
                        </div>

                        {/* Copy */}
                        <p
                            className="mb-2 text-[10px] font-bold uppercase tracking-[0.25em] text-[#576FA8]"
                        >
                            Transaction Stopped
                        </p>
                        <h1 className="font-display mb-3 text-2xl font-semibold leading-tight text-[#ECF0F9] md:text-3xl">
                            No Charge Made
                        </h1>
                        <p className="mb-8 text-[14px] leading-relaxed text-[#788CBA]">
                            Your session is active and your results remain secured. You can return to pricing whenever you're ready.
                        </p>

                        {/* Actions */}
                        <div className="flex flex-col gap-3">
                            <Link
                                href="/checkout"
                                className="group relative block w-full overflow-hidden rounded-xl bg-[#4468BB] px-5 py-4 text-center text-[13px] font-bold uppercase tracking-[0.18em] text-white outline-none transition-all duration-200 hover:bg-[#3b5ba5]"
                                style={{ boxShadow: '0 0 28px rgba(68,104,187,0.3)' }}
                            >
                                <span className="waitlist-shimmer absolute inset-0 opacity-40 mix-blend-overlay transition-opacity duration-300 group-hover:opacity-80" />
                                <span className="relative z-10 flex items-center justify-center gap-2">
                                    Return to Pricing
                                    <ArrowRight className="size-4 transition-transform duration-200 group-hover:translate-x-0.5" />
                                </span>
                            </Link>

                            <Link
                                href="/diagnostic/result"
                                className="block w-full rounded-xl border border-[#232C43] bg-[#1B294B]/10 px-5 py-4 text-center text-[13px] font-bold uppercase tracking-[0.18em] text-[#576FA8] transition-colors hover:bg-[#1B294B]/20 hover:text-[#ECF0F9]"
                            >
                                Back to My Results
                            </Link>
                        </div>
                    </div>

                    {/* Reassurance note */}
                    <p className="mt-5 text-center text-xs text-[#576FA8]/60">
                        Your diagnostic score and results remain saved for 30 days.
                    </p>
                </div>
            </div>
        </DiagnosticLayout>
    );
}
