<x-email-layout
    :recipient-email="$session->email"
    subject="VCs don't buy visions. They buy de-risked assets."
    badge="PARAGON Score"
    preheader="VCs don't buy visions. They buy de-risked assets. Here's what that means for you.">

{{-- Greeting --}}
<p style="margin:0 0 6px;font-family:Arial,Helvetica,sans-serif;font-size:14px;color:#6b6b6b;line-height:1.5;">
    Hi there,
</p>

{{-- Headline --}}
<h1 style="margin:0 0 20px;font-family:Arial,Helvetica,sans-serif;font-size:26px;font-weight:700;color:#f5f5f5;line-height:1.25;letter-spacing:-0.4px;">
    VCs don't buy visions.<br>They buy de-risked assets.
</h1>

<p style="margin:0 0 28px;font-family:Arial,Helvetica,sans-serif;font-size:15px;color:#a0a0a0;line-height:1.75;">
    Two days ago, your PARAGON score of <span style="color:#f5f5f5;font-weight:600;">{{ $session->score }}/100</span> told us you have the fundamentals. Here is what it did not tell you:
</p>

{{-- Value box --}}
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"
    style="background-color:#161616;border-radius:8px;border:1px solid #1e1e1e;border-left:3px solid #3c53a8;margin-bottom:28px;">
    <tr>
        <td style="padding:24px 28px;">
            <p style="margin:0 0 10px;font-family:Arial,Helvetica,sans-serif;font-size:10px;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;color:#3c53a8;">
                What the PIN Network means
            </p>
            <p style="margin:0 0 12px;font-family:Arial,Helvetica,sans-serif;font-size:14px;color:#c8c8c8;line-height:1.65;">
                The PIA fee is not a cost. It is your entrance into the PIN Network — a curated pipeline of pre-vetted ventures that institutional VCs actually return calls for.
            </p>
            <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:14px;color:#c8c8c8;line-height:1.65;">
                Without it, you are one of 10,000 founders cold-emailing partners who delete unread. With it, you are one of the verified few that gets a warm introduction.
            </p>
        </td>
    </tr>
</table>

<p style="margin:0 0 16px;font-family:Arial,Helvetica,sans-serif;font-size:14px;color:#6b6b6b;">The audit covers:</p>

<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"
    style="background-color:#161616;border-radius:8px;border:1px solid #1e1e1e;margin-bottom:28px;">
    <tr>
        <td style="padding:20px 28px;">
            @php
            $items = [
                'Forensic review of your CAC and LTV via bank or Stripe data',
                'Cap table audit — clean or flagged, you will know exactly',
                'IP and legal structure verification',
                'Analyst-signed Radar Chart for your pitch deck',
            ];
            @endphp
            @foreach($items as $item)
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"
                style="{{ $loop->last ? '' : 'margin-bottom:12px;' }}">
            <tr>
                <td width="28" valign="top" style="padding-top:1px;">
                    <span style="display:inline-block;width:18px;height:18px;background-color:#3c53a8;border-radius:3px;text-align:center;line-height:18px;font-family:Arial,Helvetica,sans-serif;font-size:12px;font-weight:700;color:#ffffff;">→</span>
                </td>
                <td style="font-family:Arial,Helvetica,sans-serif;font-size:14px;color:#c8c8c8;line-height:1.55;">
                    {{ $item }}
                </td>
            </tr>
            </table>
            @endforeach
        </td>
    </tr>
</table>

{{-- CTA --}}
<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:28px;">
    <tr>
        <td style="border-radius:6px;background:linear-gradient(135deg,#3c53a8 0%,#5ca336 100%);">
            <a href="{{ url('/checkout') }}"
               style="display:inline-block;padding:14px 32px;font-family:Arial,Helvetica,sans-serif;font-size:14px;font-weight:700;color:#ffffff;text-decoration:none;letter-spacing:0.03em;">
                Secure Your Place →
            </a>
        </td>
    </tr>
</table>

<p style="margin:0 0 28px;font-family:Arial,Helvetica,sans-serif;font-size:15px;color:#a0a0a0;line-height:1.75;">
    The PIN Network intake closes at the end of this month. Spots are limited by analyst capacity.
</p>

{{-- Sign-off --}}
<p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:14px;color:#6b6b6b;line-height:1.6;">
    Talk soon,<br>
    <span style="color:#f5f5f5;font-weight:600;">The Pinpoint Team</span>
</p>

</x-email-layout>
