import { Head, Link } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import React from 'react';

import { PinpointLogo } from '@/components/pinpoint-logo';

export default function InvestorTerms() {
    return (
        <>
            <Head>
                <title>Investor Terms — Pinpoint Investment Network (PIN)</title>
                <meta
                    name="description"
                    content="Investor Terms governing admission to and use of the Pinpoint Investment Network (PIN) — pinpointlaunchpad.com."
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
                            Investor Terms
                        </h1>
                        <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                            Governing admission to and use of the Pinpoint Investment Network (PIN)
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
                            <strong className="text-zinc-900">Applies to:</strong> Any person or entity admitted, or
                            applying for admission, to the PIN as an Investor
                        </p>
                        <p>
                            <strong className="text-zinc-900">Effective date:</strong> 1 August 2026
                        </p>
                        <p>
                            <strong className="text-zinc-900">Version:</strong> 1.0
                        </p>
                    </div>

                    {/* Preamble */}
                    <div className="mb-8 rounded-xl border border-blue-100 bg-blue-50/60 p-5 text-sm leading-relaxed text-zinc-700">
                        <p className="mb-2 text-xs font-bold uppercase tracking-wider text-blue-700">
                            What these terms are, and how they fit together
                        </p>
                        <p>
                            These Investor Terms are a companion to, and incorporate, the Pinpoint{' '}
                            <Link href="/terms" className="text-[#3A54A5] underline">
                                Terms of Service
                            </Link>{' '}
                            and{' '}
                            <Link href="/privacy" className="text-[#3A54A5] underline">
                                Privacy Notice
                            </Link>
                            . They govern your admission to and use of the Pinpoint Investment Network. The PIN is a
                            curated visibility channel: it lets admitted Investors see Startups that have consented to
                            be seen. Pinpoint does not introduce, match, recommend, advise on, arrange, or effect any
                            investment, and receives no compensation contingent on any investment you may make. Your
                            admission is a visibility opportunity only.{' '}
                            <strong>Clauses 3, 5, and 9 carry the core of the bargain and may be read first.</strong>
                        </p>
                    </div>

                    {/* Contents */}
                    <div className="mb-10 rounded-xl border border-zinc-200 bg-zinc-50 p-5">
                        <p className="mb-3 text-xs font-bold uppercase tracking-wider text-zinc-500">Contents</p>
                        <ol className="list-decimal space-y-1 pl-5 text-xs font-semibold text-zinc-700">
                            {[
                                'Introduction and acceptance',
                                'Definitions',
                                'Nature of the PIN — what you are receiving, and what you are not',
                                'Eligibility and investor status',
                                'No advice, no reliance, and your own due diligence',
                                'Anti-money laundering, sanctions, and lawful conduct',
                                'Conduct within the PIN',
                                'Dealings between you and Startups take place directly',
                                'No compensation contingent on investment; fees',
                                'Confidentiality',
                                'Conflicts of interest',
                                'Data protection',
                                'Intellectual property',
                                'Disclaimers',
                                'Limitation of liability',
                                'Indemnity',
                                'Suspension, withdrawal, and survival',
                                'Dispute resolution',
                                'Governing law',
                                'General',
                            ].map((item, i) => (
                                <li key={i}>{item}</li>
                            ))}
                        </ol>
                    </div>

                    {/* Clauses */}
                    <div className="space-y-8 text-sm leading-relaxed text-zinc-700 md:text-[14.5px]">
                        {/* 1 */}
                        <section className="space-y-3">
                            <h2 className="text-base font-bold text-zinc-900">1. Introduction and acceptance</h2>
                            <p>
                                1.1 These Investor Terms ("Investor Terms") are a legally binding agreement between
                                Pinpoint Launchpad Ltd ("Pinpoint", "we", "us", "our") and you, the person or entity
                                applying for or holding membership of the Pinpoint Investment Network (the "PIN") as an
                                "Investor".
                            </p>
                            <p>
                                1.2 By applying for admission to the PIN, accepting an invitation to the PIN, or
                                accessing any Startup information through the PIN, you confirm that you have read,
                                understood, and agree to be bound by these Investor Terms, the Terms of Service, and
                                the Privacy Notice.
                            </p>
                            <p>
                                1.3 If you are accepting on behalf of a firm, fund, company, or other entity, you
                                represent that you are authorized to bind that entity, and "you" refers to that entity
                                and to each individual acting for it through the PIN.
                            </p>
                            <p>
                                1.4 Where these Investor Terms conflict with the Terms of Service in respect of the PIN
                                or Investor matters, these Investor Terms prevail. On all other matters, the Terms of
                                Service prevail.
                            </p>
                        </section>

                        {/* 2 */}
                        <section className="space-y-3">
                            <h2 className="text-base font-bold text-zinc-900">2. Definitions</h2>
                            <p>
                                2.1 In these Investor Terms, capitalized terms not defined here have the meaning given
                                in the Terms of Service. In addition:
                            </p>
                            <ul className="list-disc space-y-2 pl-6">
                                <li>
                                    (a) <strong>"Confidential Information"</strong> means any non-public information
                                    relating to a Startup, to Pinpoint, or to the PIN that is disclosed to or accessed
                                    by you through the PIN.
                                </li>
                                <li>
                                    (b) <strong>"Investment"</strong> means any acquisition of securities, provision of
                                    debt, grant, convertible instrument, or other financing by you or your affiliates
                                    in or to a Startup.
                                </li>
                                <li>
                                    (c) <strong>"PIN Materials"</strong> means any Startup profile, assessment summary,
                                    score, data, document, or other information made available to you through the PIN.
                                </li>
                                <li>
                                    (d) <strong>"Startup"</strong> means a business made visible to Investors through
                                    the PIN.
                                </li>
                            </ul>
                        </section>

                        {/* 3 */}
                        <section className="space-y-3">
                            <div className="rounded-xl border border-amber-100 bg-amber-50/50 p-4">
                                <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-amber-700">
                                    This clause governs these Investor Terms
                                </p>
                                <p className="text-xs leading-relaxed text-zinc-600">
                                    Every other provision is to be read subject to this clause 3. The PIN gives you
                                    curated visibility of Startups that have consented to be seen. It is not a
                                    recommendation, an introduction, an offer, a solicitation, or investment advice.
                                    Pinpoint is not your adviser, agent, broker, or fiduciary, and is not a party to
                                    any Investment you make.
                                </p>
                            </div>
                            <h2 className="text-base font-bold text-zinc-900">
                                3. Nature of the PIN — what you are receiving, and what you are not
                            </h2>
                            <p>
                                3.1 Pinpoint provides curated visibility only. Admission to the PIN allows you to view
                                PIN Materials for Startups that meet Pinpoint's criteria and have consented to
                                disclosure. That is the entirety of what Pinpoint provides to you.
                            </p>
                            <p>3.2 Pinpoint does not, and does not hold itself out to:</p>
                            <ul className="list-disc space-y-2 pl-6">
                                <li>
                                    (a) recommend, endorse, rate for your benefit, or advise you to make or refrain
                                    from any Investment;
                                </li>
                                <li>
                                    (b) introduce, match, or arrange any Investment, or negotiate or effect any
                                    transaction between you and a Startup;
                                </li>
                                <li>
                                    (c) act as your investment adviser, broker, dealer, agent, or fiduciary, or as a
                                    fund manager or portfolio manager;
                                </li>
                                <li>(d) solicit any Investment from you, or solicit any offer from you to any Startup;</li>
                                <li>
                                    (e) receive, hold, or transmit any funds passing between you and a Startup, or
                                    provide any escrow, custody, or settlement service; or
                                </li>
                                <li>
                                    (f) receive any commission, success fee, carried interest, or other compensation
                                    that is contingent on, or calculated by reference to, any Investment you make.
                                </li>
                            </ul>
                            <p>
                                3.3 PIN Materials, including any PARAGON score, band, assessment summary, or benchmark,
                                are Pinpoint's opinion, prepared for the Startup and made visible to you for
                                information only. They are not prepared for your reliance, are not a recommendation,
                                and are not a substitute for your own due diligence.
                            </p>
                            <p>
                                3.4 You acknowledge that a Startup's presence in the PIN, and any score or assessment
                                it carries, does not mean Pinpoint endorses it, has verified all information about it,
                                or considers it a suitable or safe Investment.
                            </p>
                        </section>

                        {/* 4 */}
                        <section className="space-y-3">
                            <h2 className="text-base font-bold text-zinc-900">4. Eligibility and investor status</h2>
                            <p>
                                4.1 Admission to the PIN is at Pinpoint's sole discretion. Pinpoint may refuse,
                                condition, suspend, or withdraw admission at any time, with or without cause, and is
                                not obliged to give reasons.
                            </p>
                            <p>
                                4.2 You represent and warrant, on application and on a continuing basis, that:
                            </p>
                            <ul className="list-disc space-y-2 pl-6">
                                <li>
                                    (a) you are at least 18 years old and have full legal capacity and authority to
                                    enter into these Investor Terms and to make Investments;
                                </li>
                                <li>
                                    (b) you qualify under applicable Nigerian law to receive the PIN Materials and to
                                    make the Investments you contemplate, including, where relevant, that you are a
                                    sophisticated, professional, qualified, or high-net-worth investor within the
                                    meaning of the Investments and Securities Act 2025 and the rules of the Securities
                                    and Exchange Commission;
                                </li>
                                <li>
                                    (c) you are able to bear the economic risk of any Investment, including the total
                                    loss of it, and you do not rely on Pinpoint to assess suitability or affordability
                                    for you;
                                </li>
                                <li>
                                    (d) you have the knowledge and experience to evaluate the merits and risks of
                                    investing in early-stage and growth businesses, or you take your own professional
                                    advice;
                                </li>
                                <li>
                                    (e) you and your beneficial owners are not subject to any sanctions, and you are
                                    not disqualified under any law from acting as an investor or director; and
                                </li>
                                <li>(f) all information you provide to Pinpoint is accurate, current, and complete.</li>
                            </ul>
                            <p>
                                4.3 Pinpoint may require evidence of your identity, status, authority, and source of
                                funds before or after admission, and may rely on your representations without
                                independent verification. You must promptly notify Pinpoint if any representation
                                ceases to be true.
                            </p>
                        </section>

                        {/* 5 */}
                        <section className="space-y-3">
                            <h2 className="text-base font-bold text-zinc-900">
                                5. No advice, no reliance, and your own due diligence
                            </h2>
                            <p>
                                5.1 You make each Investment decision independently and on your own judgement. You are
                                solely responsible for conducting your own due diligence on any Startup, including
                                legal, financial, technical, commercial, and tax due diligence, and for satisfying
                                yourself as to the accuracy of any information.
                            </p>
                            <p>
                                5.2 You acknowledge that PIN Materials may be incomplete, may not have been
                                independently verified by Pinpoint, may have changed since preparation, and are
                                provided without any warranty as to accuracy or completeness.
                            </p>
                            <p>
                                5.3 Pinpoint gives you no legal, tax, accounting, financial, or investment advice, and
                                you do not rely on Pinpoint for any such advice. You must obtain your own independent
                                professional advice before making any Investment.
                            </p>
                            <p>
                                5.4 You acknowledge that early-stage and growth investments are high-risk, illiquid,
                                and may result in the total loss of capital, and that past performance and any forecast
                                are not indicative of future results.
                            </p>
                        </section>

                        {/* 6 */}
                        <section className="space-y-3">
                            <h2 className="text-base font-bold text-zinc-900">
                                6. Anti-money laundering, sanctions, and lawful conduct
                            </h2>
                            <p>
                                6.1 You are responsible for your own compliance with all laws applicable to you and to
                                any Investment, including the Money Laundering (Prevention and Prohibition) Act, the
                                Terrorism (Prevention and Prohibition) Act, applicable Central Bank of Nigeria and
                                Securities and Exchange Commission requirements, and all applicable sanctions and
                                know-your-customer obligations.
                            </p>
                            <p>
                                6.2 You represent that the funds you use for any Investment are derived from lawful
                                sources and are not the proceeds of any unlawful activity, and that no Investment will
                                breach any sanctions or anti-money-laundering law.
                            </p>
                            <p>
                                6.3 You will provide Pinpoint with such information and documentation as it may
                                reasonably require to meet its own legal and regulatory obligations, and you consent to
                                Pinpoint conducting screening checks on you and your beneficial owners.
                            </p>
                            <p>
                                6.4 Pinpoint may suspend or withdraw your admission, and may decline to make any
                                Startup visible to you, where it reasonably considers that continued dealing would
                                expose it to legal, regulatory, or reputational risk.
                            </p>
                        </section>

                        {/* 7 */}
                        <section className="space-y-3">
                            <h2 className="text-base font-bold text-zinc-900">7. Conduct within the PIN</h2>
                            <p>
                                7.1 You must use the PIN and PIN Materials only to evaluate potential Investments for
                                yourself or the entity you represent, and for no other purpose.
                            </p>
                            <p>7.2 You must not:</p>
                            <ul className="list-disc space-y-2 pl-6">
                                <li>
                                    (a) use PIN Materials to compete with, solicit clients of, or act to the detriment
                                    of any Startup or of Pinpoint;
                                </li>
                                <li>
                                    (b) copy, extract, scrape, republish, or share PIN Materials with any person
                                    outside your organization, except your professional advisers under equivalent
                                    obligations of confidence;
                                </li>
                                <li>
                                    (c) contact a Startup's customers, employees, suppliers, or investors using
                                    information obtained through the PIN, other than in the ordinary course of bona
                                    fide due diligence conducted with the Startup's knowledge;
                                </li>
                                <li>
                                    (d) circumvent the PIN to induce a Startup to deal outside the Platform in order to
                                    disadvantage Pinpoint or another User;
                                </li>
                                <li>
                                    (e) make any false or misleading representation to a Startup as to your status,
                                    intentions, or capacity; or
                                </li>
                                <li>
                                    (f) use the PIN in any way that is unlawful, or that damages the integrity or
                                    reputation of the PIN.
                                </li>
                            </ul>
                            <p>
                                7.3 You must deal with Startups honestly, in good faith, and with reasonable
                                promptness, and must not misuse the confidential or commercially sensitive information
                                of any Startup.
                            </p>
                        </section>

                        {/* 8 */}
                        <section className="space-y-3">
                            <h2 className="text-base font-bold text-zinc-900">
                                8. Dealings between you and Startups take place directly
                            </h2>
                            <p>
                                8.1 Any contact, due diligence, negotiation, agreement, or Investment between you and a
                                Startup takes place directly between you and the Startup and on your own
                                responsibility. Pinpoint is not a party to it and takes no role in it.
                            </p>
                            <p>
                                8.2 Pinpoint is not responsible for, and gives no assurance as to, the accuracy of any
                                information provided by a Startup, the conduct, solvency, or bona fides of any
                                Startup, the terms of any Investment, or any outcome of any dealing.
                            </p>
                            <p>
                                8.3 You are responsible for the terms on which you invest, for documenting your
                                Investment, and for your own legal and regulatory compliance in doing so. Pinpoint
                                provides no transaction documents and no legal representation in respect of any
                                Investment made through visibility gained in the PIN.
                            </p>
                            <p>
                                8.4 You will not represent to any person that Pinpoint has recommended, endorsed,
                                arranged, or is responsible for any Investment.
                            </p>
                        </section>

                        {/* 9 */}
                        <section className="space-y-3">
                            <div className="rounded-xl border border-amber-100 bg-amber-50/50 p-4">
                                <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-amber-700">
                                    How Pinpoint is, and is not, paid in respect of you
                                </p>
                                <p className="text-xs leading-relaxed text-zinc-600">
                                    Pinpoint earns no commission, success fee, or other compensation that is contingent
                                    on, or calculated by reference to, any Investment you make in any Startup. Any fee
                                    Pinpoint charges you is a fixed membership or access fee for visibility, disclosed
                                    in advance and payable irrespective of whether you make any Investment.
                                </p>
                            </div>
                            <h2 className="text-base font-bold text-zinc-900">
                                9. No compensation contingent on investment; fees
                            </h2>
                            <p>
                                9.1 Admission to the PIN may be free or subject to a fixed membership or access fee,
                                as stated on the Platform or notified to you. Any such fee is for access to the PIN
                                and is not contingent on any Investment.
                            </p>
                            <p>
                                9.2 You are not obliged to make any Investment, and Pinpoint is not obliged to make
                                any particular Startup visible to you.
                            </p>
                            <p>9.3 Each party bears its own costs of participating in the PIN and of any due diligence or Investment.</p>
                        </section>

                        {/* 10 */}
                        <section className="space-y-3">
                            <h2 className="text-base font-bold text-zinc-900">10. Confidentiality</h2>
                            <p>
                                10.1 You must keep all Confidential Information confidential, use it only to evaluate a
                                potential Investment, and protect it with at least reasonable care. You may share it
                                only with those of your personnel and professional advisers who need it for that
                                purpose and who are bound by equivalent obligations, and you are responsible for their
                                compliance.
                            </p>
                            <p>
                                10.2 The obligation does not apply to information that is or becomes public through no
                                breach by you, was lawfully known to you before disclosure, is independently developed
                                by you without use of Confidential Information, or is lawfully received from a third
                                party without restriction.
                            </p>
                            <p>
                                10.3 Where you are required by law or regulation to disclose Confidential Information,
                                you must, where lawful, give Pinpoint and the affected Startup prompt notice so that
                                protective steps may be taken.
                            </p>
                            <p>
                                10.4 On withdrawal from the PIN, or on Pinpoint's request, you must cease using and,
                                at Pinpoint's option, return or destroy Confidential Information, save for one copy
                                retained for compliance and for material embedded in bona fide investment records.
                            </p>
                            <p>
                                10.5 These confidentiality obligations continue for three (3) years after your
                                admission ends, and indefinitely in respect of any trade secret.
                            </p>
                        </section>

                        {/* 11 */}
                        <section className="space-y-3">
                            <h2 className="text-base font-bold text-zinc-900">11. Conflicts of interest</h2>
                            <p>
                                11.1 You must notify Pinpoint of any actual or potential conflict of interest that
                                could affect your dealings within the PIN, including any interest you hold in a
                                competitor of a Startup made visible to you.
                            </p>
                            <p>
                                11.2 You acknowledge that Pinpoint may make the same Startup visible to multiple
                                Investors, may make competing Startups visible to you, and may have its own commercial
                                relationships with Startups, and that none of these constitutes a breach by Pinpoint or
                                a conflict owed to you.
                            </p>
                        </section>

                        {/* 12 */}
                        <section className="space-y-3">
                            <h2 className="text-base font-bold text-zinc-900">12. Data protection</h2>
                            <p>
                                12.1 Pinpoint processes personal data in accordance with the Nigeria Data Protection
                                Act 2023 and the{' '}
                                <Link href="/privacy" className="text-[#3A54A5] underline">
                                    Privacy Notice
                                </Link>
                                . Where you receive personal data through the PIN, you act as an independent controller
                                of that data and must process it lawfully, only for the purpose of evaluating a
                                potential Investment, and in accordance with the Act.
                            </p>
                            <p>
                                12.2 You must implement appropriate technical and organizational measures to protect
                                any personal data you receive through the PIN, and must not retain it longer than
                                necessary for that purpose or as required by law.
                            </p>
                        </section>

                        {/* 13 */}
                        <section className="space-y-3">
                            <h2 className="text-base font-bold text-zinc-900">13. Intellectual property</h2>
                            <p>
                                13.1 The PIN, the PIN Materials, the PARAGON framework, and all associated
                                methodologies and benchmarks are owned by Pinpoint or its licensors. You receive a
                                limited, non-exclusive, non-transferable, revocable licence to view PIN Materials
                                solely to evaluate potential Investments, and no other rights.
                            </p>
                            <p>
                                13.2 You must not extract, reproduce, or reuse the PARAGON framework, scoring, or
                                benchmarks, or use Pinpoint's name or marks without prior written consent, except to
                                state factually that you are a member of the PIN.
                            </p>
                        </section>

                        {/* 14 */}
                        <section className="space-y-3">
                            <h2 className="text-base font-bold text-zinc-900">14. Disclaimers</h2>
                            <p>
                                14.1 To the fullest extent permitted by law, the PIN and PIN Materials are provided
                                "as is" and "as available", and Pinpoint disclaims all warranties, express, implied,
                                or statutory, including as to accuracy, completeness, fitness for purpose, and
                                non-infringement.
                            </p>
                            <p>
                                14.2 Pinpoint does not warrant that any Startup is a sound, safe, or suitable
                                Investment, that any PIN Material is accurate or current, or that the PIN will be
                                available, uninterrupted, or secure.
                            </p>
                            <p>
                                14.3 Any score, band, benchmark, or forecast is an opinion and estimate only, prepared
                                for the Startup, and must not be relied on by you as a statement of fact or a
                                recommendation.
                            </p>
                        </section>

                        {/* 15 */}
                        <section className="space-y-3">
                            <h2 className="text-base font-bold text-zinc-900">15. Limitation of liability</h2>
                            <p>
                                15.1 Nothing in these Investor Terms excludes or limits any liability that cannot
                                lawfully be excluded, including for fraud, fraudulent misrepresentation, death, or
                                personal injury caused by negligence.
                            </p>
                            <p>
                                15.2 Subject to clause 15.1, Pinpoint is not liable for any Investment you make or
                                decline to make, for any loss on any Investment, for the conduct, solvency, or
                                misrepresentation of any Startup or other User, or for any indirect, incidental,
                                special, consequential, or punitive loss, or loss of profit, capital, opportunity, or
                                goodwill, whether in contract, tort (including negligence), or otherwise.
                            </p>
                            <p>
                                15.3 Subject to clause 15.1, Pinpoint's total aggregate liability arising out of or in
                                connection with these Investor Terms and the PIN is limited to the total access or
                                membership fees actually paid by you to Pinpoint in the twelve (12) months preceding
                                the event giving rise to the liability, or, where no such fee has been paid, to
                                ₦100,000 or its equivalent in the relevant currency.
                            </p>
                            <p>
                                15.4 You acknowledge that this allocation of risk is reasonable, given that Pinpoint
                                provides visibility only, makes no recommendation, and receives no compensation
                                contingent on your Investments.
                            </p>
                        </section>

                        {/* 16 */}
                        <section className="space-y-3">
                            <h2 className="text-base font-bold text-zinc-900">16. Indemnity</h2>
                            <p>
                                16.1 You agree to indemnify and hold harmless Pinpoint, its directors, officers,
                                employees, and agents against all claims, liabilities, losses, and reasonable costs
                                (including legal fees) arising out of or in connection with: (a) your breach of these
                                Investor Terms; (b) your breach of any law, including any securities,
                                anti-money-laundering, sanctions, or data-protection law; (c) any Investment you make
                                or any dealing between you and a Startup; or (d) any representation you make to a
                                Startup or third party as to Pinpoint's role.
                            </p>
                        </section>

                        {/* 17 */}
                        <section className="space-y-3">
                            <h2 className="text-base font-bold text-zinc-900">17. Suspension, withdrawal, and survival</h2>
                            <p>
                                17.1 You may withdraw from the PIN at any time on written notice. Pinpoint may suspend
                                or withdraw your admission at any time, with or without cause, and without liability.
                            </p>
                            <p>
                                17.2 Withdrawal or suspension does not affect accrued rights or liabilities, and does
                                not entitle you to any refund of any fee except as expressly agreed.
                            </p>
                            <p>
                                17.3 Clauses concerning nature of the PIN (3), no advice and due diligence (5), AML
                                and sanctions (6), dealings taking place directly (8), confidentiality (10),
                                intellectual property (13), disclaimers (14), limitation of liability (15), indemnity
                                (16), dispute resolution (18), and governing law (19), and any provision that by its
                                nature should survive, continue after your admission ends.
                            </p>
                        </section>

                        {/* 18 */}
                        <section className="space-y-3">
                            <div className="rounded-xl border border-amber-100 bg-amber-50/50 p-4">
                                <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-amber-700">
                                    A multi-tiered mechanism
                                </p>
                                <p className="text-xs leading-relaxed text-zinc-600">
                                    Disputes are resolved in escalating stages — good-faith negotiation, then
                                    mediation, then arbitration. Each stage is a precondition to the next, so most
                                    matters are resolved quickly and privately, and formal proceedings arise only where
                                    they genuinely must.
                                </p>
                            </div>
                            <h2 className="text-base font-bold text-zinc-900">18. Dispute resolution</h2>
                            <p>
                                18.1 <strong>Scope.</strong> This clause applies to any dispute, controversy, or claim
                                arising out of or in connection with these Investor Terms or the PIN, including any
                                question as to their existence, validity, interpretation, breach, or termination (a
                                "Dispute").
                            </p>
                            <p>
                                18.2 <strong>Stage 1 — Negotiation.</strong> The party raising a Dispute must give
                                written notice describing it. Senior representatives of each party must attempt in good
                                faith to resolve it by direct negotiation within twenty-one (21) days of the notice.
                            </p>
                            <p>
                                18.3 <strong>Stage 2 — Mediation.</strong> If not resolved, the parties must refer the
                                Dispute to mediation before a single mediator administered by the Lagos Multi-Door
                                Courthouse under its mediation rules, and must attempt mediation in good faith for at
                                least thirty (30) days from the mediator's appointment before either may commence
                                arbitration. The mediator's costs are shared equally.
                            </p>
                            <p>
                                18.4 <strong>Stage 3 — Arbitration.</strong> Any Dispute not resolved by mediation is
                                finally resolved by arbitration under the Arbitration and Mediation Act 2023, in
                                accordance with the rules of the Lagos Court of Arbitration, on the following basis:
                            </p>
                            <ul className="list-disc space-y-2 pl-6">
                                <li>(a) the seat of arbitration is Lagos, Nigeria;</li>
                                <li>
                                    (b) the tribunal is a sole arbitrator, unless the amount in dispute exceeds
                                    ₦50,000,000 (or its equivalent), in which case three arbitrators;
                                </li>
                                <li>(c) the language is English;</li>
                                <li>
                                    (d) the award is final and binding, and the parties waive any right of appeal to
                                    the extent permitted by law; and
                                </li>
                                <li>
                                    (e) each party bears its own costs, and the costs of the arbitration are borne as
                                    the tribunal directs.
                                </li>
                            </ul>
                            <p>
                                18.5 <strong>Urgent relief.</strong> Either party may apply to a Nigerian court for
                                urgent interim or injunctive relief (including to protect confidential information or
                                intellectual property) without waiving the tiered process.
                            </p>
                            <p>
                                18.6 <strong>Confidentiality.</strong> The existence and content of any negotiation,
                                mediation, or arbitration, and any award, are confidential, save as required to enforce
                                an award or by law.
                            </p>
                            <p>
                                18.7 <strong>Time bar.</strong> A party must commence Stage 1 within twelve (12)
                                months of becoming aware of the facts giving rise to a Dispute, failing which the claim
                                is waived to the extent permitted by law.
                            </p>
                        </section>

                        {/* 19 */}
                        <section className="space-y-3">
                            <h2 className="text-base font-bold text-zinc-900">19. Governing law</h2>
                            <p>
                                19.1 These Investor Terms, and any Dispute, are governed by and construed in accordance
                                with the laws of the Federal Republic of Nigeria.
                            </p>
                            <p>
                                19.2 Subject to clause 18, the courts of Nigeria have jurisdiction over any matter not
                                required to be referred to arbitration.
                            </p>
                        </section>

                        {/* 20 */}
                        <section className="space-y-3">
                            <h2 className="text-base font-bold text-zinc-900">20. General</h2>
                            <p>
                                20.1 <strong>Entire agreement.</strong> These Investor Terms, the Terms of Service, and
                                the Privacy Notice constitute the entire agreement between the parties as to the PIN
                                and supersede all prior understandings.
                            </p>
                            <p>
                                20.2 <strong>Variation.</strong> Pinpoint may amend these Investor Terms by posting the
                                revised terms on the Platform or notifying you. Continued use of the PIN after the
                                effective date constitutes acceptance.
                            </p>
                            <p>
                                20.3 <strong>Assignment.</strong> You may not assign your rights without Pinpoint's
                                prior written consent. Pinpoint may assign to an affiliate or successor.
                            </p>
                            <p>
                                20.4 <strong>No partnership or agency.</strong> Nothing creates any partnership, joint
                                venture, agency, or fiduciary relationship between you and Pinpoint.
                            </p>
                            <p>
                                20.5 <strong>Third parties.</strong> A Startup made visible to you may enforce clauses
                                7, 8, and 11 against you to the extent they protect that Startup. Otherwise, no
                                non-party may enforce these Investor Terms.
                            </p>
                            <p>
                                20.6 <strong>Severance.</strong> If any provision is held invalid, it is severed and
                                the remainder continues in force.
                            </p>
                            <p>
                                20.7 <strong>Waiver.</strong> No failure or delay in exercising a right operates as a
                                waiver.
                            </p>
                            <p>
                                20.8 <strong>Notices.</strong> Notices to Pinpoint must be sent to{' '}
                                <a href="mailto:legal@pinpointlaunchpad.com" className="text-[#3A54A5] underline">
                                    legal@pinpointlaunchpad.com
                                </a>{' '}
                                and to its registered office. Notices to you may be sent to the email associated with
                                your PIN membership.
                            </p>
                        </section>

                        {/* Acceptance box */}
                        <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-5 text-sm font-semibold text-zinc-700">
                            By applying for or holding membership of the Pinpoint Investment Network, you acknowledge
                            that you have read and understood these Investor Terms and agree to be bound by them.
                        </div>

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
                    </div>
                </footer>
            </div>
        </>
    );
}
