<!DOCTYPE html>
<html lang="en" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta http-equiv="X-UA-Compatible" content="IE=edge">
<meta name="x-apple-disable-message-reformatting">
<meta name="format-detection" content="telephone=no,date=no,address=no,email=no">
<title>You're on the list — Pinpoint Launchpad</title>
<!--[if mso]>
<noscript><xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml></noscript>
<![endif]-->
<style>
    body,table,td,a{-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%}
    table,td{mso-table-lspace:0pt;mso-table-rspace:0pt}
    img{-ms-interpolation-mode:bicubic;border:0;height:auto;line-height:100%;outline:none;text-decoration:none}
    body{margin:0;padding:0;background-color:#0a0a0a}

    @media only screen and (max-width:640px){
        .outer{width:100%!important}
        .inner{padding:32px 24px!important}
        .hdr{padding:28px 24px!important}
        .ftr{padding:24px 24px!important}
        .headline{font-size:22px!important;line-height:1.3!important}
        .checklist-cell{padding:20px!important}
        .btn-link{padding:14px 20px!important;font-size:13px!important}
    }
</style>
</head>
<body style="margin:0;padding:0;background-color:#0a0a0a;">

{{-- Preview text --}}
<div style="display:none;max-height:0;overflow:hidden;mso-hide:all;font-size:1px;color:#0a0a0a;">
    You're on the list. Here's your Founder Readiness Checklist — the signals that separate investable from interesting.
    &nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;
</div>

<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#0a0a0a;">
<tr>
<td align="center" style="padding:40px 16px 48px;">

    <!--[if mso]><table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0"><tr><td><![endif]-->

    <table role="presentation" class="outer" width="600" cellpadding="0" cellspacing="0" border="0"
        style="max-width:600px;width:100%;background-color:#111111;border-radius:12px;overflow:hidden;border:1px solid #1e1e1e;">

        {{-- ── TOP ACCENT BAR ── --}}
        <tr>
            <td style="height:3px;background:linear-gradient(90deg,#5ca336 0%,#3c53a8 100%);font-size:0;line-height:0;">&nbsp;</td>
        </tr>

        {{-- ── HEADER ── --}}
        <tr>
            <td class="hdr" style="padding:32px 40px 28px;">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                    <td>
                        <span style="font-family:Arial,Helvetica,sans-serif;font-size:18px;font-weight:700;
                                     color:#ffffff;letter-spacing:-0.2px;">Pinpoint</span>
                        <span style="font-family:Arial,Helvetica,sans-serif;font-size:10px;font-weight:600;
                                     color:#5ca336;letter-spacing:0.12em;text-transform:uppercase;
                                     margin-left:7px;vertical-align:middle;">Launchpad</span>
                    </td>
                    <td align="right">
                        <span style="font-family:Arial,Helvetica,sans-serif;font-size:10px;font-weight:600;
                                     color:#4b4b4b;letter-spacing:0.1em;text-transform:uppercase;">
                            Founder Access
                        </span>
                    </td>
                </tr>
                </table>
            </td>
        </tr>

        {{-- ── DIVIDER ── --}}
        <tr>
            <td style="padding:0 40px;">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr><td style="border-top:1px solid #1e1e1e;font-size:0;line-height:0;">&nbsp;</td></tr>
                </table>
            </td>
        </tr>

        {{-- ── BODY ── --}}
        <tr>
            <td class="inner" style="padding:36px 40px 32px;">

                {{-- Greeting --}}
                <p style="margin:0 0 6px;font-family:Arial,Helvetica,sans-serif;font-size:14px;
                           color:#6b6b6b;line-height:1.5;">
                    Hi {{ $entry->name }},
                </p>

                {{-- Headline --}}
                <h1 class="headline" style="margin:0 0 20px;font-family:Arial,Helvetica,sans-serif;font-size:26px;
                               font-weight:700;color:#f5f5f5;line-height:1.25;letter-spacing:-0.4px;">
                    You're officially on the waitlist.
                </h1>

                {{-- Body copy --}}
                <p style="margin:0 0 28px;font-family:Arial,Helvetica,sans-serif;font-size:15px;
                           color:#a0a0a0;line-height:1.75;">
                    While we calibrate the <span style="color:#f5f5f5;font-weight:600;">PARAGON engine</span>
                    and prepare your diagnostic slot, here's your head start — the
                    <span style="color:#f5f5f5;font-weight:600;">Founder Readiness Checklist</span>.
                    These are the signals that separate investable from interesting.
                </p>

                {{-- Checklist box --}}
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"
                    style="background-color:#161616;border-radius:8px;border:1px solid #1e1e1e;margin-bottom:28px;">
                <tr>
                    <td class="checklist-cell" style="padding:24px 28px;">

                        <p style="margin:0 0 18px;font-family:Arial,Helvetica,sans-serif;font-size:10px;
                                  font-weight:700;letter-spacing:0.14em;text-transform:uppercase;color:#5ca336;">
                            Founder Readiness Checklist
                        </p>

                        @php
                        $items = [
                            'MVP in hands of 5–10 pilot users',
                            'Company legally owns all IP and trademarks',
                            'Cap table is clean — founders own >80%',
                            'You know your CAC and LTV',
                            '12–18 month financial forecast exists',
                            'At least 1 LOI, pilot contract, or $1k MRR secured',
                        ];
                        @endphp

                        @foreach($items as $i => $item)
                        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"
                            style="{{ $loop->last ? '' : 'margin-bottom:12px;' }}">
                        <tr>
                            <td width="28" valign="top" style="padding-top:1px;">
                                <span style="display:inline-block;width:18px;height:18px;background-color:#5ca336;
                                             border-radius:3px;text-align:center;line-height:18px;
                                             font-family:Arial,Helvetica,sans-serif;font-size:11px;
                                             font-weight:700;color:#ffffff;">✓</span>
                            </td>
                            <td style="font-family:Arial,Helvetica,sans-serif;font-size:14px;
                                       color:#c8c8c8;line-height:1.55;">
                                {{ $item }}
                            </td>
                        </tr>
                        </table>
                        @endforeach

                    </td>
                </tr>
                </table>

                {{-- Closing line --}}
                <p style="margin:0 0 28px;font-family:Arial,Helvetica,sans-serif;font-size:15px;
                           color:#a0a0a0;line-height:1.75;">
                    We'll notify you the moment your diagnostic slot opens. Until then, use this checklist
                    to close any gaps — the founders who move fast get seen first.
                </p>

                {{-- Sign-off --}}
                <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:14px;
                           color:#6b6b6b;line-height:1.6;">
                    Talk soon,<br>
                    <span style="color:#f5f5f5;font-weight:600;">The Pinpoint Team</span>
                </p>

            </td>
        </tr>

        {{-- ── FOOTER ── --}}
        <tr>
            <td style="padding:0 40px;">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr><td style="border-top:1px solid #1e1e1e;font-size:0;line-height:0;">&nbsp;</td></tr>
                </table>
            </td>
        </tr>
        <tr>
            <td class="ftr" style="padding:20px 40px 28px;">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                    <td>
                        <p style="margin:0 0 3px;font-family:Arial,Helvetica,sans-serif;font-size:12px;
                                  font-weight:700;color:#3c53a8;letter-spacing:0.06em;text-transform:uppercase;">
                            Pinpoint Launchpad
                        </p>
                        <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:11px;color:#4b4b4b;">
                            Filtering for Quality. Solving for Success.
                        </p>
                    </td>
                    <td align="right" valign="middle">
                        <a href="#" style="font-family:Arial,Helvetica,sans-serif;font-size:11px;
                                           color:#4b4b4b;text-decoration:none;border-bottom:1px solid #2a2a2a;">
                            Unsubscribe
                        </a>
                    </td>
                </tr>
                </table>
            </td>
        </tr>

        {{-- ── BOTTOM ACCENT BAR ── --}}
        <tr>
            <td style="height:2px;background:linear-gradient(90deg,#3c53a8 0%,#5ca336 100%);font-size:0;line-height:0;">&nbsp;</td>
        </tr>

    </table>
    <!--[if mso]></td></tr></table><![endif]-->

    <p style="margin:20px 0 0;font-family:Arial,Helvetica,sans-serif;font-size:11px;
               color:#3a3a3a;text-align:center;line-height:1.6;">
        You received this because you joined the Pinpoint Launchpad waitlist.<br>
        &copy; {{ date('Y') }} Pinpoint Launchpad. All rights reserved.
    </p>

</td>
</tr>
</table>

</body>
</html>
