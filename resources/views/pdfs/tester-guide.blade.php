<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
    <title>Pinpoint Launchpad - Client Review Guide</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }

        body {
            font-family: DejaVu Sans, sans-serif;
            font-size: 11px;
            color: #1a1a2e;
            background: #ffffff;
            line-height: 1.6;
        }

        .cover {
            width: 100%;
            height: 100%;
            min-height: 800px;
            background: #0D1626;
            padding: 80px 60px;
            text-align: center;
        }

        .cover-logo {
            font-size: 11px;
            font-weight: bold;
            letter-spacing: 4px;
            text-transform: uppercase;
            color: #3A54A5;
            margin-bottom: 60px;
        }

        .cover-badge {
            display: inline-block;
            border: 1px solid #3A54A5;
            color: #3A54A5;
            font-size: 9px;
            letter-spacing: 3px;
            text-transform: uppercase;
            padding: 6px 18px;
            margin-bottom: 30px;
        }

        .cover-title {
            font-size: 32px;
            font-weight: bold;
            color: #D8E0F3;
            line-height: 1.2;
            margin-bottom: 16px;
        }

        .cover-subtitle {
            font-size: 13px;
            color: #C1CDE8;
            margin-bottom: 60px;
        }

        .cover-meta {
            font-size: 10px;
            color: #91A7D8;
            letter-spacing: 1px;
        }

        .cover-divider {
            width: 60px;
            height: 2px;
            background: #3A54A5;
            margin: 40px auto;
        }

        .cover-url {
            font-size: 13px;
            color: #3A54A5;
            margin-top: 20px;
        }

        .page {
            padding: 50px 55px;
        }

        .page-header {
            border-bottom: 2px solid #3A54A5;
            padding-bottom: 14px;
            margin-bottom: 30px;
        }

        .page-header-logo {
            font-size: 9px;
            letter-spacing: 3px;
            text-transform: uppercase;
            color: #3A54A5;
            font-weight: bold;
        }

        .page-header-title {
            font-size: 20px;
            font-weight: bold;
            color: #0D1626;
            margin-top: 4px;
        }

        .section {
            margin-bottom: 28px;
        }

        .section-number {
            display: inline-block;
            width: 22px;
            height: 22px;
            background: #3A54A5;
            color: #ffffff;
            font-size: 11px;
            font-weight: bold;
            text-align: center;
            line-height: 22px;
            margin-right: 8px;
        }

        .section-title {
            font-size: 14px;
            font-weight: bold;
            color: #0D1626;
            display: inline;
        }

        .section-body {
            margin-top: 10px;
            padding-left: 30px;
        }

        .steps {
            margin: 8px 0;
            counter-reset: step-counter;
        }

        .step {
            margin-bottom: 5px;
            padding-left: 14px;
            position: relative;
        }

        .step:before {
            content: counter(step-counter);
            counter-increment: step-counter;
            position: absolute;
            left: 0;
            color: #3A54A5;
            font-weight: bold;
            font-size: 10px;
        }

        .checklist { margin: 8px 0; }

        .check-item {
            margin-bottom: 4px;
            padding-left: 16px;
            position: relative;
            color: #374151;
        }

        .check-item:before {
            content: "\2713";
            position: absolute;
            left: 0;
            color: #3A54A5;
            font-weight: bold;
        }

        .warning-box {
            background: #FFF8E7;
            border-left: 3px solid #F59E0B;
            padding: 10px 14px;
            margin: 10px 0;
            font-size: 10px;
            color: #92400E;
        }

        .info-box {
            background: #EFF6FF;
            border-left: 3px solid #3A54A5;
            padding: 10px 14px;
            margin: 10px 0;
            font-size: 10px;
            color: #1e3a5f;
        }

        .card {
            border: 1px solid #E5E7EB;
            padding: 14px 18px;
            margin: 10px 0;
            background: #F9FAFB;
        }

        .card-label {
            font-size: 9px;
            letter-spacing: 2px;
            text-transform: uppercase;
            color: #9CA3AF;
            margin-bottom: 4px;
        }

        .card-value {
            font-size: 12px;
            font-weight: bold;
            color: #0D1626;
            font-family: DejaVu Sans Mono, monospace;
        }

        table {
            width: 100%;
            border-collapse: collapse;
            margin: 10px 0;
            font-size: 10px;
        }

        th {
            background: #0D1626;
            color: #ffffff;
            padding: 8px 12px;
            text-align: left;
            font-size: 9px;
            letter-spacing: 1px;
            text-transform: uppercase;
        }

        td {
            padding: 8px 12px;
            border-bottom: 1px solid #E5E7EB;
            color: #374151;
        }

        tr:nth-child(even) td { background: #F9FAFB; }

        .footer {
            border-top: 1px solid #E5E7EB;
            padding-top: 14px;
            margin-top: 40px;
            font-size: 9px;
            color: #9CA3AF;
            text-align: center;
        }

        .confidential {
            background: #0D1626;
            color: #3A54A5;
            font-size: 8px;
            letter-spacing: 2px;
            text-transform: uppercase;
            padding: 4px 12px;
            display: inline-block;
            margin-bottom: 6px;
        }

        p { margin-bottom: 8px; }
        strong { color: #0D1626; }
    </style>
</head>
<body>
<div class="cover">
    <div class="cover-logo">Pinpoint Launchpad</div>
    <div class="cover-badge">Confidential &middot; Client Review</div>
    <div class="cover-title">Client Review<br>Guide</div>
    <div class="cover-subtitle">
        A structured walkthrough for reviewing the Pinpoint Launchpad experience,<br>
        validating key flows, and approving launch readiness.
    </div>
    <div class="cover-divider"></div>
    <div class="cover-url">https://app.pinpointlaunchpad.com</div>
    <div style="margin-top: 60px;">
        <div class="cover-meta">Version 1.0 &middot; {{ date('F Y') }} &middot; Private Review Copy</div>
    </div>
</div>

<div class="page">
    <div class="page-header">
        <div class="page-header-logo">Pinpoint Launchpad &middot; Client Review Guide</div>
        <div class="page-header-title">Introduction</div>
    </div>

    <div class="section">
        <p>
            This guide is for client review of the current Pinpoint Launchpad build. It focuses on the main founder journey,
            customer-facing messaging, and the areas that should be approved before launch.
        </p>
        <p>
            The goal is not only to find bugs, but also to confirm that the product flow, messaging, and overall experience
            feel correct from a real user perspective.
        </p>

        <div class="info-box">
            <strong>Testing URL:</strong> https://app.pinpointlaunchpad.com<br>
            <strong>Report Issues To:</strong> davidakintunde433@gmail.com<br>
            <strong>Suggested Review Window:</strong> Complete review within 5 business days<br>
            <strong>Primary Focus:</strong> Founder journey, payments, onboarding, dashboard, and public verification page
        </div>
    </div>

    <div class="section">
        <span class="section-number">1</span>
        <span class="section-title">What To Review</span>
        <div class="section-body">
            <p>Please review the platform in three ways:</p>
            <div class="checklist">
                <div class="check-item"><strong>Functional review:</strong> Does each flow work end to end without errors?</div>
                <div class="check-item"><strong>Business review:</strong> Do the words, pricing, steps, and outcomes feel right for your users?</div>
                <div class="check-item"><strong>Visual review:</strong> Does the product feel polished, clear, and trustworthy on desktop and mobile?</div>
            </div>

            <p style="margin-top:10px;"><strong>Please pay close attention to:</strong></p>
            <div class="checklist">
                <div class="check-item">Clarity of messaging and calls to action</div>
                <div class="check-item">Any broken links, blank states, or confusing steps</div>
                <div class="check-item">Email delivery and email copy</div>
                <div class="check-item">Data shown after payment and onboarding</div>
                <div class="check-item">Overall confidence and professionalism of the experience</div>
            </div>
        </div>
    </div>

    <div class="section">
        <span class="section-number">2</span>
        <span class="section-title">Founder Journey: Public Entry and Waitlist</span>
        <div class="section-body">
            <p>The public site begins at the waitlist experience and then moves into the diagnostic flow.</p>

            <div class="steps">
                <div class="step">Visit <strong>https://app.pinpointlaunchpad.com</strong></div>
                <div class="step">Review the public waitlist page for both founder and investor audiences</div>
                <div class="step">Submit a founder waitlist form and an investor waitlist form if needed for review</div>
                <div class="step">Proceed to the diagnostic at <strong>/diagnostic</strong></div>
            </div>

            <p style="margin-top:10px;"><strong>What to review:</strong></p>
            <div class="checklist">
                <div class="check-item">Page messaging is clear for both founders and investors</div>
                <div class="check-item">Forms submit successfully</div>
                <div class="check-item">The visual quality matches the expected brand standard</div>
                <div class="check-item">The next step into the diagnostic feels obvious</div>
                <div class="check-item">Mobile layout remains easy to use</div>
            </div>
        </div>
    </div>

    <div class="section">
        <span class="section-number">3</span>
        <span class="section-title">Diagnostic Assessment</span>
        <div class="section-body">
            <p>The diagnostic is the main qualification flow for founders.</p>

            <div class="steps">
                <div class="step">Go to <strong>https://app.pinpointlaunchpad.com/diagnostic</strong></div>
                <div class="step">Answer all available questions</div>
                <div class="step">Submit the assessment</div>
                <div class="step">Review the result page and score explanation</div>
                <div class="step">Continue from the result page into checkout</div>
            </div>

            <p style="margin-top:10px;"><strong>What to review:</strong></p>
            <div class="checklist">
                <div class="check-item">Questions load properly and are easy to understand</div>
                <div class="check-item">Submission works without errors</div>
                <div class="check-item">The result page feels credible and useful</div>
                <div class="check-item">Score, recommendation, and pillar breakdown appear correctly</div>
                <div class="check-item">The handoff into paid audit feels natural and persuasive</div>
            </div>
        </div>
    </div>

    <div class="section">
        <span class="section-number">4</span>
        <span class="section-title">Checkout &amp; Payment</span>
        <div class="section-body">
            <div class="warning-box">
                Use the approved test payment method only. No live payment should be made during review.
            </div>

            <div class="steps">
                <div class="step">Review the available audit tiers</div>
                <div class="step">Select a plan and proceed to payment</div>
                <div class="step">Complete payment using test credentials supplied by the team</div>
                <div class="step">Confirm the success or failure state shown after payment</div>
            </div>

            <div class="card">
                <div class="card-label">Test Payment Reminder</div>
                <div class="card-value">Use sandbox or team-provided test credentials only</div>
            </div>

            <p style="margin-top:10px;"><strong>What to review:</strong></p>
            <div class="checklist">
                <div class="check-item">Tier names, pricing, and descriptions are correct</div>
                <div class="check-item">The payment experience feels secure and clear</div>
                <div class="check-item">Successful payment routes into onboarding correctly</div>
                <div class="check-item">Failure or cancel states are understandable</div>
                <div class="check-item">Receipt and confirmation language feel client-ready</div>
            </div>
        </div>
    </div>

    <div class="section">
        <span class="section-number">5</span>
        <span class="section-title">Agreement Signing and Account Setup</span>
        <div class="section-body">
            <p>After payment, the founder confirms details, signs the agreement, and receives the account setup invite.</p>

            <div class="steps">
                <div class="step">Review the confirm-details step</div>
                <div class="step">Proceed to the signing experience</div>
                <div class="step">Complete signing and wait for the completion state</div>
                <div class="step">Open the setup email and create the founder account</div>
                <div class="step">Confirm the account lands in the founder dashboard</div>
            </div>

            <p style="margin-top:10px;"><strong>What to review:</strong></p>
            <div class="checklist">
                <div class="check-item">Founder name, company, and payment details carry through correctly</div>
                <div class="check-item">The signing experience loads successfully</div>
                <div class="check-item">Completion messaging feels polished and reassuring</div>
                <div class="check-item">Setup email arrives and the setup link works</div>
                <div class="check-item">The setup flow is clear and secure</div>
            </div>
        </div>
    </div>

    <div class="section">
        <span class="section-number">6</span>
        <span class="section-title">Founder Dashboard, Documents, and Messages</span>
        <div class="section-body">
            <p>The founder dashboard is the private operating area after onboarding.</p>

            <div class="steps">
                <div class="step">Log in at <strong>/founder/login</strong> if needed</div>
                <div class="step">Review the founder dashboard summary</div>
                <div class="step">Open the documents section and upload a test file</div>
                <div class="step">Open the messages section and send a test message</div>
                <div class="step">Log out and confirm the session closes cleanly</div>
            </div>

            <p style="margin-top:10px;"><strong>What to review:</strong></p>
            <div class="checklist">
                <div class="check-item">Dashboard data feels relevant and accurate</div>
                <div class="check-item">The audit status and score presentation are understandable</div>
                <div class="check-item">Document uploads and downloads work correctly</div>
                <div class="check-item">Messages are easy to send and read</div>
                <div class="check-item">The founder area feels professional and easy to trust</div>
            </div>
        </div>
    </div>

    <div class="section">
        <span class="section-number">7</span>
        <span class="section-title">Public Verification Page</span>
        <div class="section-body">
            <p>The public verification page is the outward-facing proof layer for reviewed founders.</p>

            <div class="steps">
                <div class="step">Open the sample page at <strong>/verify/sample-unicorn</strong></div>
                <div class="step">Review the summary, score, badges, and diligence assets table</div>
                <div class="step">Test the access request flow</div>
            </div>

            <p style="margin-top:10px;"><strong>What to review:</strong></p>
            <div class="checklist">
                <div class="check-item">The page feels premium and investor-ready</div>
                <div class="check-item">Score, summary, and diligence assets are clearly presented</div>
                <div class="check-item">The call to request access is obvious and credible</div>
                <div class="check-item">The page works well on mobile</div>
            </div>
        </div>
    </div>

    <div class="section">
        <span class="section-number">8</span>
        <span class="section-title">Login, Password Reset, and Edge Cases</span>
        <div class="section-body">
            <div class="steps">
                <div class="step">Log out and log back in through <strong>/founder/login</strong></div>
                <div class="step">Test incorrect credentials</div>
                <div class="step">Use the <strong>Forgot Password</strong> flow</div>
                <div class="step">Check that the reset email and reset form work correctly</div>
            </div>

            <p style="margin-top:10px;"><strong>What to review:</strong></p>
            <div class="checklist">
                <div class="check-item">Correct login works</div>
                <div class="check-item">Incorrect login shows a clear error</div>
                <div class="check-item">Password reset email is delivered</div>
                <div class="check-item">Reset flow returns the user to a usable state</div>
            </div>
        </div>
    </div>

    <div class="section">
        <span class="section-number">9</span>
        <span class="section-title">How to Report Feedback</span>
        <div class="section-body">
            <p>Send all review notes and bug reports to <strong>davidakintunde433@gmail.com</strong> using this structure:</p>

            <table>
                <tr>
                    <th>Field</th>
                    <th>Example</th>
                </tr>
                <tr>
                    <td><strong>Page</strong></td>
                    <td>app.pinpointlaunchpad.com/diagnostic</td>
                </tr>
                <tr>
                    <td><strong>Type</strong></td>
                    <td>Bug / Copy issue / Design feedback / Business logic concern</td>
                </tr>
                <tr>
                    <td><strong>Steps</strong></td>
                    <td>1. Answered all questions. 2. Clicked Submit. 3. Saw a blank screen.</td>
                </tr>
                <tr>
                    <td><strong>Expected</strong></td>
                    <td>Result page should appear with score and recommendation</td>
                </tr>
                <tr>
                    <td><strong>Actual</strong></td>
                    <td>Blank screen with no visible result</td>
                </tr>
                <tr>
                    <td><strong>Priority</strong></td>
                    <td>High / Medium / Low</td>
                </tr>
                <tr>
                    <td><strong>Device / Browser</strong></td>
                    <td>iPhone 14 / Safari 17</td>
                </tr>
                <tr>
                    <td><strong>Screenshot / Video</strong></td>
                    <td>Attach if available</td>
                </tr>
            </table>
        </div>
    </div>

    <div class="section">
        <span class="section-number">10</span>
        <span class="section-title">Client Sign-Off Checklist</span>
        <div class="section-body">
            <p>Use this final checklist to confirm launch readiness:</p>

            <div class="checklist">
                <div class="check-item">Public entry and diagnostic flow approved</div>
                <div class="check-item">Checkout and onboarding flow approved</div>
                <div class="check-item">Founder dashboard experience approved</div>
                <div class="check-item">Emails and transactional messages approved</div>
                <div class="check-item">Public verification page approved</div>
                <div class="check-item">No unresolved high-priority issues remain</div>
            </div>
        </div>
    </div>

    <div class="footer">
        <div class="confidential">Confidential</div><br>
        This document is intended solely for the Pinpoint Launchpad client review process.<br>
        Please do not share externally. &middot; &copy; {{ date('Y') }} Pinpoint Launchpad. All rights reserved.
    </div>
</div>
</body>
</html>
