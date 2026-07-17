import { PinpointLogo } from '@/components/pinpoint-logo';
import { Link, useForm } from '@inertiajs/react';
import { Facebook, Linkedin, Twitter } from 'lucide-react';
import React from 'react';

export default function Footer() {
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
                            <Link href="/terms" className="text-left transition-colors outline-none hover:text-white md:text-right">
                                Terms & Conditions
                            </Link>
                            <Link href="/privacy" className="text-left transition-colors outline-none hover:text-white md:text-right">
                                Privacy Notice
                            </Link>
                            <Link href="/investor-terms" className="text-left transition-colors outline-none hover:text-white md:text-right">
                                Investor Terms
                            </Link>
                            <Link href="/cookies" className="text-left transition-colors outline-none hover:text-white md:text-right">
                                Cookies Policy
                            </Link>
                            <a href="/blog" className="text-left transition-colors outline-none hover:text-white md:text-right">
                                Blog
                            </a>
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


        </footer>
    );
}
