import InputError from '@/components/input-error';
import { PinpointLogo } from '@/components/pinpoint-logo';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Head, Link, useForm } from '@inertiajs/react';
import { LockKeyhole } from 'lucide-react';
import { FormEvent } from 'react';

const inputClassName =
    'h-12 rounded-xl border-zinc-200 bg-white text-zinc-950 placeholder:text-zinc-400 focus-visible:border-[#3A54A5] focus-visible:ring-[#3A54A5]/20';

export default function Login({ status }: { status?: string }) {
    const form = useForm({ email: '', password: '', remember: false });
    const submit = (event: FormEvent) => {
        event.preventDefault();
        form.post(route('investor.login.store'), { onFinish: () => form.reset('password') });
    };
    return (
        <main className="grid min-h-screen place-items-center bg-[#f4f7ff] p-6 text-zinc-950">
            <Head title="Investor login" />
            <section className="w-full max-w-md rounded-2xl border border-white/80 bg-white p-8 shadow-[0_20px_55px_rgba(33,56,120,0.10)]">
                <Link href={route('investor.index')}>
                    <PinpointLogo height={24} />
                </Link>
                <div className="mt-9 flex size-11 items-center justify-center rounded-xl bg-[#3A54A5]/10 text-[#3A54A5]">
                    <LockKeyhole />
                </div>
                <h1 className="mt-5 text-2xl font-black tracking-tight text-zinc-950">Investor login</h1>
                <p className="mt-2 text-sm leading-6 text-zinc-600">Use the credentials from your activated PIN account.</p>
                {status && <p className="mt-5 rounded-xl bg-emerald-50 p-3 text-sm text-emerald-700">{status}</p>}

                <form className="mt-7 flex flex-col gap-5" onSubmit={submit}>
                    <div className="flex flex-col gap-2">
                        <Label className="text-zinc-900" htmlFor="email">
                            Email address
                        </Label>
                        <Input
                            className={inputClassName}
                            id="email"
                            type="email"
                            value={form.data.email}
                            onChange={(e) => form.setData('email', e.target.value)}
                            autoComplete="email"
                        />
                        <InputError message={form.errors.email} />
                    </div>

                    <div className="flex flex-col gap-2">
                        <div className="flex items-center justify-between">
                            <Label className="text-zinc-900" htmlFor="password">
                                Password
                            </Label>
                            <Link href={route('investor.password.request')} className="text-[13px] font-semibold text-[#3A54A5] hover:underline">
                                Forgot password?
                            </Link>
                        </div>
                        <Input
                            className={inputClassName}
                            id="password"
                            type="password"
                            value={form.data.password}
                            onChange={(e) => form.setData('password', e.target.value)}
                            autoComplete="current-password"
                        />
                        <InputError message={form.errors.password} />
                    </div>

                    <Button type="submit" disabled={form.processing} className="rounded-xl bg-[#3A54A5] font-bold hover:bg-[#2D4182]">
                        {form.processing ? 'Signing in…' : 'Log in'}
                    </Button>
                </form>

                <p className="mt-6 text-center text-sm text-zinc-600">
                    New to PIN?{' '}
                    <Link href={route('investor.onboarding')} className="font-semibold text-[#3A54A5]">
                        Apply to join
                    </Link>
                </p>
            </section>
        </main>
    );
}
