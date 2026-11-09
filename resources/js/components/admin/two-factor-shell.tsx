import { router } from '@inertiajs/react';
import { LogOut, ShieldCheck } from 'lucide-react';
import { type ReactNode } from 'react';

import { PinpointLogo } from '@/components/pinpoint-logo';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

interface TwoFactorShellProps {
    title: string;
    description: string;
    children: ReactNode;
    footer?: ReactNode;
}

export function TwoFactorShell({ title, description, children, footer }: TwoFactorShellProps) {
    return (
        <main className="flex min-h-svh items-center justify-center bg-muted/40 px-4 py-10 sm:px-6">
            <div className="flex w-full max-w-xl flex-col gap-6">
                <div className="flex items-center justify-between gap-4 px-1">
                    <PinpointLogo height={24} />
                    <Button variant="ghost" size="sm" onClick={() => router.post(route('logout'))}>
                        <LogOut data-icon="inline-start" />
                        Sign out
                    </Button>
                </div>

                <Card className="overflow-hidden rounded-2xl">
                    <CardHeader className="gap-4 border-b bg-background px-6 py-6 sm:px-8">
                        <div className="flex size-11 items-center justify-center rounded-full bg-primary/10 text-primary">
                            <ShieldCheck aria-hidden="true" />
                        </div>
                        <div className="flex flex-col gap-2">
                            <CardTitle className="text-xl">{title}</CardTitle>
                            <CardDescription className="max-w-md leading-relaxed">{description}</CardDescription>
                        </div>
                    </CardHeader>
                    <CardContent className="px-6 py-7 sm:px-8">{children}</CardContent>
                    {footer ? <CardFooter className="border-t bg-muted/30 px-6 py-5 sm:px-8">{footer}</CardFooter> : null}
                </Card>

                <p className="text-center text-xs text-muted-foreground">This security step applies only to Pinpoint operations staff.</p>
            </div>
        </main>
    );
}
