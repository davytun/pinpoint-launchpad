<x-email-layout
    :recipient-email="$entry->email"
    subject="You're on the list — Pinpoint Launchpad"
    badge="Founder Access"
    preheader="You're on the list. Here's your Founder Readiness Checklist — the signals that separate investable from interesting.">

{{-- Greeting --}}
<p style="margin:0 0 6px;font-family:Arial,Helvetica,sans-serif;font-size:14px;color:#6b6b6b;line-height:1.5;">
    Hi {{ $entry->name }},
</p>

{{-- Headline --}}
<h1 style="margin:0 0 20px;font-family:Arial,Helvetica,sans-serif;font-size:26px;font-weight:700;color:#f5f5f5;line-height:1.25;letter-spacing:-0.4px;">
    You're officially on the waitlist.
</h1>

{{-- Body copy --}}
<p style="margin:0 0 28px;font-family:Arial,Helvetica,sans-serif;font-size:15px;color:#a0a0a0;line-height:1.75;">
    While we calibrate the <span style="color:#f5f5f5;font-weight:600;">PARAGON engine</span>
    and prepare your diagnostic slot, here's your head start — the
    <span style="color:#f5f5f5;font-weight:600;">Founder Readiness Checklist</span>.
    These are the signals that separate investable from interesting.
</p>

{{-- Checklist box --}}
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"
    style="background-color:#161616;border-radius:8px;border:1px solid #1e1e1e;margin-bottom:28px;">
<tr>
    <td style="padding:24px 28px;">

        <p style="margin:0 0 18px;font-family:Arial,Helvetica,sans-serif;font-size:10px;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;color:#5ca336;">
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

{{-- Closing line --}}
<p style="margin:0 0 28px;font-family:Arial,Helvetica,sans-serif;font-size:15px;color:#a0a0a0;line-height:1.75;">
    We'll notify you the moment your diagnostic slot opens. Until then, use this checklist
    to close any gaps — the founders who move fast get seen first.
</p>

{{-- Sign-off --}}
<p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:14px;color:#6b6b6b;line-height:1.6;">
    Talk soon,<br>
    <span style="color:#f5f5f5;font-weight:600;">The Pinpoint Team</span>
</p>

</x-email-layout>
