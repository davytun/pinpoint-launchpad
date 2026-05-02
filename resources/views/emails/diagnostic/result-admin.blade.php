<x-email-layout
    :recipient-email="config('mail.admin_address')"
    subject="New Diagnostic Completed"
    badge="Admin">

@php
$bandColors = [
    'low'      => '#DC2626',
    'mid_low'  => '#D97706',
    'mid_high' => '#3c53a8',
    'high'     => '#5ca336',
];
$color = $bandColors[$session->score_band] ?? '#3c53a8';
@endphp

{{-- Headline --}}
<h1 style="margin:0 0 8px;font-family:Arial,Helvetica,sans-serif;font-size:22px;font-weight:700;color:#f5f5f5;line-height:1.3;">
    New Diagnostic Completed
</h1>
<p style="margin:0 0 28px;font-family:Arial,Helvetica,sans-serif;font-size:14px;color:#6b6b6b;line-height:1.5;">
    A founder just completed the PARAGON diagnostic.
</p>

{{-- Details table --}}
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"
    style="background-color:#161616;border-radius:8px;border:1px solid #1e1e1e;margin-bottom:28px;">
    <tr>
        <td style="padding:24px 28px;">
            <p style="margin:0 0 18px;font-family:Arial,Helvetica,sans-serif;font-size:10px;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;color:#3c53a8;">
                Candidate Summary
            </p>
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                    <td style="padding:6px 0;font-family:Arial,Helvetica,sans-serif;font-size:13px;color:#6b6b6b;width:110px;border-bottom:1px solid #1e1e1e;">Email</td>
                    <td style="padding:6px 0;font-family:Arial,Helvetica,sans-serif;font-size:13px;color:#c8c8c8;font-weight:600;border-bottom:1px solid #1e1e1e;">{{ $session->email }}</td>
                </tr>
                <tr>
                    <td style="padding:6px 0;font-family:Arial,Helvetica,sans-serif;font-size:13px;color:#6b6b6b;border-bottom:1px solid #1e1e1e;">Score</td>
                    <td style="padding:6px 0;font-family:Arial,Helvetica,sans-serif;font-size:13px;font-weight:700;color:{{ $color }};border-bottom:1px solid #1e1e1e;">{{ $session->score }}/100</td>
                </tr>
                <tr>
                    <td style="padding:6px 0;font-family:Arial,Helvetica,sans-serif;font-size:13px;color:#6b6b6b;border-bottom:1px solid #1e1e1e;">Band</td>
                    <td style="padding:6px 0;font-family:Arial,Helvetica,sans-serif;font-size:13px;color:#c8c8c8;border-bottom:1px solid #1e1e1e;">{{ $session->getScoreBandLabel() }}</td>
                </tr>
                <tr>
                    <td style="padding:6px 0;font-family:Arial,Helvetica,sans-serif;font-size:13px;color:#6b6b6b;">Completed</td>
                    <td style="padding:6px 0;font-family:Arial,Helvetica,sans-serif;font-size:13px;color:#c8c8c8;">{{ $session->completed_at?->format('D d M Y, H:i') }} UTC</td>
                </tr>
            </table>
        </td>
    </tr>
</table>

{{-- Pillar breakdown --}}
<p style="margin:0 0 14px;font-family:Arial,Helvetica,sans-serif;font-size:10px;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;color:#4b4b4b;">
    Pillar Breakdown
</p>

<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"
    style="background-color:#161616;border-radius:8px;border:1px solid #1e1e1e;margin-bottom:28px;">
    <tr>
        <td style="padding:20px 24px;">
            @foreach($session->pillar_scores as $pillar => $score)
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"
                style="{{ $loop->first ? '' : 'margin-top:12px;' }}">
                <tr>
                    <td style="font-family:Arial,Helvetica,sans-serif;font-size:12px;color:#6b6b6b;width:90px;text-transform:capitalize;">{{ ucfirst($pillar) }}</td>
                    <td style="padding:0 12px;">
                        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"
                            style="background-color:#1e1e1e;border-radius:3px;height:5px;">
                            <tr>
                                <td style="width:{{ $score }}%;background-color:{{ $color }};border-radius:3px;height:5px;"></td>
                                <td style="width:{{ 100 - $score }}%;"></td>
                            </tr>
                        </table>
                    </td>
                    <td style="font-family:Arial,Helvetica,sans-serif;font-size:12px;font-weight:700;color:#c8c8c8;width:36px;text-align:right;">{{ $score }}%</td>
                </tr>
            </table>
            @endforeach
        </td>
    </tr>
</table>

{{-- CTA --}}
<table role="presentation" cellpadding="0" cellspacing="0" border="0">
    <tr>
        <td style="border-radius:6px;background-color:#3c53a8;">
            <a href="{{ url('/admin/diagnostic') }}"
               style="display:inline-block;padding:14px 32px;font-family:Arial,Helvetica,sans-serif;font-size:14px;font-weight:700;color:#ffffff;text-decoration:none;letter-spacing:0.03em;">
                View All Diagnostics
            </a>
        </td>
    </tr>
</table>

</x-email-layout>
