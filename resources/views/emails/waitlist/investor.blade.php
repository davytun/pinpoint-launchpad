<x-email-layout
    :recipient-email="$entry->email"
    subject="Welcome to the PIN Network — Pinpoint Launchpad"
    badge="PIN Network"
    preheader="You're in. Priority access to vetted founder deal flow — no noise, no intermediaries.">

{{-- Greeting --}}
<p style="margin:0 0 6px;font-family:Arial,Helvetica,sans-serif;font-size:14px;color:#6b6b6b;line-height:1.5;">
    Hi {{ $entry->name }},
</p>

{{-- Headline --}}
<h1 style="margin:0 0 20px;font-family:Arial,Helvetica,sans-serif;font-size:26px;font-weight:700;color:#f5f5f5;line-height:1.25;letter-spacing:-0.4px;">
    You're in. Welcome to the PIN&nbsp;Network.
</h1>

{{-- Body copy --}}
<p style="margin:0 0 28px;font-family:Arial,Helvetica,sans-serif;font-size:15px;color:#a0a0a0;line-height:1.75;">
    Pinpoint is building the infrastructure layer between serious investors and pre-market founders.
    We're deliberate about who joins early — so deal flow quality stays high and the
    signal-to-noise ratio stays low.
</p>

{{-- Benefits box --}}
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"
    style="background-color:#161616;border-radius:8px;border:1px solid #1e1e1e;margin-bottom:28px;">
<tr>
    <td style="padding:24px 28px;">

        <p style="margin:0 0 18px;font-family:Arial,Helvetica,sans-serif;font-size:10px;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;color:#3c53a8;">
            As a Priority Access Member
        </p>

        @php
        $benefits = [
            'Early access to vetted founder profiles before public launch',
            'Filter by stage, sector, geography, and funding ask',
            'Direct contact — no intermediaries, no cold outreach noise',
            'A founder matching brief you can set once and update any time',
        ];
        @endphp

        @foreach($benefits as $benefit)
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"
            style="{{ $loop->last ? '' : 'margin-bottom:12px;' }}">
        <tr>
            <td width="28" valign="top" style="padding-top:1px;">
                <span style="display:inline-block;width:18px;height:18px;background-color:#3c53a8;border-radius:3px;text-align:center;line-height:18px;font-family:Arial,Helvetica,sans-serif;font-size:12px;font-weight:700;color:#ffffff;">&bull;</span>
            </td>
            <td style="font-family:Arial,Helvetica,sans-serif;font-size:14px;color:#c8c8c8;line-height:1.55;">
                {{ $benefit }}
            </td>
        </tr>
        </table>
        @endforeach

    </td>
</tr>
</table>

{{-- Cohort note --}}
<p style="margin:0 0 16px;font-family:Arial,Helvetica,sans-serif;font-size:15px;color:#a0a0a0;line-height:1.75;">
    We know your time is spent filtering noise. Pinpoint is built to bring you signal.
    We will reach out shortly for a <span style="color:#f5f5f5;font-weight:600;">15-minute briefing</span>
    to ensure our audit criteria align with your firm's specific mandate.
</p>

<p style="margin:0 0 28px;font-family:Arial,Helvetica,sans-serif;font-size:15px;color:#a0a0a0;line-height:1.75;">
    If anything changes on your end — fund stage, thesis, check size — just reply to
    this email and we'll update your profile.
</p>

{{-- Sign-off --}}
<p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:14px;color:#6b6b6b;line-height:1.6;">
    Good to have you here,<br>
    <span style="color:#f5f5f5;font-weight:600;">The Pinpoint Team</span>
</p>

</x-email-layout>
