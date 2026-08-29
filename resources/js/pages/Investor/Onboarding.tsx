import { Head, Link, useForm } from '@inertiajs/react';
import { CheckCircle2, ShieldCheck } from 'lucide-react';

import InputError from '@/components/input-error';
import { PinpointLogo } from '@/components/pinpoint-logo';
import SideRays from '@/components/SideRays';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

type InvestorType = 'individual' | 'corporate';
const inputClassName =
    'h-12 rounded-xl border-zinc-200 bg-white text-zinc-950 placeholder:text-zinc-400 focus-visible:border-[#3A54A5] focus-visible:ring-[#3A54A5]/20';

export default function Onboarding() {
    const { data, setData, post, processing, errors } = useForm({
        investor_type: 'individual' as InvestorType,
        full_name: '',
        email: '',
        phone: '',
        address: '',
        company_name: '',
        password: '',
        password_confirmation: '',
        terms_agreed: false,
        aml_confirmed: false,
    });

    const isCorporate = data.investor_type === 'corporate';

    function submit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        post(route('investor.onboarding.store'));
    }

    return (
        <>
            <Head title="Investor onboarding" />
            <div className="relative min-h-screen overflow-hidden bg-[#f4f7ff] text-zinc-900">
                <div className="pointer-events-none fixed inset-0 opacity-35">
                    <SideRays
                        rayColor1="#3A54A5"
                        rayColor2="#BFDBFE"
                        origin="top-left"
                        speed={1.4}
                        intensity={0.8}
                        spread={2}
                        tilt={0}
                        saturation={1.1}
                        blend={0.24}
                        falloff={2.3}
                        opacity={0.25}
                    />
                </div>

                <header className="relative z-10 mx-auto flex max-w-7xl items-center justify-between px-6 py-7">
                    <Link href={route('investor.index')} aria-label="Pinpoint Investor Network home">
                        <PinpointLogo height={24} />
                    </Link>
                    <Link
                        href={route('investor.login')}
                        className="rounded-full px-4 py-2 text-sm font-semibold text-[#3A54A5] transition hover:bg-white/70 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3A54A5]"
                    >
                        Log in
                    </Link>
                </header>

                <main className="relative z-10 mx-auto grid max-w-7xl gap-6 px-6 pb-12 lg:grid-cols-[minmax(0,1.65fr)_minmax(320px,0.85fr)]">
                    <section className="rounded-2xl border border-white/80 bg-white p-6 shadow-[0_20px_55px_rgba(33,56,120,0.10)] sm:p-9">
                        <p className="text-xs font-bold tracking-[0.16em] text-[#3A54A5] uppercase">PIN membership</p>
                        <h1 className="mt-3 text-3xl font-black tracking-tight text-zinc-950 sm:text-4xl">Investor Registration</h1>
                        <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-600">
                            Create your profile to join the Pinpoint Investor Network. You will be able to log in immediately and proceed to KYC
                            verification.
                        </p>

                        <form className="mt-9 flex flex-col gap-7" onSubmit={submit}>
                            <fieldset>
                                <legend className="text-sm font-bold text-zinc-900">Investor type</legend>
                                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                                    {(['individual', 'corporate'] as const).map((type) => (
                                        <button
                                            key={type}
                                            type="button"
                                            onClick={() => setData('investor_type', type)}
                                            className={`rounded-xl border p-4 text-left transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3A54A5] ${data.investor_type === type ? 'border-[#3A54A5] bg-[#3A54A5]/5' : 'border-zinc-200 bg-white hover:border-zinc-300'}`}
                                        >
                                            <span className="block text-sm font-bold text-zinc-950 capitalize">{type}</span>
                                            <span className="mt-1 block text-xs leading-5 text-zinc-500">
                                                {type === 'individual' ? 'Investing in a personal capacity.' : 'Representing a company or business.'}
                                            </span>
                                        </button>
                                    ))}
                                </div>
                                <InputError className="mt-2" message={errors.investor_type} />
                            </fieldset>

                            <div className="grid gap-5 sm:grid-cols-2">
                                <div className="flex flex-col gap-2 sm:col-span-2">
                                    <Label htmlFor="full_name">{isCorporate ? 'Contact person full name' : 'Full name'}</Label>
                                    <Input
                                        className={inputClassName}
                                        id="full_name"
                                        value={data.full_name}
                                        onChange={(event) => setData('full_name', event.target.value)}
                                        autoComplete="name"
                                    />
                                    <InputError message={errors.full_name} />
                                </div>
                                {isCorporate && (
                                    <div className="flex flex-col gap-2 sm:col-span-2">
                                        <Label htmlFor="company_name">Registered company or business name</Label>
                                        <Input
                                            className={inputClassName}
                                            id="company_name"
                                            value={data.company_name}
                                            onChange={(event) => setData('company_name', event.target.value)}
                                            autoComplete="organization"
                                        />
                                        <InputError message={errors.company_name} />
                                    </div>
                                )}
                                <div className="flex flex-col gap-2">
                                    <Label htmlFor="email">Email address</Label>
                                    <Input
                                        className={inputClassName}
                                        id="email"
                                        type="email"
                                        value={data.email}
                                        onChange={(event) => setData('email', event.target.value)}
                                        autoComplete="email"
                                    />
                                    <InputError message={errors.email} />
                                </div>
                                <div className="flex flex-col gap-2">
                                    <Label htmlFor="phone">Phone number</Label>
                                    <Input
                                        className={inputClassName}
                                        id="phone"
                                        type="tel"
                                        value={data.phone}
                                        onChange={(event) => setData('phone', event.target.value)}
                                        autoComplete="tel"
                                    />
                                    <InputError message={errors.phone} />
                                </div>
                                <div className="flex flex-col gap-2 sm:col-span-2">
                                    <Label htmlFor="address">{isCorporate ? 'Company address' : 'Address'}</Label>
                                    <Input
                                        className={inputClassName}
                                        id="address"
                                        value={data.address}
                                        onChange={(event) => setData('address', event.target.value)}
                                        autoComplete="street-address"
                                    />
                                    <InputError message={errors.address} />
                                </div>
                                <div className="flex flex-col gap-2">
                                    <Label htmlFor="password">Create password</Label>
                                    <Input
                                        className={inputClassName}
                                        id="password"
                                        type="password"
                                        value={data.password}
                                        onChange={(event) => setData('password', event.target.value)}
                                        autoComplete="new-password"
                                    />
                                    <InputError message={errors.password} />
                                </div>
                                <div className="flex flex-col gap-2">
                                    <Label htmlFor="password_confirmation">Confirm password</Label>
                                    <Input
                                        className={inputClassName}
                                        id="password_confirmation"
                                        type="password"
                                        value={data.password_confirmation}
                                        onChange={(event) => setData('password_confirmation', event.target.value)}
                                        autoComplete="new-password"
                                    />
                                </div>
                            </div>

                            <div className="flex flex-col gap-4 border-t border-zinc-100 pt-6">
                                <label className="flex items-start gap-3 text-sm leading-5 text-zinc-600">
                                    <Checkbox checked={data.terms_agreed} onCheckedChange={(checked) => setData('terms_agreed', checked === true)} />
                                    <span>
                                        I accept the{' '}
                                        <Link href={route('investor-terms')} className="font-semibold text-[#3A54A5] underline underline-offset-2">
                                            Investor Terms
                                        </Link>
                                        .
                                    </span>
                                </label>
                                <InputError message={errors.terms_agreed} />
                                <label className="flex items-start gap-3 text-sm leading-5 text-zinc-600">
                                    <Checkbox
                                        checked={data.aml_confirmed}
                                        onCheckedChange={(checked) => setData('aml_confirmed', checked === true)}
                                    />
                                    <span>
                                        I confirm that the information supplied is accurate and that I will comply with anti-money-laundering
                                        requirements.
                                    </span>
                                </label>
                                <InputError message={errors.aml_confirmed} />
                            </div>
                            <Button
                                type="submit"
                                size="lg"
                                disabled={processing}
                                className="w-full rounded-xl bg-[#3A54A5] font-bold hover:bg-[#2D4182] sm:w-auto"
                            >
                                {processing ? 'Creating account…' : 'Create account'}
                            </Button>
                        </form>
                    </section>

                    <aside className="rounded-2xl border border-[#3A54A5]/12 bg-[#fbfcff] p-6 shadow-[0_20px_55px_rgba(33,56,120,0.07)] sm:p-8">
                        <div className="flex size-11 items-center justify-center rounded-xl bg-[#3A54A5]/10 text-[#3A54A5]">
                            <ShieldCheck aria-hidden="true" />
                        </div>
                        <h2 className="mt-6 text-xl font-extrabold tracking-tight text-zinc-950">What happens next</h2>
                        <ol className="mt-7 flex flex-col gap-6">
                            {[
                                'Create your account',
                                'Access your investor dashboard',
                                'Complete KYC verification',
                                'Unlock protected startup materials',
                            ].map((item, index) => (
                                <li key={item} className="flex gap-3">
                                    <span
                                        className={`flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${index === 0 ? 'bg-[#3A54A5] text-white' : 'border border-zinc-200 bg-white text-zinc-500'}`}
                                    >
                                        {index + 1}
                                    </span>
                                    <span className="pt-1 text-sm font-semibold text-zinc-700">{item}</span>
                                </li>
                            ))}
                        </ol>
                        <div className="mt-9 flex gap-3 rounded-xl bg-[#3A54A5]/6 p-4 text-sm leading-5 text-zinc-600">
                            <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-[#3A54A5]" aria-hidden="true" />
                            <p>Account creation is instant. Your KYC documents will be reviewed by our compliance team after submission.</p>
                        </div>
                    </aside>
                </main>
            </div>
        </>
    );
}
