import { PinpointLogo } from '@/components/pinpoint-logo';
import { useForm } from '@inertiajs/react';
import { AnimatePresence, motion } from 'framer-motion';
import { Facebook, Linkedin, Twitter, X } from 'lucide-react';
import React, { useState } from 'react';

export default function Footer() {
    const [legalModal, setLegalModal] = useState<{ title: string; content: string } | null>(null);
    const { data, setData, post, processing, errors, reset, wasSuccessful } = useForm({
        email: '',
    });

    const handleSubscribe = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('newsletter.store'), {
            preserveScroll: true,
            onSuccess: () => reset(),
        });
    };

    return (
        <footer className="relative z-10 w-full bg-[#0D1325] py-16 font-sans text-zinc-300">
            <div className="mx-auto max-w-5xl px-6 md:px-8">
                <div className="grid grid-cols-1 gap-12 md:grid-cols-3">
                    {/* Brand Column */}
                    <div className="space-y-4">
                        <PinpointLogo height={20} variant="white" />
                        <p className="max-w-xs text-xs leading-relaxed text-zinc-400">
                            Venture diligence & investment-readiness verification using the PARAGON Model.
                        </p>
                        <p className="text-[11px] text-zinc-500">© {new Date().getFullYear()} Pinpoint Launchpad.</p>
                    </div>

                    {/* Newsletter Column */}
                    <div className="space-y-3">
                        <h4 className="text-[10px] font-bold tracking-widest text-zinc-500 uppercase">Subscribe to Updates</h4>
                        <p className="text-xs leading-relaxed text-zinc-400">
                            Stay up-to-date with our verification cycle cohort releases, checklists, and platform news.
                        </p>
                        {wasSuccessful ? (
                            <div className="text-xs font-bold text-[#93C5FD] transition-all duration-300">✓ Thank you for subscribing!</div>
                        ) : (
                            <form onSubmit={handleSubscribe} className="relative mt-2 flex max-w-sm items-center">
                                <input
                                    type="email"
                                    placeholder="Enter your email"
                                    required
                                    value={data.email}
                                    onChange={(e) => setData('email', e.target.value)}
                                    className="h-9 w-full rounded-full border border-white/10 bg-white/5 pr-24 pl-4 text-xs text-white placeholder-zinc-500 transition-colors focus:border-zinc-700 focus:outline-none"
                                />
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="absolute top-1 right-1 flex h-7 cursor-pointer items-center justify-center rounded-full bg-white px-4 text-[10px] font-bold text-[#0D1325] transition-colors hover:bg-zinc-200 disabled:opacity-50"
                                >
                                    Subscribe
                                </button>
                            </form>
                        )}
                        {errors.email && <p className="mt-1 text-xs text-red-400">{errors.email}</p>}
                    </div>

                    {/* Legal & Socials (Right Aligned on desktop) */}
                    <div className="flex flex-col space-y-4 md:items-end">
                        <h4 className="text-[10px] font-bold tracking-widest text-zinc-500 uppercase">Legal & Social</h4>
                        <div className="text-zinc-350 flex flex-col space-y-2 text-xs font-semibold md:items-end">
                            <button
                                type="button"
                                onClick={() =>
                                    setLegalModal({
                                        title: 'Terms & Conditions',
                                        content:
                                            'These terms govern your use of the Pinpoint Launchpad waitlist and readiness assessment program. By signing up, you agree to receive program updates, checklists, and cohort announcements.\n\nAll diagnostic feedback is advisory. Pinpoint Launchpad does not guarantee investment, funding, or specific outcomes. Capital raising involves high risks, and all financial metrics provided by users are subject to independent forensic validation.',
                                    })
                                }
                                className="text-left transition-colors outline-none hover:text-white md:text-right"
                            >
                                Terms & Conditions
                            </button>
                            <button
                                type="button"
                                onClick={() =>
                                    setLegalModal({
                                        title: 'Privacy Policy',
                                        content:
                                            'Your privacy is critical to us. We collect email addresses, company names, and growth stage inputs to evaluate waitlist eligibility and send relevant PARAGON Diagnostic information.\n\nWe do not sell, rent, or distribute your personal or startup information to third-party brokers. Data shared with institutional investors is subject to explicit consent and NDA boundaries.',
                                    })
                                }
                                className="text-left transition-colors outline-none hover:text-white md:text-right"
                            >
                                Privacy Policy
                            </button>
                        </div>

                        {/* Social Icons */}
                        <div className="flex items-center gap-3 pt-2">
                            <a
                                href="https://linkedin.com"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-white/5 text-zinc-400 transition-colors hover:border-white/20 hover:text-white"
                                aria-label="LinkedIn"
                            >
                                <Linkedin className="h-3.5 w-3.5" />
                            </a>
                            <a
                                href="https://x.com"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-white/5 text-zinc-400 transition-colors hover:border-white/20 hover:text-white"
                                aria-label="Twitter (X)"
                            >
                                <Twitter className="h-3.5 w-3.5" />
                            </a>
                            <a
                                href="https://facebook.com"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-white/5 text-zinc-400 transition-colors hover:border-white/20 hover:text-white"
                                aria-label="Facebook"
                            >
                                <Facebook className="h-3.5 w-3.5" />
                            </a>
                        </div>
                    </div>
                </div>
            </div>

            {/* Legal Modal Overlay */}
            <AnimatePresence>
                {legalModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setLegalModal(null)}
                            className="fixed inset-0 bg-zinc-950/40 backdrop-blur-xs"
                        />

                        {/* Modal Box */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.96, y: 8 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.96, y: 8 }}
                            transition={{ duration: 0.25, ease: 'easeOut' }}
                            className="border-zinc-250 relative z-10 w-full max-w-lg rounded-3xl border bg-white p-8 shadow-2xl"
                        >
                            <button
                                type="button"
                                onClick={() => setLegalModal(null)}
                                className="absolute top-5 right-5 flex h-8 w-8 items-center justify-center rounded-full text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-700"
                            >
                                <X className="h-4 w-4" />
                            </button>

                            <h3 className="font-display mb-4 text-xl font-bold text-zinc-950">{legalModal.title}</h3>
                            <div className="max-h-[300px] overflow-y-auto pr-2 text-xs leading-relaxed whitespace-pre-line text-zinc-500">
                                {legalModal.content}
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </footer>
    );
}
