import { Head, Link } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import React from 'react';

import { PinpointLogo } from '@/components/pinpoint-logo';

export default function CookiesPolicy() {
    return (
        <>
            <Head>
                <title>Cookies Policy — Pinpoint Launchpad</title>
                <meta
                    name="description"
                    content="How pinpointlaunchpad.com uses cookies and similar technologies, what they do, and how you can control them."
                />
            </Head>

            <div className="min-h-screen bg-zinc-50 font-sans text-zinc-850 antialiased">
                {/* Header */}
                <header className="sticky top-0 z-40 w-full border-b border-zinc-200 bg-white/90 backdrop-blur-md">
                    <div className="mx-auto flex h-16 max-w-4xl items-center justify-between px-6">
                        <Link href="/" className="flex items-center gap-2">
                            <PinpointLogo className="h-6 text-[#3A54A5]" />
                        </Link>
                        <Link
                            href="/"
                            className="flex items-center gap-1 text-xs font-bold text-zinc-500 transition-colors hover:text-zinc-950"
                        >
                            <ArrowLeft className="size-3.5" />
                            Back
                        </Link>
                    </div>
                </header>

                {/* Main */}
                <main className="mx-auto my-6 max-w-4xl rounded-2xl border border-zinc-200 bg-white px-6 py-12 shadow-sm md:py-16">
                    {/* Title */}
                    <div className="mb-8 border-b border-zinc-200 pb-8">
                        <h1 className="font-display mb-2 text-2xl font-black tracking-tight text-zinc-900 md:text-3xl">
                            Cookies Policy
                        </h1>
                        <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                            How pinpointlaunchpad.com uses cookies and similar technologies
                        </p>
                    </div>

                    {/* Meta */}
                    <div className="mb-8 space-y-2 rounded-xl border border-zinc-200 bg-zinc-50 p-5 text-xs font-semibold leading-relaxed text-zinc-800">
                        <p>
                            <strong className="text-zinc-900">Platform:</strong> pinpointlaunchpad.com
                        </p>
                        <p>
                            <strong className="text-zinc-900">Operator:</strong> Pinpoint Launchpad Ltd (RC 8806541), a
                            company incorporated in Nigeria
                        </p>
                        <p>
                            <strong className="text-zinc-900">Registered office:</strong> Vibranium Valley, 42 Local
                            Airport Road, Ikeja, Lagos, Nigeria
                        </p>
                        <p>
                            <strong className="text-zinc-900">Effective date:</strong> 1 August 2026
                        </p>
                        <p>
                            <strong className="text-zinc-900">Version:</strong> 1.0
                        </p>
                    </div>

                    {/* In short */}
                    <div className="mb-8 rounded-xl border border-blue-100 bg-blue-50/60 p-5 text-sm leading-relaxed text-zinc-700">
                        <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-blue-700">In short</p>
                        <p>
                            This policy explains what cookies and similar technologies we use on pinpointlaunchpad.com,
                            what they do, and how you can control them. Cookies that are strictly necessary for the
                            Platform to work are always on. All other cookies — for analytics and, where relevant,
                            marketing — are used only where you consent through our cookie banner, and you can change
                            your mind at any time. This policy supplements, and should be read with, our{' '}
                            <Link href="/privacy" className="text-[#3A54A5] underline">
                                Privacy Notice
                            </Link>
                            .
                        </p>
                    </div>

                    {/* Contents */}
                    <div className="mb-10 rounded-xl border border-zinc-200 bg-zinc-50 p-5">
                        <p className="mb-3 text-xs font-bold uppercase tracking-wider text-zinc-500">Contents</p>
                        <ol className="list-decimal space-y-1 pl-5 text-xs font-semibold text-zinc-700">
                            {[
                                'About this policy',
                                'What cookies and similar technologies are',
                                'The categories of cookies we use',
                                'The specific cookies we use',
                                'Third-party cookies',
                                'How we obtain and record your consent',
                                'How to manage or withdraw consent',
                                'Do-not-track and personal data',
                                'Changes to this policy',
                                'Contact us',
                            ].map((item, i) => (
                                <li key={i}>{item}</li>
                            ))}
                        </ol>
                    </div>

                    {/* Clauses */}
                    <div className="space-y-8 text-sm leading-relaxed text-zinc-700 md:text-[14.5px]">
                        {/* 1 */}
                        <section className="space-y-3">
                            <h2 className="text-base font-bold text-zinc-900">1. About this policy</h2>
                            <p>
                                1.1 This Cookies Policy is issued by Pinpoint Launchpad Ltd ("Pinpoint", "we", "us",
                                "our") and applies to the website and platform at pinpointlaunchpad.com (the
                                "Platform"), including the Self-Scan, and the account areas used for the PIA, PIW, and
                                PIN.
                            </p>
                            <p>
                                1.2 Cookies can involve the processing of personal data. Where they do, we act as data
                                controller and process that data in accordance with the Nigeria Data Protection Act 2023
                                (the "NDPA") and our{' '}
                                <Link href="/privacy" className="text-[#3A54A5] underline">
                                    Privacy Notice
                                </Link>
                                .
                            </p>
                            <p>
                                1.3 By using the Platform and, where required, by accepting non-essential cookies
                                through our cookie banner, you agree to the use of cookies as described in this policy.
                                You are not required to accept non-essential cookies, and the Platform will still
                                function if you decline them.
                            </p>
                        </section>

                        {/* 2 */}
                        <section className="space-y-3">
                            <h2 className="text-base font-bold text-zinc-900">
                                2. What cookies and similar technologies are
                            </h2>
                            <p>
                                2.1 A cookie is a small text file that a website places on your device when you visit.
                                It lets the website recognise your device, remember your actions and preferences, and
                                understand how the Platform is used.
                            </p>
                            <p>
                                2.2 We also use similar technologies, including pixels, tags, local storage, and
                                software development kits. In this policy, references to "cookies" include these
                                technologies.
                            </p>
                            <p>2.3 Cookies may be:</p>
                            <ul className="list-disc space-y-2 pl-6">
                                <li>
                                    (a) <strong>session or persistent</strong> — a session cookie is deleted when you
                                    close your browser; a persistent cookie remains for a set period or until you delete
                                    it; and
                                </li>
                                <li>
                                    (b) <strong>first-party or third-party</strong> — a first-party cookie is set by
                                    Pinpoint; a third-party cookie is set by another organisation whose service we use,
                                    such as an analytics or payment provider.
                                </li>
                            </ul>
                        </section>

                        {/* 3 */}
                        <section className="space-y-3">
                            <h2 className="text-base font-bold text-zinc-900">
                                3. The categories of cookies we use
                            </h2>
                            <p>
                                3.1 We group cookies into four categories. Only the first is always on; the others
                                operate on the basis described.
                            </p>

                            <div className="overflow-x-auto">
                                <table className="w-full border-collapse text-xs md:text-sm">
                                    <thead>
                                        <tr className="bg-zinc-100">
                                            <th className="border border-zinc-200 px-4 py-2 text-left font-bold text-zinc-800">
                                                Category
                                            </th>
                                            <th className="border border-zinc-200 px-4 py-2 text-left font-bold text-zinc-800">
                                                What they do
                                            </th>
                                            <th className="border border-zinc-200 px-4 py-2 text-left font-bold text-zinc-800">
                                                Basis
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {[
                                            [
                                                'Strictly necessary',
                                                'Enable core functions: security, session management, load balancing, remembering items you have entered during the Self-Scan or an application, and honouring your cookie choices. The Platform cannot work properly without them.',
                                                'Always on. No consent required, as permitted by the NDPA for cookies strictly necessary to provide a service you have requested.',
                                            ],
                                            [
                                                'Functional',
                                                'Remember choices you make, such as language, and improve your experience. If disabled, some features may be less convenient.',
                                                'Consent.',
                                            ],
                                            [
                                                'Analytics / performance',
                                                'Help us understand how visitors use the Platform — which pages are visited, how the Self-Scan is completed, and where people drop off — so we can improve the Services. Used in aggregated form.',
                                                'Consent.',
                                            ],
                                            [
                                                'Marketing',
                                                'Measure the effectiveness of our communications and, where used, deliver or measure relevant advertising about our Services. May be set by third parties.',
                                                'Consent.',
                                            ],
                                        ].map(([cat, desc, basis], i) => (
                                            <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-zinc-50/50'}>
                                                <td className="border border-zinc-200 px-4 py-3 font-semibold text-zinc-800 align-top whitespace-nowrap">
                                                    {cat}
                                                </td>
                                                <td className="border border-zinc-200 px-4 py-3 text-zinc-700 align-top">
                                                    {desc}
                                                </td>
                                                <td className="border border-zinc-200 px-4 py-3 text-zinc-700 align-top">
                                                    {basis}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </section>

                        {/* 4 */}
                        <section className="space-y-3">
                            <h2 className="text-base font-bold text-zinc-900">4. The specific cookies we use</h2>
                            <p>
                                4.1 The table below lists the cookies currently in use. It is illustrative and must be
                                completed and kept current by our development team; the live cookie banner reflects the
                                actual position at any time.
                            </p>

                            <div className="overflow-x-auto">
                                <table className="w-full border-collapse text-xs md:text-sm">
                                    <thead>
                                        <tr className="bg-zinc-100">
                                            <th className="border border-zinc-200 px-4 py-2 text-left font-bold text-zinc-800">
                                                Cookie
                                            </th>
                                            <th className="border border-zinc-200 px-4 py-2 text-left font-bold text-zinc-800">
                                                Type
                                            </th>
                                            <th className="border border-zinc-200 px-4 py-2 text-left font-bold text-zinc-800">
                                                Purpose
                                            </th>
                                            <th className="border border-zinc-200 px-4 py-2 text-left font-bold text-zinc-800">
                                                Duration
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {[
                                            [
                                                'pin_session',
                                                'Necessary · first-party',
                                                'Maintains your session and security while you use the Platform.',
                                                'Session',
                                            ],
                                            [
                                                'pin_consent',
                                                'Necessary · first-party',
                                                'Stores your cookie preferences so we do not ask on every visit.',
                                                '12 months',
                                            ],
                                            [
                                                'pin_scan_progress',
                                                'Necessary · first-party',
                                                'Remembers your answers as you move through the Self-Scan.',
                                                'Session',
                                            ],
                                            [
                                                'pin_lang',
                                                'Functional · first-party',
                                                'Remembers your language or display preference.',
                                                '6 months',
                                            ],
                                            [
                                                '_ga / _ga_[•]',
                                                'Analytics · third-party',
                                                'Distinguishes users and measures Platform usage.',
                                                'Up to 24 months',
                                            ],
                                            [
                                                '[analytics id]',
                                                'Analytics · third-party',
                                                'Aggregated performance and drop-off analysis.',
                                                '[•]',
                                            ],
                                            [
                                                '[marketing id]',
                                                'Marketing · third-party',
                                                'Measures communications and, where used, advertising.',
                                                '[•]',
                                            ],
                                        ].map(([name, type, purpose, duration], i) => (
                                            <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-zinc-50/50'}>
                                                <td className="border border-zinc-200 px-4 py-3 font-mono text-[11px] font-semibold text-zinc-800 align-top whitespace-nowrap">
                                                    {name}
                                                </td>
                                                <td className="border border-zinc-200 px-4 py-3 text-zinc-600 align-top whitespace-nowrap text-xs">
                                                    {type}
                                                </td>
                                                <td className="border border-zinc-200 px-4 py-3 text-zinc-700 align-top">
                                                    {purpose}
                                                </td>
                                                <td className="border border-zinc-200 px-4 py-3 text-zinc-600 align-top whitespace-nowrap text-xs">
                                                    {duration}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            <p>
                                4.2 <strong>Payment processing.</strong> Where provided and you purchase a Service, our
                                payment provider may set its own cookies to process the transaction securely. These are
                                governed by that provider's own cookie and privacy notices.
                            </p>
                        </section>

                        {/* 5 */}
                        <section className="space-y-3">
                            <h2 className="text-base font-bold text-zinc-900">5. Third-party cookies</h2>
                            <p>
                                5.1 Some cookies are set by third parties who provide services to us, such as
                                analytics, payment, and content-delivery providers. We do not control these third
                                parties' cookies, and their use of any data they collect is governed by their own
                                policies.
                            </p>
                            <p>
                                5.2 Where a third-party cookie is not strictly necessary, we set it only after you have
                                consented. We keep our list of third-party providers under review and update the tables
                                above accordingly.
                            </p>
                        </section>

                        {/* 6 */}
                        <section className="space-y-3">
                            <h2 className="text-base font-bold text-zinc-900">
                                6. How we obtain and record your consent
                            </h2>
                            <p>
                                6.1 When you first visit the Platform, a cookie banner tells you that we use cookies
                                and lets you accept all, reject all non-essential cookies, or choose which categories
                                to allow. Strictly necessary cookies are set regardless, as they are required to
                                provide the Platform.
                            </p>
                            <p>
                                6.2 We do not set functional, analytics, or marketing cookies until you have given
                                consent for the relevant category. We record your choice and will not ask again for the
                                life of the consent cookie, unless our cookies change materially or you clear your
                                cookies.
                            </p>
                            <p>
                                6.3 You can withdraw or change your consent at any time, as described in clause 7.
                                Withdrawing consent does not affect anything done before you withdrew it.
                            </p>
                        </section>

                        {/* 7 */}
                        <section className="space-y-3">
                            <h2 className="text-base font-bold text-zinc-900">
                                7. How to manage or withdraw consent
                            </h2>
                            <p>7.1 You can control cookies in the following ways:</p>
                            <ul className="list-disc space-y-2 pl-6">
                                <li>
                                    (a) <strong>Our cookie settings.</strong> Use the "Cookie settings" link, available
                                    in the footer of the Platform, to review and change your choices at any time.
                                </li>
                                <li>
                                    (b) <strong>Your browser.</strong> Most browsers let you block or delete cookies
                                    through their settings. The help function of your browser explains how. Blocking
                                    all cookies may stop parts of the Platform working.
                                </li>
                                <li>
                                    (c) <strong>Third-party opt-outs.</strong> Some analytics and advertising providers
                                    offer their own opt-out tools; where we use such providers, we identify them in the
                                    cookie banner.
                                </li>
                            </ul>
                            <p>
                                7.2 Because your preference is itself stored in a cookie, if you clear your cookies or
                                use a different browser or device, you will need to set your preference again.
                            </p>
                        </section>

                        {/* 8 */}
                        <section className="space-y-3">
                            <h2 className="text-base font-bold text-zinc-900">8. Do-not-track and personal data</h2>
                            <p>
                                8.1 Some browsers send a "do not track" signal. There is no common standard for how
                                such signals should be treated, and the Platform does not currently respond to them. You
                                can still control cookies as described in this policy.
                            </p>
                            <p>
                                8.2 Where cookies process personal data, that processing is described in our{' '}
                                <Link href="/privacy" className="text-[#3A54A5] underline">
                                    Privacy Notice
                                </Link>
                                , including the lawful basis, retention, and your rights under the NDPA. Your rights to
                                access, rectify, erase, and object apply to personal data collected through cookies.
                            </p>
                        </section>

                        {/* 9 */}
                        <section className="space-y-3">
                            <h2 className="text-base font-bold text-zinc-900">9. Changes to this policy</h2>
                            <p>
                                9.1 We may update this policy as our use of cookies changes or as the law requires.
                                The current version is always available on the Platform, and the effective date appears
                                at the top. Where a change is material, we will seek fresh consent through the cookie
                                banner.
                            </p>
                        </section>

                        {/* 10 */}
                        <section className="space-y-3">
                            <h2 className="text-base font-bold text-zinc-900">10. Contact us</h2>
                            <p>
                                10.1 If you have any question about our use of cookies, please contact:
                            </p>
                            <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-5 text-sm font-semibold text-zinc-700 space-y-1">
                                <p className="font-bold text-zinc-900">Data Protection Officer</p>
                                <p>Pinpoint Launchpad Ltd</p>
                                <p>Vibranium Valley, 42 Local Airport Road, Ikeja, Lagos, Nigeria</p>
                                <a href="mailto:dpo@pinpointlaunchpad.com" className="text-[#3A54A5] underline">
                                    dpo@pinpointlaunchpad.com
                                </a>
                            </div>
                        </section>

                        <div className="border-t border-zinc-200 pt-6 text-xs font-semibold text-zinc-500">
                            This version was last updated on 1 August 2026.
                        </div>
                    </div>
                </main>

                <footer className="border-t border-zinc-200 bg-white py-8 text-center text-xs font-semibold text-zinc-400">
                    <p>© {new Date().getFullYear()} Pinpoint Launchpad Ltd. All rights reserved.</p>
                    <div className="mt-2 flex justify-center gap-4">
                        <Link href="/terms" className="hover:text-zinc-700 transition-colors">
                            Terms of Service
                        </Link>
                        <Link href="/privacy" className="hover:text-zinc-700 transition-colors">
                            Privacy Notice
                        </Link>
                        <Link href="/investor-terms" className="hover:text-zinc-700 transition-colors">
                            Investor Terms
                        </Link>
                    </div>
                </footer>
            </div>
        </>
    );
}
