<x-email-layout
    :recipient-email="$session->email"
    subject="Your PARAGON Roadmap — 3 Steps to Investment Readiness"
    badge="PARAGON Roadmap"
    preheader="Your score indicates you're in the Foundational Phase. Here is your roadmap.">

{{-- Greeting --}}
<p style="margin:0 0 6px;font-family:Arial,Helvetica,sans-serif;font-size:14px;color:#6b6b6b;line-height:1.5;">
    Hi there,
</p>

{{-- Headline --}}
<h1 style="margin:0 0 20px;font-family:Arial,Helvetica,sans-serif;font-size:26px;font-weight:700;color:#f5f5f5;line-height:1.25;letter-spacing:-0.4px;">
    Your PARAGON roadmap is ready.
</h1>

<p style="margin:0 0 28px;font-family:Arial,Helvetica,sans-serif;font-size:15px;color:#a0a0a0;line-height:1.75;">
    Your preliminary PARAGON score of <span style="color:#f5f5f5;font-weight:600;">{{ $session->score }}/100</span> places you in the Foundational Phase. This is not a setback — it is the most critical time to get your structural house in order before any investor conversation.
</p>

{{-- Checklist box --}}
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"
    style="background-color:#161616;border-radius:8px;border:1px solid #1e1e1e;margin-bottom:28px;">
    <tr>
        <td style="padding:24px 28px;">
            <p style="margin:0 0 18px;font-family:Arial,Helvetica,sans-serif;font-size:10px;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;color:#5ca336;">
                Founder Readiness Checklist
            </p>
            <p style="margin:0 0 16px;font-family:Arial,Helvetica,sans-serif;font-size:13px;color:#6b6b6b;">Your action plan before your next diagnostic:</p>
            @php
            $items = [
                'Ensure your MVP is in the hands of at least 5–10 real users',
                'Assign all IP, trademarks, and domain names to the company',
                'Clean your cap table — founders should own >80%',
                'Document your CAC and LTV, even if estimates',
                'Build a 12–18 month financial forecast',
                'Secure at least one LOI, pilot contract, or $1k MRR',
            ];
            @endphp
            @foreach($items as $item)
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"
                style="{{ $loop->last ? '' : 'margin-bottom:12px;' }}">
            <tr>
                <td width="28" valign="top" style="padding-top:1px;">
                    <span style="display:inline-block;width:18px;height:18px;background-color:#5ca336;border-radius:3px;text-align:center;line-height:18px;font-family:Arial,Helvetica,sans-serif;font-size:11px;font-weight:700;color:#ffffff;">✓</span>
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

<p style="margin:0 0 28px;font-family:Arial,Helvetica,sans-serif;font-size:15px;color:#a0a0a0;line-height:1.75;">
    Focus on your <span style="color:#f5f5f5;font-weight:600;">{{ $session->primaryGap() }}</span> pillar first — that is where your score took the biggest hit. Fixing structural issues now costs $100. Fixing them during due diligence costs $10,000.
</p>

<p style="margin:0 0 28px;font-family:Arial,Helvetica,sans-serif;font-size:15px;color:#a0a0a0;line-height:1.75;">
    We have set a reminder to reach back out in <span style="color:#f5f5f5;font-weight:600;">{{ $session->daysRemainingOnCooldown() }} days</span>. When you return, you will know exactly what to fix.
</p>

{{-- Sign-off --}}
<p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:14px;color:#6b6b6b;line-height:1.6;">
    Talk soon,<br>
    <span style="color:#f5f5f5;font-weight:600;">The Pinpoint Team</span>
</p>

</x-email-layout>
