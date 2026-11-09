import { Head, useForm } from '@inertiajs/react';
import { LoaderCircle, Smartphone } from 'lucide-react';
import { type FormEventHandler } from 'react';

import { TwoFactorShell } from '@/components/admin/two-factor-shell';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';

interface SetupProps {
    qrCode: string;
    email: string;
}

export default function TwoFactorSetup({ qrCode, email }: SetupProps) {
    const { data, setData, post, processing, errors } = useForm({ code: '' });

    const submit: FormEventHandler = (event) => {
        event.preventDefault();
        post(route('admin.two-factor.confirm'));
    };

    return (
        <>
            <Head title="Set up two-factor authentication — Pinpoint" />
            <TwoFactorShell
                title="Protect your admin account"
                description="Connect an authenticator app before continuing to the operations portal. This takes about a minute."
            >
                <div className="flex flex-col gap-7">
                    <section className="grid gap-5 sm:grid-cols-[auto_1fr] sm:items-center">
                        <div className="mx-auto rounded-xl border bg-background p-3 shadow-sm sm:mx-0">
                            <img src={qrCode} alt="QR code for setting up two-factor authentication" className="size-44" />
                        </div>
                        <div className="flex flex-col gap-3">
                            <p className="text-sm font-semibold">1. Scan this QR code</p>
                            <p className="text-sm leading-relaxed text-muted-foreground">
                                Open any authenticator app, add a new account, then scan the code. It will appear as {email}.
                            </p>
                            <Alert>
                                <Smartphone aria-hidden="true" />
                                <AlertDescription>Google Authenticator, Microsoft Authenticator, 1Password, and similar apps all work.</AlertDescription>
                            </Alert>
                        </div>
                    </section>

                    <form onSubmit={submit}>
                        <FieldGroup>
                            <Field data-invalid={Boolean(errors.code)}>
                                <FieldLabel htmlFor="code">2. Enter the six-digit code</FieldLabel>
                                <Input
                                    id="code"
                                    name="code"
                                    value={data.code}
                                    onChange={(event) => setData('code', event.target.value.replace(/\D/g, '').slice(0, 6))}
                                    inputMode="numeric"
                                    autoComplete="one-time-code"
                                    autoFocus
                                    maxLength={6}
                                    placeholder="000000"
                                    aria-invalid={Boolean(errors.code)}
                                    className="h-12 text-center font-mono text-lg tracking-[0.35em]"
                                />
                                <FieldDescription>The code changes every 30 seconds.</FieldDescription>
                                <FieldError>{errors.code}</FieldError>
                            </Field>

                            <Button type="submit" size="lg" disabled={processing || data.code.length !== 6}>
                                {processing ? <LoaderCircle data-icon="inline-start" className="animate-spin" /> : null}
                                {processing ? 'Checking code' : 'Confirm and continue'}
                            </Button>
                        </FieldGroup>
                    </form>
                </div>
            </TwoFactorShell>
        </>
    );
}
