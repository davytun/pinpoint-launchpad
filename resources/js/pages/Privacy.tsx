import { Head, Link } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import React from 'react';

import { PinpointLogo } from '@/components/pinpoint-logo';

export default function Privacy() {
    return (
        <>
            <Head>
                <title>Privacy Notice — Pinpoint Launchpad</title>
                <meta
                    name="description"
                    content="How Pinpoint Launchpad collects, uses, and protects your personal data."
                />
            </Head>

            <div className="min-h-screen bg-zinc-50 font-sans text-zinc-850 antialiased">
                {/* Header */}
                <header className="sticky top-0 z-40 w-full border-b border-zinc-200 bg-white/90 backdrop-blur-md">
                    <div className="mx-auto flex h-16 max-w-4xl items-center justify-between px-6">
                        <Link href="/" className="flex items-center gap-2 group">
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

                {/* Main Content Area */}
                <main className="mx-auto my-6 max-w-4xl rounded-2xl border border-zinc-200 bg-white px-6 py-12 shadow-sm md:py-16">
                    {/* Title */}
                    <div className="mb-8 border-b border-zinc-200 pb-8">
                        <h1 className="font-display mb-2 text-2xl font-black tracking-tight text-zinc-900 md:text-3xl">
                            Privacy Notice
                        </h1>
                        <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                            How Pinpoint collects, uses, and protects your personal data
                        </p>
                    </div>

                    {/* Meta info box */}
                    <div className="mb-8 space-y-2 rounded-xl border border-zinc-200 bg-zinc-50 p-5 text-xs font-semibold leading-relaxed text-zinc-800">
                        <p>
                            <strong className="text-zinc-900">Platform:</strong> pinpointlaunchpad.com
                        </p>
                        <p>
                            <strong className="text-zinc-900">Data controller:</strong> Pinpoint Launchpad Ltd (RC
                            8806541), a company incorporated in Nigeria
                        </p>
                        <p>
                            <strong className="text-zinc-900">Registered office:</strong> Vibranium Valley, 42 Local
                            Airport Road, Ikeja, Lagos, Nigeria
                        </p>
                        <p>
                            <strong className="text-zinc-900">Data Protection Officer:</strong> Gabriel Eze, reachable
                            at{' '}
                            <a href="mailto:dpo@pinpointlaunchpad.com" className="text-[#3A54A5] underline">
                                dpo@pinpointlaunchpad.com
                            </a>
                        </p>
                        <p>
                            <strong className="text-zinc-900">Effective date:</strong> 1 August 2026
                        </p>
                        <p>
                            <strong className="text-zinc-900">Version:</strong> 1.0
                        </p>
                    </div>

                    {/* Clauses */}
                    <div className="space-y-8 text-sm leading-relaxed text-zinc-700 md:text-[14.5px]">
                        {/* Section 1 */}
                        <section className="space-y-3">
                            <h2 className="text-base font-bold text-zinc-900">
                                1. Who we are and the scope of this policy
                            </h2>
                            <p>
                                1.1 Pinpoint Launchpad Ltd ("Pinpoint", "we", "us", "our") operates the platform at
                                pinpointlaunchpad.com and provides the Self-Scan, the Pinpoint Investment Assessment
                                (PIA), the Pinpoint Investment Window (PIW), and the Pinpoint Investment Network (PIN)
                                (together, the "Services").
                            </p>
                            <p>
                                1.2 For the personal data described in this policy, Pinpoint is the data controller.
                                This means we decide why and how your personal data is processed, and we are responsible
                                to you and to the Nigeria Data Protection Commission for that processing.
                            </p>
                            <p>
                                1.3 This policy applies to Founders, Startups, Investors, applicants, website visitors,
                                and any other individual whose personal data we process in connection with the Services.
                                It should be read together with our Terms of Service and, where you are an Investor, our
                                Investor Terms.
                            </p>
                            <p>
                                1.4 We process personal data in accordance with the Nigeria Data Protection Act 2023
                                (the "NDPA"), the Nigeria Data Protection Regulation, and any regulation, directive, or
                                guidance issued by the Nigeria Data Protection Commission (the "Commission").
                            </p>
                        </section>

                        {/* Section 2 */}
                        <section className="space-y-3">
                            <h2 className="text-base font-bold text-zinc-900">2. The personal data we collect</h2>
                            <p>
                                2.1 We collect the following categories of personal data, depending on how you interact
                                with the Services:
                            </p>

                            <div className="overflow-x-auto">
                                <table className="w-full border-collapse text-xs md:text-sm">
                                    <thead>
                                        <tr className="bg-zinc-100">
                                            <th className="border border-zinc-200 px-4 py-2 text-left font-bold text-zinc-800">
                                                Category
                                            </th>
                                            <th className="border border-zinc-200 px-4 py-2 text-left font-bold text-zinc-800">
                                                Examples
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {[
                                            [
                                                'Identity and contact data',
                                                'Name, role or job title, business name, email address, telephone number, country of operation.',
                                            ],
                                            [
                                                'Self-Scan data',
                                                'Your answers to the diagnostic, the sector, stage, and funding-target information you provide, and the indicative score generated.',
                                            ],
                                            [
                                                'Application and assessment data',
                                                'Information and documents you submit for a PIA or PIW, which may include business, financial, and corporate records and, incidentally, personal data of your founders, personnel, or third parties.',
                                            ],
                                            [
                                                'Investor data',
                                                'Investor status, eligibility representations, and, where required, identity, authority, and source-of-funds information for verification and screening.',
                                            ],
                                            [
                                                'Transaction data',
                                                'Records of the Services you have purchased, payment status, and correspondence. We do not store full card details; payments are processed by our payment provider.',
                                            ],
                                            [
                                                'Technical and usage data',
                                                'IP address, device and browser type, pages viewed, and interactions with the Platform, collected through cookies and similar technologies.',
                                            ],
                                            [
                                                'Communications data',
                                                'The content of emails, forms, and messages you send us, and our records of our dealings with you.',
                                            ],
                                        ].map(([cat, ex], i) => (
                                            <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-zinc-50/50'}>
                                                <td className="border border-zinc-200 px-4 py-3 font-semibold text-zinc-800 align-top">
                                                    {cat}
                                                </td>
                                                <td className="border border-zinc-200 px-4 py-3 text-zinc-700 align-top">
                                                    {ex}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            <p>
                                2.2 <strong>Sensitive personal data.</strong> The Services are not designed to collect
                                sensitive personal data (such as data revealing health, religious belief, or political
                                opinion). Please do not submit sensitive personal data unless we specifically request it.
                                Where verification or screening requires it, we will process it only on a lawful basis
                                under section 30 of the NDPA and with appropriate safeguards.
                            </p>
                            <p>
                                2.3 <strong>Data about third parties.</strong> Where you provide us with personal data
                                of another individual (for example, a co-founder, employee, customer, or referee), you
                                confirm that you have a lawful basis to share it with us and, where required, that you
                                have informed that individual and obtained any necessary consent.
                            </p>
                            <p>
                                2.4 <strong>Children.</strong> The Services are for businesses and their
                                representatives and are not directed at anyone under 18. We do not knowingly collect
                                personal data from children.
                            </p>
                        </section>

                        {/* Section 3 */}
                        <section className="space-y-3">
                            <h2 className="text-base font-bold text-zinc-900">3. How we collect your personal data</h2>
                            <p>3.1 We collect personal data:</p>
                            <ul className="list-disc space-y-2 pl-6 text-zinc-650">
                                <li>
                                    (a) directly from you, when you complete the Self-Scan, create an account, apply
                                    for or undergo a PIA or PIW, join the PIN, or contact us;
                                </li>
                                <li>
                                    (b) automatically, through cookies and similar technologies, when you use the
                                    Platform;
                                </li>
                                <li>
                                    (c) from third parties, such as our payment provider, identity-verification and
                                    screening providers, and publicly available sources, where we verify Investor status,
                                    conduct anti-money-laundering or sanctions checks, or, with the relevant party's
                                    knowledge, corroborate assessment information; and
                                </li>
                                <li>
                                    (d) from a Startup or Investor, where they provide information about their personnel
                                    or contacts in connection with the Services.
                                </li>
                            </ul>
                        </section>

                        {/* Section 4 */}
                        <section className="space-y-3">
                            <h2 className="text-base font-bold text-zinc-900">
                                4. Why we use your personal data, and our lawful basis
                            </h2>
                            <p>
                                4.1 The NDPA requires us to have a lawful basis for each purpose for which we process
                                your personal data. The table below sets out our purposes and the lawful basis under
                                section 25 of the NDPA on which we rely for each.
                            </p>

                            <div className="overflow-x-auto">
                                <table className="w-full border-collapse text-xs md:text-sm">
                                    <thead>
                                        <tr className="bg-zinc-100">
                                            <th className="border border-zinc-200 px-4 py-2 text-left font-bold text-zinc-800">
                                                Purpose
                                            </th>
                                            <th className="border border-zinc-200 px-4 py-2 text-left font-bold text-zinc-800">
                                                What this involves
                                            </th>
                                            <th className="border border-zinc-200 px-4 py-2 text-left font-bold text-zinc-800">
                                                Lawful basis
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {[
                                            [
                                                'Providing the Self-Scan',
                                                'Generating and returning your indicative score and summary.',
                                                'Consent; and steps taken at your request prior to a contract.',
                                            ],
                                            [
                                                'Providing the PIA, PIW, and PIN',
                                                'Delivering the assessment, advisory, and visibility Services you have engaged.',
                                                'Performance of a contract with you.',
                                            ],
                                            [
                                                'Verifying Investors and screening',
                                                'Confirming Investor status, and conducting identity, sanctions, and anti-money-laundering checks.',
                                                'Legal obligation; and legitimate interest in the integrity of the PIN.',
                                            ],
                                            [
                                                'Communicating with you',
                                                'Responding to enquiries and administering your account and engagements.',
                                                'Performance of a contract; and legitimate interest.',
                                            ],
                                            [
                                                'Marketing and updates',
                                                'Sending you information about the Services and relevant content on getting funded.',
                                                'Consent; or legitimate interest, subject to your right to opt out.',
                                            ],
                                            [
                                                'Benchmarks and improvement',
                                                'Compiling anonymised, aggregated statistics and benchmarks, and improving the PARAGON framework and Services.',
                                                'Legitimate interest. Data used for benchmarks is anonymised and does not identify you.',
                                            ],
                                            [
                                                'Security and fraud prevention',
                                                'Protecting the Platform, detecting and preventing fraud and misuse.',
                                                'Legal obligation; and legitimate interest.',
                                            ],
                                            [
                                                'Legal and regulatory compliance',
                                                'Meeting our obligations, establishing or defending legal claims, and responding to lawful requests.',
                                                'Legal obligation; and legitimate interest.',
                                            ],
                                        ].map(([purpose, involves, basis], i) => (
                                            <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-zinc-50/50'}>
                                                <td className="border border-zinc-200 px-4 py-3 font-semibold text-zinc-800 align-top">
                                                    {purpose}
                                                </td>
                                                <td className="border border-zinc-200 px-4 py-3 text-zinc-700 align-top">
                                                    {involves}
                                                </td>
                                                <td className="border border-zinc-200 px-4 py-3 text-zinc-700 align-top">
                                                    {basis}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            <p>
                                4.2 Where we rely on consent, you may withdraw it at any time, without affecting
                                processing carried out before withdrawal. Where we rely on legitimate interest, we have
                                assessed that our interest is not overridden by your rights, and you may object as
                                described in clause 9.
                            </p>
                        </section>

                        {/* Section 5 */}
                        <section className="space-y-3">
                            <h2 className="text-base font-bold text-zinc-900">5. The Self-Scan — a specific note</h2>
                            <p>
                                5.1 Because the Self-Scan is free and open, we want to be clear about it. When you
                                complete the Self-Scan we collect your answers and the contact details you provide, and
                                we use them to return your indicative score, to contact you about the Services, and to
                                compile anonymised benchmarks.
                            </p>
                            <p>
                                5.2 Your individual Self-Scan answers and score are not made visible to any Investor and
                                are not published. We use them in identifiable form only to serve you and to administer
                                our relationship with you; any use for benchmarking is on an anonymised, aggregated
                                basis.
                            </p>
                            <p>
                                5.3 If you complete the Self-Scan but do not go on to apply for a paid Service, we
                                retain your data for the period stated in clause 8 so that we may contact you, unless
                                you ask us to erase it sooner.
                            </p>
                        </section>

                        {/* Section 6 */}
                        <section className="space-y-3">
                            <h2 className="text-base font-bold text-zinc-900">
                                6. Who we share your personal data with
                            </h2>
                            <p>6.1 We do not sell your personal data. We share it only as described below:</p>
                            <ul className="list-disc space-y-2 pl-6 text-zinc-650">
                                <li>
                                    (a) <strong>Service providers (processors)</strong> who process personal data on our
                                    behalf and on our instructions, such as hosting, payment, email, analytics,
                                    identity-verification, and screening providers, each under a written contract that
                                    meets the requirements of section 29 of the NDPA;
                                </li>
                                <li>
                                    (b) <strong>Investors,</strong> in respect of a Startup, only where the Startup has
                                    consented (including on admission to the PIN) to the disclosure of specified
                                    information. We do not disclose a Startup's non-public information to Investors
                                    without that consent;
                                </li>
                                <li>
                                    (c) our <strong>professional advisers,</strong> such as lawyers, auditors, and
                                    insurers, under duties of confidence;
                                </li>
                                <li>
                                    (d) <strong>regulators, law-enforcement, and other authorities,</strong> where we
                                    are required or permitted by law to disclose; and
                                </li>
                                <li>
                                    (e) a <strong>successor,</strong> in connection with a reorganisation, merger, or
                                    sale of our business, subject to this policy.
                                </li>
                            </ul>
                            <p>
                                6.2 Where a processor is engaged, it may process your personal data only for the
                                purposes we specify, must protect it, and must not use it for its own purposes.
                            </p>
                        </section>

                        {/* Section 7 */}
                        <section className="space-y-3">
                            <h2 className="text-base font-bold text-zinc-900">7. International transfers</h2>
                            <p>
                                7.1 Some of our service providers may process personal data outside Nigeria. Where we
                                transfer personal data outside Nigeria, we do so only in accordance with sections 41 to
                                43 of the NDPA.
                            </p>
                            <p>
                                7.2 This means we transfer personal data outside Nigeria only where the destination
                                provides an adequate level of protection as recognised by the Commission, or where an
                                appropriate safeguard is in place (such as contractual clauses binding the recipient),
                                or where another lawful basis for transfer under the NDPA applies. You may ask us for
                                details of the safeguards we use.
                            </p>
                        </section>

                        {/* Section 8 */}
                        <section className="space-y-3">
                            <h2 className="text-base font-bold text-zinc-900">8. How long we keep your personal data</h2>
                            <p>
                                8.1 We keep personal data only for as long as necessary for the purposes for which it
                                was collected, including to satisfy legal, accounting, tax, or reporting requirements.
                            </p>

                            <div className="overflow-x-auto">
                                <table className="w-full border-collapse text-xs md:text-sm">
                                    <thead>
                                        <tr className="bg-zinc-100">
                                            <th className="border border-zinc-200 px-4 py-2 text-left font-bold text-zinc-800">
                                                Data
                                            </th>
                                            <th className="border border-zinc-200 px-4 py-2 text-left font-bold text-zinc-800">
                                                Retention period
                                            </th>
                                            <th className="border border-zinc-200 px-4 py-2 text-left font-bold text-zinc-800">
                                                Reason
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {[
                                            [
                                                'Self-Scan data (no paid Service taken)',
                                                'Up to 24 months from your last interaction',
                                                'To contact you and administer the relationship; erased or anonymised after, unless you ask sooner.',
                                            ],
                                            [
                                                'PIA and PIW engagement records',
                                                'Duration of engagement plus 6 years',
                                                'Contractual, tax, and limitation-period requirements.',
                                            ],
                                            [
                                                'Investor verification and screening records',
                                                'Duration of membership plus 5 years',
                                                'Anti-money-laundering record-keeping requirements.',
                                            ],
                                            [
                                                'Account and marketing data',
                                                'Until you close your account or withdraw consent',
                                                'To maintain your account and preferences.',
                                            ],
                                            [
                                                'Technical and usage logs',
                                                'Up to 24 months',
                                                'Security, analytics, and troubleshooting.',
                                            ],
                                        ].map(([data, period, reason], i) => (
                                            <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-zinc-50/50'}>
                                                <td className="border border-zinc-200 px-4 py-3 font-semibold text-zinc-800 align-top">
                                                    {data}
                                                </td>
                                                <td className="border border-zinc-200 px-4 py-3 text-zinc-700 align-top whitespace-nowrap">
                                                    {period}
                                                </td>
                                                <td className="border border-zinc-200 px-4 py-3 text-zinc-700 align-top">
                                                    {reason}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            <p>
                                8.2 When personal data is no longer required, we securely delete it or irreversibly
                                anonymise it so that it can no longer be associated with you.
                            </p>
                        </section>

                        {/* Section 9 */}
                        <section className="space-y-3">
                            <h2 className="text-base font-bold text-zinc-900">9. Your rights under the NDPA</h2>
                            <p>
                                9.1 Subject to the conditions and exceptions in the NDPA, you have the following rights
                                in relation to your personal data:
                            </p>
                            <ul className="list-disc space-y-2 pl-6 text-zinc-650">
                                <li>(a) to be informed about how we process your personal data, as set out in this policy;</li>
                                <li>(b) to access the personal data we hold about you, and to obtain a copy;</li>
                                <li>(c) to rectification of inaccurate or incomplete personal data;</li>
                                <li>
                                    (d) to erasure of your personal data where it is no longer necessary, where you
                                    withdraw consent and there is no other basis, or where it has been unlawfully
                                    processed;
                                </li>
                                <li>(e) to restrict processing in certain circumstances;</li>
                                <li>
                                    (f) to object to processing based on legitimate interest, and to direct marketing at
                                    any time;
                                </li>
                                <li>
                                    (g) to data portability, to receive certain personal data in a structured, commonly
                                    used, machine-readable format, and to have it transmitted to another controller
                                    where technically feasible;
                                </li>
                                <li>(h) to withdraw consent at any time, where processing is based on consent; and</li>
                                <li>
                                    (i) not to be subject to a decision based solely on automated processing that
                                    produces legal or similarly significant effects, without your right to human
                                    intervention.
                                </li>
                            </ul>
                            <p>
                                9.2 <strong>Automated processing.</strong> The Self-Scan generates an indicative score
                                by automated means. This score is indicative only, produces no legal or similarly
                                significant effect on you, and does not determine eligibility for any paid Service,
                                which is decided with human involvement. A PIA is not conducted solely by automated
                                means.
                            </p>
                            <p>
                                9.3 To exercise any right, contact our Data Protection Officer at{' '}
                                <a href="mailto:dpo@pinpointlaunchpad.com" className="text-[#3A54A5] underline">
                                    dpo@pinpointlaunchpad.com
                                </a>
                                . We will respond within the time required by the NDPA. Exercising your rights is free,
                                though we may charge a reasonable fee or decline a request that is manifestly unfounded
                                or excessive, as the NDPA permits.
                            </p>
                            <p>
                                9.4 <strong>Complaints.</strong> If you are concerned about how we handle your personal
                                data, please contact us first so that we can try to resolve it. You also have the right
                                to lodge a complaint with the Nigeria Data Protection Commission.
                            </p>
                        </section>

                        {/* Section 10 */}
                        <section className="space-y-3">
                            <h2 className="text-base font-bold text-zinc-900">10. How we protect your personal data</h2>
                            <p>
                                10.1 We implement appropriate technical and organisational measures to protect personal
                                data against unauthorised or unlawful processing and against accidental loss,
                                destruction, or damage, including access controls, encryption in transit, logging, and
                                staff confidentiality obligations.
                            </p>
                            <p>
                                10.2 No system is completely secure. While we take reasonable steps to protect your
                                personal data, we cannot guarantee absolute security, and you share information with us
                                at your own risk.
                            </p>
                            <p>
                                10.3 <strong>Data breaches.</strong> Where a personal-data breach occurs that is likely
                                to result in a risk to your rights and freedoms, we will notify the Commission, and
                                where required affected individuals, within the timeframes and in the manner required by
                                the NDPA.
                            </p>
                        </section>

                        {/* Section 11 */}
                        <section className="space-y-3">
                            <h2 className="text-base font-bold text-zinc-900">11. Cookies and similar technologies</h2>
                            <p>
                                11.1 We use cookies and similar technologies to operate the Platform, remember your
                                preferences, measure usage, and improve the Services. Some cookies are necessary for the
                                Platform to function; others are used for analytics and, where you consent, for
                                marketing.
                            </p>
                            <p>
                                11.2 You can control non-essential cookies through the cookie banner on the Platform and
                                through your browser settings. Disabling some cookies may affect how the Platform works.
                                Further detail is available in our Cookie Notice.
                            </p>
                        </section>

                        {/* Section 12 */}
                        <section className="space-y-3">
                            <h2 className="text-base font-bold text-zinc-900">12. Changes to this policy</h2>
                            <p>
                                12.1 We may update this policy from time to time. The current version is always
                                available on the Platform, and the effective date appears at the top. Where a change is
                                material, we will take reasonable steps to notify you.
                            </p>
                        </section>

                        {/* Section 13 */}
                        <section className="space-y-3">
                            <h2 className="text-base font-bold text-zinc-900">13. Contact us</h2>
                            <p>
                                13.1 If you have any question about this policy or about how we handle your personal
                                data, please contact:
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
                            This policy was last updated on 1 August 2026.
                        </div>
                    </div>
                </main>

                <footer className="border-t border-zinc-200 bg-white py-8 text-center text-xs font-semibold text-zinc-400">
                    <p>© {new Date().getFullYear()} Pinpoint Launchpad Ltd. All rights reserved.</p>
                </footer>
            </div>
        </>
    );
}
