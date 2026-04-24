<x-email-layout
    :recipient-email="$session->email"
    subject="Your PARAGON Diagnostic Results"
    badge="PARAGON Score"
    preheader="Your score is {{ $session->score }}/100. Here is what it means and what happens next.">

@php
$bandColors = [
    'low'      => '#DC2626',
    'mid_low'  => '#D97706',
    'mid_high' => '#3c53a8',
    'high'     => '#5ca336',
];
$bandLabels = [
    'low'      => 'Build Phase',
    'mid_low'  => 'Early Stage',
    'mid_high' => 'Investment Ready',
    'high'     => 'High Velocity',
];
$bandMessages = [
    'low'      => 'You are in the Build phase. Your focus now is product-market validation and structural clean-up before any investor conversation.',
    'mid_low'  => 'You have a foundation, but key gaps could trigger red flags in due diligence. Address them before approaching institutional capital.',
    'mid_high' => 'You are an Investment Ready Candidate. Your fundamentals are solid. A PARAGON Certification closes the final verification gap.',
    'high'     => 'You are a High Velocity Candidate. Your profile is exceptional. A PARAGON Certification makes that verifiable to any investor.',
];
$color   = $bandColors[$session->score_band] ?? '#3c53a8';
$label   = $bandLabels[$session->score_band]  ?? 'Unknown';
$message = $bandMessages[$session->score_band] ?? '';
$isReady = in_array($session->score_band, ['mid_high', 'high']);
@endphp

{{-- Greeting --}}
<p style="margin:0 0 6px;font-family:Arial,Helvetica,sans-serif;font-size:14px;color:#6b6b6b;line-height:1.5;">
    Diagnostic complete,
</p>

{{-- Headline --}}
<h1 style="margin:0 0 20px;font-family:Arial,Helvetica,sans-serif;font-size:26px;font-weight:700;color:#f5f5f5;line-height:1.25;letter-spacing:-0.4px;">
    Your PARAGON results are in.
</h1>

{{-- Score block --}}
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"
    style="background-color:#161616;border-radius:8px;border:1px solid #1e1e1e;margin-bottom:28px;">
    <tr>
        <td style="padding:28px;text-align:center;">
            <p style="margin:0 0 4px;font-family:Arial,Helvetica,sans-serif;font-size:10px;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;color:#4b4b4b;">
                PARAGON Score
            </p>
            <p style="margin:0 0 12px;font-family:Arial,Helvetica,sans-serif;font-size:56px;font-weight:700;color:{{ $color }};line-height:1;letter-spacing:-1px;">
                {{ $session->score }}<span style="font-size:22px;color:#4b4b4b;font-weight:400;">/100</span>
            </p>
            <span style="display:inline-block;background-color:{{ $color }};color:#ffffff;font-family:Arial,Helvetica,sans-serif;font-size:10px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;padding:4px 14px;border-radius:20px;">
                {{ $label }}
            </span>
        </td>
    </tr>
</table>

{{-- Band message --}}
<p style="margin:0 0 28px;font-family:Arial,Helvetica,sans-serif;font-size:15px;color:#a0a0a0;line-height:1.75;">
    {{ $message }}
</p>

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
                    <td style="font-family:Arial,Helvetica,sans-serif;font-size:12px;color:#6b6b6b;width:90px;text-transform:capitalize;">
                        {{ ucfirst($pillar) }}
                    </td>
                    <td style="padding:0 12px;">
                        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"
                            style="background-color:#1e1e1e;border-radius:3px;height:5px;">
                            <tr>
                                <td style="width:{{ $score }}%;background-color:{{ $color }};border-radius:3px;height:5px;"></td>
                                <td style="width:{{ 100 - $score }}%;"></td>
                            </tr>
                        </table>
                    </td>
                    <td style="font-family:Arial,Helvetica,sans-serif;font-size:12px;font-weight:700;color:#c8c8c8;width:36px;text-align:right;">
                        {{ $score }}%
                    </td>
                </tr>
            </table>
            @endforeach
        </td>
    </tr>
</table>

{{-- CTA --}}
@if($isReady)
<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:20px;">
    <tr>
        <td style="border-radius:6px;background:linear-gradient(135deg,#3c53a8 0%,#5ca336 100%);">
            <a href="{{ url('/checkout') }}"
               style="display:inline-block;padding:14px 32px;font-family:Arial,Helvetica,sans-serif;font-size:14px;font-weight:700;color:#ffffff;text-decoration:none;letter-spacing:0.03em;">
                Proceed to Application →
            </a>
        </td>
    </tr>
</table>
@else
<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:20px;">
    <tr>
        <td style="border-radius:6px;background-color:#1e1e1e;border:1px solid #2a2a2a;">
            <a href="#"
               style="display:inline-block;padding:14px 32px;font-family:Arial,Helvetica,sans-serif;font-size:14px;font-weight:700;color:#6b6b6b;text-decoration:none;letter-spacing:0.03em;">
                Download Your Readiness Checklist
            </a>
        </td>
    </tr>
</table>
@endif

<p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:13px;color:#4b4b4b;line-height:1.6;font-style:italic;">
    You will receive a follow-up email shortly with your personalised roadmap.
</p>

</x-email-layout>
