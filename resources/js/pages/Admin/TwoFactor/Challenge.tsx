import { Head, useForm } from '@inertiajs/react';
import { KeyRound, LoaderCircle, Smartphone } from 'lucide-react';
import { type FormEventHandler, useState } from 'react';

import { TwoFactorShell } from '@/components/admin/two-factor-shell';
import { Button } from '@/components/ui/button';
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';

export default function TwoFactorChallenge({ email }: { email: string }) {
    const [useRecoveryCode, setUseRecoveryCode] = useState(false);
    const { data, setData, post, processing, errors, reset, clearErrors } = useForm({
        code: '',
        recovery_code: '',
    });

    const submit: FormEventHandler = (event) => {
        event.preventDefault();
        post(route('admin.two-factor.challenge.store'));
    };

    function switchMethod() {
        setUseRecoveryCode((current) => !current);
        reset('code', 'recovery_code');
        clearErrors();
    }

    return (
        <>
            <Head title="Verify your sign in — Pinpoint" />
            <TwoFactorShell
                title="Verify your sign in"
                description={`Enter the code for ${email} before continuing to the operations portal.`}
                authenticated={false}
            >
                <form onSubmit={submit}>
                    <FieldGroup>
                        {useRecoveryCode ? (
                            <Field data-invalid={Boolean(errors.recovery_code)}>
                                <FieldLabel htmlFor="recovery_code">
                                    <KeyRound aria-hidden="true" />
                                    Recovery code
                                </FieldLabel>
                                <Input
                                    id="recovery_code"
                                    value={data.recovery_code}
                                    onChange={(event) => setData('recovery_code', event.target.value)}
                                    autoComplete="one-time-code"
                                    autoFocus
                                    placeholder="Enter one of your saved codes"
                                    aria-invalid={Boolean(errors.recovery_code)}
                                />
                                <FieldDescription>Each recovery code can only be used once.</FieldDescription>
                                <FieldError>{errors.recovery_code}</FieldError>
                            </Field>
                        ) : (
                            <Field data-invalid={Boolean(errors.code)}>
                                <FieldLabel htmlFor="code">
                                    <Smartphone aria-hidden="true" />
                                    Authenticator code
                                </FieldLabel>
                                <Input
                                    id="code"
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
                        )}

                        <div className="flex flex-col gap-2">
                            <Button
                                type="submit"
                                size="lg"
                                disabled={processing || (useRecoveryCode ? data.recovery_code.trim() === '' : data.code.length !== 6)}
                            >
                                {processing ? <LoaderCircle data-icon="inline-start" className="animate-spin" /> : null}
                                {processing ? 'Verifying' : 'Verify and continue'}
                            </Button>
                            <Button type="button" variant="ghost" onClick={switchMethod}>
                                {useRecoveryCode ? 'Use authenticator code' : 'Use a recovery code'}
                            </Button>
                        </div>
                    </FieldGroup>
                </form>
            </TwoFactorShell>
        </>
    );
}
