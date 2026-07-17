import { useForm } from '@inertiajs/react';
import { ArrowRight, Check } from 'lucide-react';
import React from 'react';

export default function Contact() {
    const { data, setData, post, processing, errors, reset, wasSuccessful } = useForm({
        name: '',
        email: '',
        company_name: '',
        message: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('contact.store'), {
            preserveScroll: true,
            onSuccess: () => reset(),
        });
    };

    return (
        <section id="contact" className="relative z-10 w-full py-24 font-sans">
            <div className="mx-auto max-w-5xl px-6 md:px-8">
                <div className="grid grid-cols-1 items-start gap-16 lg:grid-cols-12">
                    {/* Left Column: Wording */}
                    <div className="space-y-6 lg:col-span-5">
                        <h2 className="font-display text-4xl font-bold tracking-tight text-zinc-950 sm:text-5xl">Let's build trust together.</h2>
                        <p className="max-w-sm text-base leading-relaxed text-zinc-500">
                            Have inquiries regarding our PARAGON verification cycles, analyst audits, or investor partner integration? Send a message
                            and our support team will connect with you.
                        </p>
                        <div className="space-y-2 pt-4">
                            <span className="text-[10px] font-bold tracking-[0.2em] text-zinc-400 uppercase">Direct Email</span>
                        </div>
                    </div>

                    {/* Right Column: Contact Form */}
                    <div className="lg:col-span-7">
                        {wasSuccessful ? (
                            <div className="space-y-6 rounded-3xl border border-white/80 bg-white/30 p-10 text-center shadow-[0_8px_30px_rgba(58,84,165,0.02)] backdrop-blur-md">
                                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600">
                                    <Check className="h-6 w-6 stroke-[3]" />
                                </div>
                                <div className="space-y-2">
                                    <h3 className="text-xl font-bold text-zinc-950">Message Sent</h3>
                                    <p className="mx-auto max-w-sm text-sm text-zinc-500">
                                        Thank you for getting in touch. An analyst will review your inquiry and reach back within 24 hours.
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-8">
                                <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
                                    {/* Full Name */}
                                    <div className="space-y-2">
                                        <label htmlFor="name" className="text-[10px] font-bold tracking-[0.15em] text-zinc-400 uppercase">
                                            Full Name
                                        </label>
                                        <input
                                            type="text"
                                            id="name"
                                            required
                                            value={data.name}
                                            onChange={(e) => setData('name', e.target.value)}
                                            placeholder="John Doe"
                                            className="w-full border-b border-zinc-200 bg-transparent py-2.5 text-sm text-zinc-900 transition-colors outline-none placeholder:text-zinc-300 focus:border-[#3A54A5]"
                                        />
                                        {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name}</p>}
                                    </div>

                                    {/* Email */}
                                    <div className="space-y-2">
                                        <label htmlFor="email" className="text-[10px] font-bold tracking-[0.15em] text-zinc-400 uppercase">
                                            Email Address
                                        </label>
                                        <input
                                            type="email"
                                            id="email"
                                            required
                                            value={data.email}
                                            onChange={(e) => setData('email', e.target.value)}
                                            placeholder="john@example.com"
                                            className="w-full border-b border-zinc-200 bg-transparent py-2.5 text-sm text-zinc-900 transition-colors outline-none placeholder:text-zinc-300 focus:border-[#3A54A5]"
                                        />
                                        {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email}</p>}
                                    </div>
                                </div>

                                {/* Company Name */}
                                <div className="space-y-2">
                                    <label htmlFor="company_name" className="text-[10px] font-bold tracking-[0.15em] text-zinc-400 uppercase">
                                        Company Name <span className="text-zinc-300">(Optional)</span>
                                    </label>
                                    <input
                                        type="text"
                                        id="company_name"
                                        value={data.company_name}
                                        onChange={(e) => setData('company_name', e.target.value)}
                                        placeholder="Acme Corp"
                                        className="w-full border-b border-zinc-200 bg-transparent py-2.5 text-sm text-zinc-900 transition-colors outline-none placeholder:text-zinc-300 focus:border-[#3A54A5]"
                                    />
                                    {errors.company_name && <p className="mt-1 text-xs text-red-500">{errors.company_name}</p>}
                                </div>

                                {/* Message */}
                                <div className="space-y-2">
                                    <label htmlFor="message" className="text-[10px] font-bold tracking-[0.15em] text-zinc-400 uppercase">
                                        Your Message
                                    </label>
                                    <textarea
                                        id="message"
                                        required
                                        rows={4}
                                        value={data.message}
                                        onChange={(e) => setData('message', e.target.value)}
                                        placeholder="Tell us about your venture or query..."
                                        className="w-full resize-none border-b border-zinc-200 bg-transparent py-2.5 text-sm text-zinc-900 transition-colors outline-none placeholder:text-zinc-300 focus:border-[#3A54A5]"
                                    />
                                    {errors.message && <p className="mt-1 text-xs text-red-500">{errors.message}</p>}
                                </div>

                                {/* Submit Button */}
                                <div className="pt-2">
                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="group inline-flex h-11 items-center justify-center gap-2 rounded-full bg-[#3A54A5] px-8 text-xs font-bold tracking-widest text-white uppercase shadow-sm transition-all duration-200 hover:bg-[#2D4182] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                        {processing ? 'Sending...' : 'Send message'}
                                        <ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            </div>
        </section>
    );
}
