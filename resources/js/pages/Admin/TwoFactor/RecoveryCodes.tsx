import { Head, Link } from '@inertiajs/react';
import { Check, Copy, KeyRound } from 'lucide-react';
import { useState } from 'react';

import { TwoFactorShell } from '@/components/admin/two-factor-shell';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';

interface RecoveryCodesProps {
    recoveryCodes: string[];
    continueUrl: string;
}

export default function RecoveryCodes({ recoveryCodes, continueUrl }: RecoveryCodesProps) {
    const [copied, setCopied] = useState(false);

    async function copyCodes() {
        await navigator.clipboard.writeText(recoveryCodes.join('\n'));
        setCopied(true);
    }

    return (
        <>
            <Head title="Save your recovery codes — Pinpoint" />
            <TwoFactorShell
                title="Save your recovery codes"
                description="Your authenticator is connected. Keep these codes somewhere secure in case you lose access to your phone."
                footer={
                    <Button asChild className="w-full">
                        <Link href={continueUrl}>I have saved the codes</Link>
                    </Button>
                }
            >
                <div className="flex flex-col gap-6">
                    <Alert>
                        <KeyRound aria-hidden="true" />
                        <AlertTitle>Each code works once</AlertTitle>
                        <AlertDescription>This is the only time all codes will be shown together.</AlertDescription>
                    </Alert>

                    <div className="grid grid-cols-1 gap-2 rounded-xl border bg-muted/40 p-4 sm:grid-cols-2">
                        {recoveryCodes.map((code) => (
                            <code key={code} className="rounded-md bg-background px-3 py-2 text-center text-sm font-semibold tracking-wide">
                                {code}
                            </code>
                        ))}
                    </div>

                    <Button type="button" variant="outline" onClick={copyCodes}>
                        {copied ? <Check data-icon="inline-start" /> : <Copy data-icon="inline-start" />}
                        {copied ? 'Copied' : 'Copy all codes'}
                    </Button>
                </div>
            </TwoFactorShell>
        </>
    );
}
