<x-email-layout
    :recipient-email="$session->email"
    subject="From 72 to a $2M Seed round — here's what changed"
    badge="PARAGON Score"
    preheader="A founder with a score almost identical to yours closed a $2M Seed. Here is what changed.">

{{-- Greeting --}}
<p style="margin:0 0 6px;font-family:Arial,Helvetica,sans-serif;font-size:14px;color:#6b6b6b;line-height:1.5;">
    Hi there,
</p>

{{-- Headline --}}
<h1 style="margin:0 0 20px;font-family:Arial,Helvetica,sans-serif;font-size:26px;font-weight:700;color:#f5f5f5;line-height:1.25;letter-spacing:-0.4px;">
    From 72 to a $2M Seed round.<br>Here's what changed.
</h1>

<p style="margin:0 0 28px;font-family:Arial,Helvetica,sans-serif;font-size:15px;color:#a0a0a0;line-height:1.75;">
    A founder came to us with a score of 72 — almost identical to yours. Their <span style="color:#f5f5f5;font-weight:600;">{{ $session->primaryGap() }}</span> pillar was their biggest gap. They knew their product. They knew their market. But their unit economics were unverified and their cap table had dead equity from a departed co-founder.
</p>

<p style="margin:0 0 28px;font-family:Arial,Helvetica,sans-serif;font-size:15px;color:#a0a0a0;line-height:1.75;">
    Two VCs had already passed. No explanation given.
</p>

{{-- Results box --}}
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"
    style="background-color:#161616;border-radius:8px;border:1px solid #1e1e1e;border-left:3px solid #5ca336;margin-bottom:28px;">
    <tr>
        <td style="padding:24px 28px;">
            <p style="margin:0 0 18px;font-family:Arial,Helvetica,sans-serif;font-size:10px;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;color:#5ca336;">
                After the PARAGON Certification
            </p>
            @php
            $results = [
                'Dead equity was restructured in 3 weeks',
                'LTV/CAC was verified via 6 months of Stripe data',
                'Their Radar Chart went into every deck',
                'They closed a $2M Seed round 4 weeks after certification',
            ];
            @endphp
            @foreach($results as $result)
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"
                style="{{ $loop->last ? '' : 'margin-bottom:12px;' }}">
            <tr>
                <td width="28" valign="top" style="padding-top:1px;">
                    <span style="display:inline-block;width:18px;height:18px;background-color:#5ca336;border-radius:3px;text-align:center;line-height:18px;font-family:Arial,Helvetica,sans-serif;font-size:11px;font-weight:700;color:#ffffff;">✓</span>
                </td>
                <td style="font-family:Arial,Helvetica,sans-serif;font-size:14px;color:#c8c8c8;line-height:1.55;">
                    {{ $result }}
                </td>
            </tr>
            </table>
            @endforeach
        </td>
    </tr>
</table>

<p style="margin:0 0 28px;font-family:Arial,Helvetica,sans-serif;font-size:15px;color:#a0a0a0;line-height:1.75;">
    The audit did not change their business. It made their business <span style="color:#f5f5f5;font-weight:600;">provable</span>.
</p>

{{-- CTA --}}
<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:28px;">
    <tr>
        <td style="border-radius:6px;background:linear-gradient(135deg,#3c53a8 0%,#5ca336 100%);">
            <a href="{{ url('/checkout') }}"
               style="display:inline-block;padding:14px 32px;font-family:Arial,Helvetica,sans-serif;font-size:14px;font-weight:700;color:#ffffff;text-decoration:none;letter-spacing:0.03em;">
                Start Your Audit →
            </a>
        </td>
    </tr>
</table>

<p style="margin:0 0 28px;font-family:Arial,Helvetica,sans-serif;font-size:15px;color:#a0a0a0;line-height:1.75;">
    This is the last email in this sequence. If you are ready, the link above is your next step. If you are not ready yet, we will be here when you are.
</p>

{{-- Sign-off --}}
<p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:14px;color:#6b6b6b;line-height:1.6;">
    Talk soon,<br>
    <span style="color:#f5f5f5;font-weight:600;">The Pinpoint Team</span>
</p>

</x-email-layout>
