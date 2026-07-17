import React from 'react';
import { Head, Link } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import { PinpointLogo } from '@/components/pinpoint-logo';

export default function Terms() {
    return (
        <>
            <Head>
                <title>Terms of Service — Pinpoint Launchpad</title>
                <meta name="description" content="Terms of Service governing the use of pinpointlaunchpad.com and the Pinpoint services." />
            </Head>

            <div className="min-h-screen bg-zinc-50 text-zinc-850 font-sans antialiased">
                {/* Header */}
                <header className="sticky top-0 z-40 w-full border-b border-zinc-200 bg-white/90 backdrop-blur-md">
                    <div className="mx-auto max-w-4xl px-6 h-16 flex items-center justify-between">
                        <Link href="/" className="flex items-center gap-2 group">
                            <PinpointLogo className="h-6 text-[#3A54A5]" />
                        </Link>

                        <Link
                            href="/"
                            className="flex items-center gap-1 text-xs font-bold text-zinc-500 hover:text-zinc-950 transition-colors"
                        >
                            <ArrowLeft className="size-3.5" />
                            Back
                        </Link>
                    </div>
                </header>

                {/* Main Content Area */}
                <main className="mx-auto max-w-4xl px-6 py-12 md:py-16 bg-white my-6 rounded-2xl border border-zinc-200 shadow-sm">
                    {/* Title */}
                    <div className="border-b border-zinc-250 pb-8 mb-8">
                        <h1 className="font-display text-2xl md:text-3xl font-black tracking-tight text-zinc-900 mb-2">
                            Terms of Service
                        </h1>
                        <p className="text-xs text-zinc-500 font-semibold uppercase tracking-wider">
                            Governing the use of pinpointlaunchpad.com and the Pinpoint services
                        </p>
                    </div>

                    {/* Meta info box */}
                    <div className="rounded-xl border border-zinc-200 text-zinc-800 bg-zinc-50 p-5 mb-8 space-y-2 text-xs font-semibold text-zinc-655 leading-relaxed">
                        <p><strong className="text-zinc-800">Platform:</strong> pinpointlaunchpad.com</p>
                        <p><strong className="text-zinc-800">Operator:</strong> Pinpoint Launchpad Ltd (RC 8806541), a company incorporated in Nigeria</p>
                        <p><strong className="text-zinc-800">Registered office:</strong> Vibranium Valley, 42 Local Airport Road, Ikeja, Lagos, Nigeria</p>
                        <p><strong className="text-zinc-805">Effective date:</strong> 1 August 2026</p>
                        <p><strong className="text-zinc-805">Version:</strong> 1.0</p>
                    </div>

                    {/* Clauses */}
                    <div className="space-y-8 text-sm md:text-[14.5px] leading-relaxed text-zinc-700">
                        {/* Section 1 */}
                        <section className="space-y-3">
                            <h2 className="text-base font-bold text-zinc-900">1. Introduction and acceptance</h2>
                            <p>
                                1.1 These Terms of Service (“Terms”) are a legally binding agreement between Pinpoint Launchpad Ltd (“Pinpoint”, “we”, “us” or “our”) and you, the person or entity accessing or using the platform at pinpointlaunchpad.com and the related services described in these Terms (together, the “Platform”).
                            </p>
                            <p>
                                1.2 By accessing the Platform, creating an account, completing the Self-Scan, submitting an application, or purchasing or using any Pinpoint service, you confirm that you have read, understood, and agree to be bound by these Terms and by the Privacy Policy, which is incorporated by reference.
                            </p>
                            <p>
                                1.3 If you are accepting these Terms on behalf of a company or other legal entity, you represent that you are authorised to bind that entity, and “you” refers to that entity.
                            </p>
                            <p>
                                1.4 If you do not agree to these Terms, you must not access or use the Platform.
                            </p>
                        </section>

                        {/* Section 2 */}
                        <section className="space-y-3">
                            <h2 className="text-base font-bold text-zinc-900">2. Definitions and interpretation</h2>
                            <p>2.1 In these Terms, unless the context otherwise requires:</p>
                            <ul className="list-disc pl-6 space-y-2 text-zinc-650">
                                <li><strong>“Applicant”</strong> means a Startup that submits an application for a PIA.</li>
                                <li><strong>“Assessment Report”</strong> means the written report and associated materials delivered on completion of a PIA.</li>
                                <li><strong>“Content”</strong> means all information, data, text, documents, materials, scores, reports, frameworks, and other content available on or produced through the Platform.</li>
                                <li><strong>“Founder”</strong> means an individual founder, director, or authorised officer of a Startup.</li>
                                <li><strong>“Investor”</strong> means a person or entity that has been admitted to the Pinpoint Investment Network as a member seeking to review Startups, and that has separately agreed to the Investor terms.</li>
                                <li><strong>“PARAGON”</strong> means Pinpoint’s proprietary seven-dimension investment-readiness framework (Potential, Agility, Risk, Alignment, Governance, Operations, Network) and all associated methodologies, question banks, scoring rubrics, and benchmarks.</li>
                                <li><strong>“PIA” or “Pinpoint Investment Assessment”</strong> means the paid investment-readiness assessment service described in clause 6.</li>
                                <li><strong>“PIN” or “Pinpoint Investment Network”</strong> means the curated visibility channel described in clause 8.</li>
                                <li><strong>“PIW” or “Pinpoint Investment Window”</strong> means the paid implementation and advisory service described in clause 7.</li>
                                <li><strong>“Self-Scan”</strong> means the free online PARAGON diagnostic described in clause 5.</li>
                                <li><strong>“Services”</strong> means the Self-Scan, the PIA, the PIW, the PIN, and any other service made available through the Platform.</li>
                                <li><strong>“Startup”</strong> means a startup, small or medium enterprise, or other business that uses the Platform, whether at concept, seed, or growth stage.</li>
                                <li><strong>“User”</strong> means any person who accesses or uses the Platform, including Founders, Startups, and Investors.</li>
                            </ul>
                            <p>
                                2.2 Headings are for convenience only. Words importing the singular include the plural and vice versa. “Including” means “including without limitation”. A reference to a statute includes any amendment or re-enactment of it. References to “naira” or “₦” are to the Nigerian naira, and to “US$” are to United States dollars.
                            </p>
                        </section>

                        {/* Section 3 */}
                        <section className="space-y-3">
                            <h2 className="text-base font-bold text-zinc-900">3. Nature of the Services — what Pinpoint is, and what it is not</h2>
                            <div className="rounded-xl border border-amber-500/20 bg-amber-50/50 p-4 text-xs md:text-sm font-semibold text-amber-800">
                                <strong className="text-amber-900">This clause governs the entire agreement:</strong> Every other provision of these Terms is to be read subject to, and consistently with, this clause 3. In the event of any inconsistency between this clause and any other part of the Platform or these Terms, this clause prevails.
                            </div>
                            <p>
                                3.1 Pinpoint is a provider of investment-readiness assessment and advisory services. Pinpoint helps Startups understand how prepared they are to raise capital or secure funding, and helps them improve that preparedness. That is the entirety of what Pinpoint does.
                            </p>
                            <p>3.2 Pinpoint expressly does not, and does not hold itself out to:</p>
                            <ul className="list-disc pl-6 space-y-2 text-zinc-650">
                                <li>(a) act as a broker, dealer, or broker-dealer of securities;</li>
                                <li>(b) act as an investment adviser, fund manager, portfolio manager, or provider of investment advice within the meaning of the Investments and Securities Act or any regulation made under it;</li>
                                <li>(c) solicit, offer, arrange, negotiate, underwrite, place, or effect any investment, security, loan, grant, or other financing;</li>
                                <li>(d) receive, hold, or transmit any investor funds, or operate any escrow, custody, or payment intermediation service in respect of any financing;</li>
                                <li>(e) receive or accept any commission, success fee, finder’s fee, brokerage, carried interest, or other compensation that is contingent upon, calculated by reference to, or conditioned on the closing of any financing; or</li>
                                <li>(f) guarantee, promise, or represent that any Startup will raise capital, secure funding, be introduced to any investor, or achieve any particular outcome.</li>
                            </ul>
                            <p>
                                3.3 All fees payable to Pinpoint are fixed, disclosed in advance, and payable for the performance of assessment or advisory work, irrespective of whether any Startup raises capital or secures any funding. Pinpoint’s compensation is never contingent on a financing.
                            </p>
                            <p>
                                3.4 Nothing on the Platform constitutes an offer or solicitation to buy or sell any security, an invitation to invest, investment advice, legal advice, tax advice, financial advice, or a recommendation, and nothing on the Platform should be relied upon as such. Users must take their own independent professional advice.
                            </p>
                            <p>
                                3.5 The PIN is a curated visibility channel and not a marketplace, exchange, or intermediation service. Its nature and limits are set out in clause 8.
                            </p>
                            <p>
                                3.6 Any Investor admitted to the PIN, and any Startup listed in it, deals directly and independently with any counterparty. Pinpoint is not a party to, and takes no role in, any negotiation, transaction, or agreement between a Startup and any Investor or funder.
                            </p>
                        </section>

                        {/* Section 4 */}
                        <section className="space-y-3">
                            <h2 className="text-base font-bold text-zinc-900">4. Eligibility, accounts, and acceptable use</h2>
                            <p>
                                4.1 To use the paid Services you must be at least 18 years old and capable of forming a binding contract. The Platform is intended for businesses and their authorised representatives, not for consumers acting in a personal capacity.
                            </p>
                            <p>
                                4.2 You agree to provide accurate, current, and complete information when creating an account or submitting any information, and to keep it up to date. You are responsible for maintaining the confidentiality of your account credentials and for all activity under your account.
                            </p>
                            <p>4.3 You agree not to:</p>
                            <ul className="list-disc pl-6 space-y-2 text-zinc-650">
                                <li>(a) use the Platform for any unlawful purpose, or in breach of any applicable law or regulation;</li>
                                <li>(b) submit information that is false, misleading, or that you are not entitled to submit;</li>
                                <li>(c) copy, reproduce, scrape, reverse-engineer, decompile, or attempt to derive the PARAGON framework, question banks, scoring rubrics, benchmarks, or any part of the methodology;</li>
                                <li>(d) resell, sublicense, or commercially exploit any Service or Content without Pinpoint’s prior written consent;</li>
                                <li>(e) use the Platform to gain a competitive advantage against Pinpoint, or to build a competing product or service;</li>
                                <li>(f) introduce any malware, or interfere with or disrupt the integrity or performance of the Platform; or</li>
                                <li>(g) impersonate any person or misrepresent your affiliation with any person or entity.</li>
                            </ul>
                            <p>
                                4.4 We may suspend or terminate your access to the Platform, with or without notice, if we reasonably believe you have breached these Terms.
                            </p>
                        </section>

                        {/* Section 5 */}
                        <section className="space-y-3">
                            <h2 className="text-base font-bold text-zinc-900">5. The Self-Scan</h2>
                            <p>
                                5.1 The Self-Scan is a free, automated, indicative diagnostic. It generates a provisional PARAGON score and a summary based solely and entirely on the answers you provide. It involves no human review, no verification of any answer, and no examination of any document.
                            </p>
                            <p>
                                5.2 The Self-Scan result is not an assessment, a valuation, a certification, or any form of advice. It is a self-guided indication only, and its accuracy depends entirely on the accuracy and honesty of your own answers.
                            </p>
                            <p>
                                5.3 The Self-Scan result is provided to you alone. It is not shown to any Investor and confers no status, listing, or entitlement of any kind.
                            </p>
                            <p>
                                5.4 By completing the Self-Scan you consent to Pinpoint collecting and processing your responses and contact details in accordance with the Privacy Policy, including to contact you about the Services and to compile anonymised, aggregated benchmarks.
                            </p>
                        </section>

                        {/* Section 6 */}
                        <section className="space-y-3">
                            <h2 className="text-base font-bold text-zinc-900">6. The Pinpoint Investment Assessment (PIA)</h2>
                            <p>
                                6.1 The PIA is a paid investment-readiness assessment. On acceptance of an application and payment of the applicable fee, Pinpoint assesses the Startup against the PARAGON framework and delivers an Assessment Report. Application is free; the fee is scoped and disclosed before it is invoiced.
                            </p>
                            <p>
                                6.2 The scope, depth, and fee of the PIA depend on the tier applicable to the Startup, as described on the Platform at the time of application and confirmed in writing before invoicing. Pinpoint may decline any application at its discretion.
                            </p>
                            <p>
                                6.3 You acknowledge that the value and accuracy of the PIA depend on your full cooperation, including the timely provision of accurate and complete information, documents, and access. Pinpoint is entitled to rely on the information and documents you provide, and is not obliged to independently verify them except as expressly stated in the assessment methodology.
                            </p>
                            <p>
                                6.4 The Assessment Report reflects Pinpoint’s professional opinion, formed in good faith on the basis of the evidence made available within the assessment window. It is not a guarantee of investment-readiness, fundability, or any outcome, and it is not an audit, a legal opinion, a valuation for any statutory purpose, or investment advice.
                            </p>
                            <p>
                                6.5 A Startup’s PIA score, band, or Report confers no entitlement to admission to the PIN, to a PIW, or to any introduction, and does not oblige any Investor to take any action.
                            </p>
                            <p>
                                6.6 PIA fees are non-refundable once the assessment has commenced, save as required by law or as expressly agreed in writing. Where Pinpoint declines an application before commencement, any fee paid in respect of that application is refunded.
                            </p>
                            <p>
                                6.7 Delivery timelines stated on the Platform are targets and run from the date on which the Startup has provided all information and documents reasonably required to begin. Delay by the Startup extends the timeline accordingly.
                            </p>
                        </section>

                        {/* Section 7 */}
                        <section className="space-y-3">
                            <h2 className="text-base font-bold text-zinc-900">7. The Pinpoint Investment Window (PIW)</h2>
                            <p>
                                7.1 The PIW is a paid implementation and advisory service in which Pinpoint works with a Startup, over a defined period, to address matters identified in the PIA and to improve the Startup’s investment-readiness.
                            </p>
                            <p>
                                7.2 The PIW is provided on the basis of a retainer or engagement fee, the amount, duration, and scope of which are agreed in writing before the PIW begins. The specific deliverables, milestones, and any value-based fees are governed by a separate written engagement letter or value agreement, which supplements these Terms.
                            </p>
                            <p>
                                7.3 Any credit offered in respect of a PIW retainer is creditable only against future Pinpoint assessment or advisory fees. No credit, refund, or fee is calculated by reference to, or conditioned upon, any Startup raising capital or securing any funding.
                            </p>
                            <p>
                                7.4 The PIW is an advisory service. Pinpoint advises and assists; the Startup decides and acts. Pinpoint does not manage the Startup, does not assume any operational role, and is not responsible for the Startup’s decisions or their consequences.
                            </p>
                            <p>
                                7.5 Nothing in a PIW obliges Pinpoint to introduce the Startup to any Investor or to admit it to the PIN, and no PIW fee is payable in consideration of any such introduction or admission.
                            </p>
                        </section>

                        {/* Section 8 */}
                        <section className="space-y-3">
                            <h2 className="text-base font-bold text-zinc-900">8. The Pinpoint Investment Network (PIN)</h2>
                            <div className="rounded-xl border border-blue-200 bg-blue-50/50 p-4 text-xs md:text-sm font-semibold text-blue-900">
                                <strong>The PIN is a visibility channel, not a brokerage:</strong> The PIN allows Startups that meet Pinpoint’s criteria to be visible to Investors who have been admitted to the network. Pinpoint curates who may see and be seen. Pinpoint does not introduce, match, recommend, solicit, negotiate, or arrange any investment, and receives no compensation contingent on any financing that may result. Admission to the PIN is a visibility opportunity only.
                            </div>
                            <p>
                                8.1 Admission of a Startup to the PIN is at Pinpoint’s sole discretion and may be conditioned on the Startup having completed a PIA or achieved a threshold, on the Startup’s consent to the disclosure of specified information to Investors, and on continued compliance with these Terms.
                            </p>
                            <p>
                                8.2 Admission of an Investor to the PIN is at Pinpoint’s sole discretion and is subject to separate Investor terms, including representations as to the Investor’s status and eligibility under applicable law.
                            </p>
                            <p>
                                8.3 Pinpoint does not endorse, vouch for, guarantee, or warrant any Startup or any Investor, or the accuracy of any information either provides. Visibility in the PIN is not a recommendation.
                            </p>
                            <p>
                                8.4 Any communication, due diligence, negotiation, agreement, or transaction between a Startup and an Investor takes place directly between them, on their own responsibility, and outside the Platform. Pinpoint is not a party to it, has no liability in respect of it, and gives no assurance as to any outcome.
                            </p>
                            <p>
                                8.5 Users are responsible for their own compliance with all laws applicable to any dealing arising from the PIN, including securities, anti-money-laundering, know-your-customer, data-protection, and tax laws. Each Startup and Investor must satisfy itself as to the status and bona fides of any counterparty.
                            </p>
                            <p>
                                8.6 Pinpoint may remove any Startup or Investor from the PIN at any time, with or without cause, and is not liable for any consequence of removal.
                            </p>
                        </section>

                        {/* Section 9 */}
                        <section className="space-y-3">
                            <h2 className="text-base font-bold text-zinc-900">9. Fees, payment, and taxes</h2>
                            <p>
                                9.1 Fees for the paid Services are as stated on the Platform or in the applicable engagement letter. Pinpoint may price in naira or US dollars and may revise its fees prospectively.
                            </p>
                            <p>
                                9.2 Unless stated otherwise, fees are exclusive of value added tax and any other applicable taxes or levies, which you are responsible for paying. Where Pinpoint is required to account for VAT, it will be added at the prevailing rate.
                            </p>
                            <p>
                                9.3 Fees are payable in advance by the methods made available on the Platform. Access to a paid Service is conditional on payment having been received.
                            </p>
                            <p>
                                9.4 You are responsible for any withholding tax applicable to payments to Pinpoint and, where you are required to withhold, you must gross up the payment so that Pinpoint receives the full amount it would have received absent the withholding, and provide the applicable withholding-tax credit note.
                            </p>
                            <p>
                                9.5 Except as expressly stated in these Terms or required by law, all fees are non-refundable.
                            </p>
                        </section>

                        {/* Section 10 */}
                        <section className="space-y-3">
                            <h2 className="text-base font-bold text-zinc-900">10. Intellectual property</h2>
                            <p>
                                10.1 The Platform, the PARAGON framework, all question banks, scoring rubrics, benchmarks, methodologies, templates, software, text, graphics, and all other Content (other than User Content) are owned by Pinpoint or its licensors and are protected by copyright, trade mark, and other intellectual-property laws. All rights are reserved.
                            </p>
                            <p>
                                10.2 Pinpoint grants you a limited, non-exclusive, non-transferable, revocable licence to access and use the Platform and the Content solely for your own internal business purposes and in accordance with these Terms.
                            </p>
                            <p>
                                10.3 “User Content” means information, documents, and materials you submit to the Platform. You retain ownership of your User Content. You grant Pinpoint a non-exclusive, royalty-free licence to use, store, copy, and process your User Content to the extent necessary to provide the Services, to improve the Services, and to compile anonymised and aggregated benchmarks and statistics that do not identify you.
                            </p>
                            <p>
                                10.4 An Assessment Report is licensed to the Startup for its own use, including sharing with its own advisers and prospective investors. The methodology, framework, and benchmarks underlying the Report remain Pinpoint’s exclusive property and may not be extracted, copied, or reused.
                            </p>
                            <p>
                                10.5 You must not use Pinpoint’s name, logo, or marks without prior written consent, except that a Startup may factually state that it has completed a Pinpoint assessment.
                            </p>
                        </section>

                        {/* Section 11 */}
                        <section className="space-y-3">
                            <h2 className="text-base font-bold text-zinc-900">11. Confidentiality</h2>
                            <p>
                                11.1 Each party may receive confidential information of the other. Each party must keep the other’s confidential information confidential, use it only for the purposes of these Terms and the Services, and protect it with reasonable care.
                            </p>
                            <p>
                                11.2 Pinpoint will treat a Startup’s non-public business information as confidential and will not disclose it to Investors or third parties except with the Startup’s consent (including consent given on admission to the PIN), to its own personnel and advisers on a need-to-know basis, or as required by law or regulation.
                            </p>
                            <p>
                                11.3 The confidentiality obligations do not apply to information that is or becomes public through no breach, was lawfully known before disclosure, is independently developed, or is lawfully received from a third party.
                            </p>
                        </section>

                        {/* Section 12 */}
                        <section className="space-y-3">
                            <h2 className="text-base font-bold text-zinc-900">12. Data protection</h2>
                            <p>
                                12.1 Pinpoint processes personal data in accordance with the Nigeria Data Protection Act 2023, any regulation or guidance issued under it, and the Privacy Policy. By using the Platform you acknowledge that Pinpoint may collect, use, and process personal data as described in the Privacy Policy.
                            </p>
                            <p>
                                12.2 Where a Startup provides Pinpoint with personal data of its own personnel, customers, or third parties, the Startup warrants that it has a lawful basis to do so and that the disclosure to Pinpoint is lawful.
                            </p>
                            <p>
                                12.3 Each party will implement appropriate technical and organisational measures to protect personal data against unauthorised or unlawful processing and against accidental loss, destruction, or damage.
                            </p>
                        </section>

                        {/* Section 13 */}
                        <section className="space-y-3">
                            <h2 className="text-base font-bold text-zinc-900">13. Third-party services and links</h2>
                            <p>
                                13.1 The Platform may contain links to, or integrate with, third-party websites or services. Pinpoint does not control and is not responsible for third-party services, and their inclusion does not imply endorsement. Your use of any third-party service is governed by that third party’s terms.
                            </p>
                        </section>

                        {/* Section 14 */}
                        <section className="space-y-3">
                            <h2 className="text-base font-bold text-zinc-900">14. Disclaimers and no guarantee of outcome</h2>
                            <p>
                                14.1 To the fullest extent permitted by law, the Platform, the Content, and the Services are provided “as is” and “as available”, and Pinpoint disclaims all warranties, whether express, implied, or statutory, including any implied warranty of merchantability, fitness for a particular purpose, accuracy, and non-infringement.
                            </p>
                            <p>
                                14.2 Pinpoint does not warrant that the Platform will be uninterrupted, error-free, or secure, or that any score, report, benchmark, or forecast is accurate, complete, or will prove correct.
                            </p>
                            <p>
                                14.3 Any score, band, forecast, valuation range, or benchmark is an opinion and an estimate only, and must not be relied upon as a statement of fact or a promise of any outcome.
                            </p>
                            <p>
                                14.4 The Services do not constitute legal, tax, accounting, financial, or investment advice. You must obtain your own independent professional advice before making any decision.
                            </p>
                        </section>

                        {/* Section 15 */}
                        <section className="space-y-3">
                            <h2 className="text-base font-bold text-zinc-900">15. Limitation of liability</h2>
                            <p>
                                15.1 Nothing in these Terms excludes or limits liability that cannot lawfully be excluded or limited, including liability for fraud, fraudulent misrepresentation, death, or personal injury caused by negligence.
                            </p>
                            <p>
                                15.2 Subject to clause 15.1, Pinpoint is not liable for any indirect, incidental, special, consequential, or punitive loss, or for any loss of profit, revenue, business, opportunity, goodwill, anticipated savings, or investment, or for any loss arising from a Startup’s failure to raise capital or from any dealing with an Investor, whether in contract, tort (including negligence), or otherwise, even if advised of the possibility.
                            </p>
                            <p>
                                15.3 Subject to clause 15.1, Pinpoint’s total aggregate liability arising out of or in connection with these Terms and the Services, whether in contract, tort, or otherwise, is limited to the total fees actually paid by you to Pinpoint for the specific Service giving rise to the claim in the twelve (12) months preceding the event giving rise to the liability. Where the Service in question is the free Self-Scan, Pinpoint’s aggregate liability is limited to ₦50,000 or the equivalent in any other relevant currency.
                            </p>
                            <p>
                                15.4 Pinpoint has no liability whatsoever for the acts, omissions, representations, solvency, or conduct of any Investor, funder, or other User, or for any transaction or dealing between Users.
                            </p>
                            <p>
                                15.5 You agree that the allocation of risk in this clause and in clause 15 is reasonable given the nature of the Services and the fees charged.
                            </p>
                        </section>

                        {/* Section 16 */}
                        <section className="space-y-3">
                            <h2 className="text-base font-bold text-zinc-900">16. Indemnity</h2>
                            <p>
                                16.1 You agree to indemnify and hold harmless Pinpoint, its directors, officers, employees, and agents against all claims, liabilities, losses, and reasonable costs (including legal fees) arising out of or in connection with: (a) your breach of these Terms; (b) your violation of any law or the rights of any third party; (c) any information or document you submit to the Platform; or (d) any dealing between you and any Investor or other User.
                            </p>
                        </section>

                        {/* Section 17 */}
                        <section className="space-y-3">
                            <h2 className="text-base font-bold text-zinc-900">17. Suspension, termination, and effect</h2>
                            <p>
                                17.1 You may stop using the Platform at any time. Certain provisions survive, as set out in clause 17.4.
                            </p>
                            <p>
                                17.2 Pinpoint may suspend or terminate your access to the Platform or any Service, in whole or in part, immediately and without liability, if you breach these Terms, if required by law, or to protect the Platform or other Users.
                            </p>
                            <p>
                                17.3 Termination does not affect any accrued rights or liabilities, and does not entitle you to any refund except as expressly provided.
                            </p>
                            <p>
                                17.4 Clauses concerning nature of the Services (3), intellectual property (10), confidentiality (11), disclaimers (14), limitation of liability (15), indemnity (16), dispute resolution (18), and governing law (19), together with any provision that by its nature should survive, continue in force after termination.
                            </p>
                        </section>

                        {/* Section 18 */}
                        <section className="space-y-3">
                            <h2 className="text-base font-bold text-zinc-900">18. Dispute resolution</h2>
                            <p>
                                18.1 Scope. This clause applies to any dispute, controversy, or claim arising out of or in connection with these Terms or the Services, including any question as to their existence, validity, interpretation, breach, or termination (a “Dispute”).
                            </p>
                            <p>
                                18.2 Stage 1 — Good-faith negotiation. A party raising a Dispute must give the other written notice describing it. Senior representatives of each party (and, for a Startup, a Founder or director) must then attempt in good faith to resolve the Dispute through direct negotiation within twenty-one (21) days of the notice.
                            </p>
                            <p>
                                18.3 Stage 2 — Mediation. If the Dispute is not resolved by negotiation, the parties must refer it to mediation before a single mediator administered by the Lagos Multi-Door Courthouse under its mediation rules. The parties must attempt mediation in good faith for at least thirty (30) days from the appointment of the mediator before either may commence arbitration. The costs of the mediator are shared equally.
                            </p>
                            <p>
                                18.4 Stage 3 — Arbitration. Any Dispute not resolved by mediation is finally resolved by arbitration under the Arbitration and Mediation Act 2023, in accordance with the rules of the Lagos Court of Arbitration, which rules are deemed incorporated by reference. The arbitration is subject to the following:
                            </p>
                            <ul className="list-disc pl-6 space-y-2 text-zinc-650">
                                <li>(a) the seat, or legal place, of arbitration is Lagos, Nigeria;</li>
                                <li>(b) the tribunal consists of a sole arbitrator, unless the amount in dispute exceeds ₦50,000,000 (or its US-dollar equivalent), in which case the tribunal consists of three arbitrators;</li>
                                <li>(c) the language of the arbitration is English;</li>
                                <li>(d) the award is final and binding on the parties, who waive any right of appeal to the extent permitted by law; and</li>
                                <li>(e) each party bears its own costs, and the costs of the arbitration are borne as the tribunal directs.</li>
                            </ul>
                            <p>
                                18.5 Urgent relief. Nothing in this clause prevents a party from applying to a court of competent jurisdiction in Nigeria for urgent interim or injunctive relief (including to protect confidential information or intellectual property) before or during the tiered process, without waiving that process.
                            </p>
                            <p>
                                18.6 Continuing performance. Except where the subject of the Dispute makes it impossible, the parties continue to perform their obligations during the resolution of a Dispute.
                            </p>
                            <p>
                                18.7 Confidentiality of proceedings. The existence and content of any negotiation, mediation, or arbitration under this clause, and any award, are confidential, save as required to enforce an award or by law.
                            </p>
                            <p>
                                18.8 Time bar. A party must commence Stage 1 within twelve (12) months of becoming aware of the facts giving rise to a Dispute, failing which the claim is waived to the extent permitted by law.
                            </p>
                        </section>

                        {/* Section 19 */}
                        <section className="space-y-3">
                            <h2 className="text-base font-bold text-zinc-900">19. Governing law</h2>
                            <p>
                                19.1 These Terms, and any Dispute, are governed by and construed in accordance with the laws of the Federal Republic of Nigeria.
                            </p>
                            <p>
                                19.2 Subject to clause 18, the courts of Nigeria have jurisdiction in respect of any matter not required to be referred to arbitration.
                            </p>
                        </section>

                        {/* Section 20 */}
                        <section className="space-y-3">
                            <h2 className="text-base font-bold text-zinc-900">20. General</h2>
                            <p>
                                20.1 Entire agreement. These Terms, the Privacy Policy, and any applicable engagement letter or value agreement constitute the entire agreement between the parties and supersede all prior understandings. Where an engagement letter for a PIA or PIW conflicts with these Terms, the engagement letter prevails for that engagement.
                            </p>
                            <p>
                                20.2 Variation. Pinpoint may amend these Terms by posting the revised Terms on the Platform. Continued use after the effective date of a change constitutes acceptance. Material changes will be notified where reasonably practicable.
                            </p>
                            <p>
                                20.3 Assignment. You may not assign or transfer your rights under these Terms without Pinpoint’s prior written consent. Pinpoint may assign its rights and obligations to an affiliate or successor.
                            </p>
                            <p>
                                20.4 No partnership or agency. Nothing in these Terms creates a partnership, joint venture, agency, employment, or fiduciary relationship between the parties.
                            </p>
                            <p>
                                20.5 Third parties. A person who is not a party to these Terms has no right to enforce any of its provisions.
                            </p>
                            <p>
                                20.6 Severance. If any provision is held invalid or unenforceable, it is severed and the remaining provisions continue in full force.
                            </p>
                            <p>
                                20.7 Waiver. No failure or delay in exercising a right operates as a waiver of it.
                            </p>
                            <p>
                                20.8 Force majeure. Pinpoint is not liable for any failure or delay caused by events beyond its reasonable control.
                            </p>
                            <p>
                                20.9 Notices. Notices to Pinpoint must be sent to legal@pinpointlaunchpad.com and to its registered office. Notices to you may be sent to the email or address associated with your account.
                            </p>
                        </section>

                        <div className="border-t border-zinc-200 pt-6 text-xs text-zinc-500 font-semibold">
                            By accessing or using the Platform, you acknowledge that you have read and understood these Terms and agree to be bound by them.
                        </div>
                    </div>
                </main>

                <footer className="py-8 text-center text-xs text-zinc-400 font-semibold border-t border-zinc-200 bg-white">
                    <p>© {new Date().getFullYear()} Pinpoint Launchpad Ltd. All rights reserved.</p>
                </footer>
            </div>
        </>
    );
}
