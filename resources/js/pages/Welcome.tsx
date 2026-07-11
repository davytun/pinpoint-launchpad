import { Head } from '@inertiajs/react';

export default function Welcome() {
    return (
        <>
            <Head title="Welcome" />
            <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-6">
                <div className="text-center space-y-4">
                    <h1 className="text-4xl font-display font-bold tracking-tight">Welcome</h1>
                    <p className="text-muted-foreground max-w-sm mx-auto">
                        This is your new landing page template.
                    </p>
                </div>
            </div>
        </>
    );
}
