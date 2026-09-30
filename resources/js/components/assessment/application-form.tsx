import { router, usePage } from '@inertiajs/react';
import { Check } from 'lucide-react';
import { useState } from 'react';

import LandingCta from '@/components/landing/landing-cta';
import { CountrySelect } from '@/components/country-select';
import PrivacyConsent from '@/components/privacy-consent';
import { RAISE_TARGETS } from '@/components/assessment/data';
import { cn } from '@/lib/utils';

const labelCls = 'mb-1.5 block text-sm font-medium text-zinc-700';

export default function AssessmentApplicationForm() {
    const { props } = usePage<{ flash?: { success?: string; error?: string } }>();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [form, setForm] = useState({
        name: '',
        email: '',
        company: '',
        country: '',
        stage: '',
        raise_target: '',
        message: '',
    });
    const [errors, setErrors] = useState<Record<string, string>>({});

    function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
        setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
        setErrors((prev) => ({ ...prev, [e.target.name]: '' }));
    }

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setIsSubmitting(true);
        router.post('/assessment/apply', form, {
            onFinish: () => setIsSubmitting(false),
            onError: (errs) => {
                setErrors(errs as Record<string, string>);
                setIsSubmitting(false);
            },
            onSuccess: () => {
                setForm({ name: '', email: '', company: '', country: '', stage: '', raise_target: '', message: '' });
            },
        });
    }

    const inputCls = (field: string) =>
        cn(
            'w-full rounded-xl border bg-white px-4 py-3 text-sm text-zinc-900 placeholder-zinc-400 transition-colors focus:ring-2 focus:ring-[#3A54A5]/10 focus:outline-none',
            errors[field] ? 'border-red-300 focus:border-red-400' : 'border-zinc-200 focus:border-[#3A54A5]/40',
        );

    if (props.flash?.success) {
        return (
            <div className="rounded-2xl border border-zinc-200/90 bg-white px-8 py-14 text-center">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#E4EAF8] text-[#2F468B]">
                    <Check className="h-6 w-6 stroke-[2.5]" aria-hidden />
                </div>
                <h3 className="font-display text-xl font-bold text-zinc-950">Application received</h3>
                <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-zinc-500">{props.flash.success}</p>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="rounded-2xl border border-zinc-200/90 bg-white p-6 sm:p-8">
            {props.flash?.error ? (
                <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-800">
                    {props.flash.error}
                </div>
            ) : null}

            <div className="grid gap-5 md:grid-cols-2">
                <div>
                    <label htmlFor="pia-name" className={labelCls}>
                        Full name *
                    </label>
                    <input
                        id="pia-name"
                        name="name"
                        type="text"
                        required
                        autoComplete="name"
                        value={form.name}
                        onChange={handleChange}
                        className={inputCls('name')}
                    />
                    {errors.name ? <p className="mt-1 text-xs text-red-600">{errors.name}</p> : null}
                </div>
                <div>
                    <label htmlFor="pia-email" className={labelCls}>
                        Email *
                    </label>
                    <input
                        id="pia-email"
                        name="email"
                        type="email"
                        required
                        autoComplete="email"
                        value={form.email}
                        onChange={handleChange}
                        className={inputCls('email')}
                    />
                    {errors.email ? <p className="mt-1 text-xs text-red-600">{errors.email}</p> : null}
                </div>
                <div>
                    <label htmlFor="pia-company" className={labelCls}>
                        Company *
                    </label>
                    <input
                        id="pia-company"
                        name="company"
                        type="text"
                        required
                        value={form.company}
                        onChange={handleChange}
                        className={inputCls('company')}
                    />
                    {errors.company ? <p className="mt-1 text-xs text-red-600">{errors.company}</p> : null}
                </div>
                <CountrySelect
                    id="pia-country"
                    label="Country of operation *"
                    value={form.country}
                    onChange={(country) => {
                        setForm((previous) => ({ ...previous, country }));
                        setErrors((previous) => ({ ...previous, country: '' }));
                    }}
                    error={errors.country}
                    required
                    labelClassName="text-sm font-medium text-zinc-700"
                />
                <div>
                    <label htmlFor="pia-stage" className={labelCls}>
                        Stage *
                    </label>
                    <select id="pia-stage" name="stage" required value={form.stage} onChange={handleChange} className={inputCls('stage')}>
                        <option value="">Select stage…</option>
                        <option value="concept">Concept — idea to MVP</option>
                        <option value="seed">Seed — trading, under $500k ARR</option>
                        <option value="growth">Growth — above $500k ARR</option>
                    </select>
                    {errors.stage ? <p className="mt-1 text-xs text-red-600">{errors.stage}</p> : null}
                </div>
                <div>
                    <label htmlFor="pia-raise-target" className={labelCls}>
                        Raise target *
                    </label>
                    <select
                        id="pia-raise-target"
                        name="raise_target"
                        required
                        value={form.raise_target}
                        onChange={handleChange}
                        className={inputCls('raise_target')}
                    >
                        <option value="">Select target…</option>
                        {RAISE_TARGETS.map((r) => (
                            <option key={r} value={r}>
                                {r}
                            </option>
                        ))}
                    </select>
                    {errors.raise_target ? <p className="mt-1 text-xs text-red-600">{errors.raise_target}</p> : null}
                </div>
            </div>

            <div className="mt-5">
                <label htmlFor="pia-message" className={labelCls}>
                    Anything else? <span className="font-normal text-zinc-500">(optional)</span>
                </label>
                <textarea
                    id="pia-message"
                    name="message"
                    rows={4}
                    value={form.message}
                    onChange={handleChange}
                    placeholder="Timeline, current raise process, or specific concerns…"
                    className={cn(inputCls('message'), 'resize-none')}
                />
                {errors.message ? <p className="mt-1 text-xs text-red-600">{errors.message}</p> : null}
            </div>

            <PrivacyConsent variant="contact" className="mt-6" />

            <LandingCta id="pia-submit" type="submit" disabled={isSubmitting} direction="up-right" className="mt-4 w-full justify-between">
                {isSubmitting ? 'Submitting…' : 'Submit application'}
            </LandingCta>
        </form>
    );
}
