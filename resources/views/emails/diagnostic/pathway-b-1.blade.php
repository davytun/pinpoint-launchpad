<x-email-layout
    :recipient-email="$session->email"
    subject="You're in the top 20% — but one gap could cost you the deal"
    badge="PARAGON Score"
    preheader="You're in the top 20%. But the Unknown No is lurking.">

{{-- Greeting --}}
<p style="margin:0 0 6px;font-family:Arial,Helvetica,sans-serif;font-size:14px;color:#6b6b6b;line-height:1.5;">
    Hi there,
</p>

{{-- Headline --}}
<h1 style="margin:0 0 20px;font-family:Arial,Helvetica,sans-serif;font-size:26px;font-weight:700;color:#f5f5f5;line-height:1.25;letter-spacing:-0.4px;">
    You're in the top 20%.<br>But the "Unknown No" is lurking.
</h1>

<p style="margin:0 0 28px;font-family:Arial,Helvetica,sans-serif;font-size:15px;color:#a0a0a0;line-height:1.75;">
    Your PARAGON score of <span style="color:#f5f5f5;font-weight:600;">{{ $session->score }}/100</span> puts you in the top 20% of founders who have taken this diagnostic. That is genuinely impressive. But here is the hard truth:
</p>

{{-- Warning box --}}
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"
    style="background-color:#161616;border-radius:8px;border:1px solid #1e1e1e;border-left:3px solid #D97706;margin-bottom:28px;">
    <tr>
        <td style="padding:24px 28px;">
            <p style="margin:0 0 10px;font-family:Arial,Helvetica,sans-serif;font-size:10px;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;color:#D97706;">
                The Unknown No
            </p>
            <p style="margin:0 0 12px;font-family:Arial,Helvetica,sans-serif;font-size:14px;color:#c8c8c8;line-height:1.65;">
                Founders with scores between 65 and 85 are the most likely to stall at the term-sheet stage — not because their business is weak, but because they cannot prove it is not.
            </p>
            <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:14px;color:#c8c8c8;line-height:1.65;">
                VCs call this the "Unknown No." Your numbers look good. Your story sounds right. But without verified data, they move on to the next deal.
            </p>
        </td>
    </tr>
</table>

<p style="margin:0 0 28px;font-family:Arial,Helvetica,sans-serif;font-size:15px;color:#a0a0a0;line-height:1.75;">
    Your weakest pillar right now is <span style="color:#f5f5f5;font-weight:600;">{{ $session->primaryGap() }}</span>. That single gap is enough to lose a term sheet.
</p>

<p style="margin:0 0 28px;font-family:Arial,Helvetica,sans-serif;font-size:15px;color:#a0a0a0;line-height:1.75;">
    The PARAGON Certification closes that gap — with verified financials, a clean cap table audit, and an analyst-signed Radar Chart that travels with your deck.
</p>

{{-- CTA --}}
<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:28px;">
    <tr>
        <td style="border-radius:6px;background:linear-gradient(135deg,#3c53a8 0%,#5ca336 100%);">
            <a href="{{ url('/checkout') }}"
               style="display:inline-block;padding:14px 32px;font-family:Arial,Helvetica,sans-serif;font-size:14px;font-weight:700;color:#ffffff;text-decoration:none;letter-spacing:0.03em;">
                Unlock Your Professional Audit →
            </a>
        </td>
    </tr>
</table>

<p style="margin:0 0 28px;font-family:Arial,Helvetica,sans-serif;font-size:15px;color:#a0a0a0;line-height:1.75;">
    This is not a course. This is not a PDF. This is a due diligence team stress-testing your business before you step into the pitch room.
</p>

{{-- Sign-off --}}
<p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:14px;color:#6b6b6b;line-height:1.6;">
    Talk soon,<br>
    <span style="color:#f5f5f5;font-weight:600;">The Pinpoint Team</span>
</p>

</x-email-layout>
