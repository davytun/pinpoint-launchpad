<x-email-layout
    :recipient-email="$session->email"
    subject="Your venture has been flagged for Fast-Track"
    badge="High Velocity"
    preheader="A score of {{ $session->score }}/100 is rare. We have flagged your venture for our High-Priority Fast-Track.">

{{-- Greeting --}}
<p style="margin:0 0 6px;font-family:Arial,Helvetica,sans-serif;font-size:14px;color:#6b6b6b;line-height:1.5;">
    Hi there,
</p>

{{-- Headline --}}
<h1 style="margin:0 0 20px;font-family:Arial,Helvetica,sans-serif;font-size:26px;font-weight:700;color:#f5f5f5;line-height:1.25;letter-spacing:-0.4px;">
    Moving your venture to the Fast-Track.
</h1>

<p style="margin:0 0 28px;font-family:Arial,Helvetica,sans-serif;font-size:15px;color:#a0a0a0;line-height:1.75;">
    A personal note from our Lead Analyst.
</p>

<p style="margin:0 0 28px;font-family:Arial,Helvetica,sans-serif;font-size:15px;color:#a0a0a0;line-height:1.75;">
    I just reviewed your PARAGON diagnostic. A score of <span style="color:#f5f5f5;font-weight:600;">{{ $session->score }}/100</span> is rare at this stage — specifically your performance across <span style="color:#f5f5f5;font-weight:600;">{{ $session->topTwoPillars() }}</span>. I have flagged your venture for our High-Priority Fast-Track.
</p>

{{-- What this means box --}}
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"
    style="background-color:#161616;border-radius:8px;border:1px solid #1e1e1e;border-left:3px solid #5ca336;margin-bottom:28px;">
    <tr>
        <td style="padding:24px 28px;">
            <p style="margin:0 0 18px;font-family:Arial,Helvetica,sans-serif;font-size:10px;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;color:#5ca336;">
                What this means for you
            </p>
            @php
            $items = [
                'You bypass the standard intake queue entirely',
                'You speak directly with our Lead Analyst this week',
                'Your venture gets first-look placement in the Spring 2026 PIN Network cohort',
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
    I would like to get 15 minutes with you before the end of this week to discuss your placement.
</p>

{{-- CTA --}}
<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:28px;">
    <tr>
        <td style="border-radius:6px;background-color:#5ca336;">
            <a href="{{ config('mail.booking_link') }}"
               style="display:inline-block;padding:14px 32px;font-family:Arial,Helvetica,sans-serif;font-size:14px;font-weight:700;color:#ffffff;text-decoration:none;letter-spacing:0.03em;">
                Book Your Fast-Track Sync →
            </a>
        </td>
    </tr>
</table>

{{-- Sign-off --}}
<p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:14px;color:#6b6b6b;line-height:1.6;">
    Looking forward to it,<br>
    <span style="color:#f5f5f5;font-weight:600;">{{ config('mail.analyst_name') }}</span><br>
    <span style="color:#4b4b4b;">Lead Analyst, Pinpoint Launchpad</span>
</p>

</x-email-layout>
