<x-email-layout :recipient-email="$session->email" subject="Your PARAGON Diagnostic Results">

@php
  $bandColors = [
    'low'      => '#DC2626',
    'mid_low'  => '#D97706',
    'mid_high' => '#3A54A5',
    'high'     => '#6EBE44',
  ];
  $bandLabels = [
    'low'      => 'Build Phase',
    'mid_low'  => 'Early Stage',
    'mid_high' => 'Investment Ready',
    'high'     => 'High Velocity',
  ];
  $bandMessages = [
    'low'      => 'You are in the Build phase. Focus on your MVP.',
    'mid_low'  => 'You have a foundation, but you are hitting Red Flag territory.',
    'mid_high' => 'Investment Ready Candidate. You have the fundamentals.',
    'high'     => 'High Velocity Candidate. Your profile is exceptional.',
  ];
  $color = $bandColors[$session->score_band] ?? '#3A54A5';
  $label = $bandLabels[$session->score_band] ?? 'Unknown';
  $message = $bandMessages[$session->score_band] ?? '';
@endphp

<p style="margin:0 0 4px 0;font-size:18px;font-weight:bold;color:#1E293B;font-family:Arial,Helvetica,sans-serif;">Your PARAGON Results</p>
<p style="margin:0 0 24px 0;font-size:14px;color:#64748B;font-family:Arial,Helvetica,sans-serif;">Here is how your venture scored across the 7 PARAGON pillars.</p>

{{-- Score block --}}
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:24px;background-color:#F8FAFC;border-radius:6px;border:1px solid #E2E8F0;">
  <tr>
    <td style="padding:20px 24px;" align="center">
      <p style="margin:0 0 2px 0;font-size:12px;color:#64748B;text-transform:uppercase;letter-spacing:1px;font-family:Arial,Helvetica,sans-serif;">PARAGON Score</p>
      <p style="margin:0 0 10px 0;font-size:52px;font-weight:bold;color:{{ $color }};font-family:Arial,Helvetica,sans-serif;line-height:1;">{{ $session->score }}<span style="font-size:20px;color:#94A3B8;">/100</span></p>
      <span style="display:inline-block;background-color:{{ $color }};color:#ffffff;font-size:11px;font-weight:bold;padding:3px 12px;border-radius:20px;font-family:Arial,Helvetica,sans-serif;">{{ $label }}</span>
    </td>
  </tr>
</table>

<p style="margin:0 0 20px 0;font-size:14px;color:#475569;line-height:1.7;font-family:Arial,Helvetica,sans-serif;">{{ $message }}</p>

{{-- Pillar breakdown --}}
<p style="margin:0 0 10px 0;font-size:12px;font-weight:bold;color:#94A3B8;text-transform:uppercase;letter-spacing:0.8px;font-family:Arial,Helvetica,sans-serif;">Pillar Breakdown</p>

@foreach($session->pillar_scores as $pillar => $score)
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:8px;">
  <tr>
    <td style="font-size:13px;color:#475569;font-family:Arial,Helvetica,sans-serif;width:100px;">{{ ucfirst($pillar) }}</td>
    <td style="padding:0 10px;">
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#F1F5F9;border-radius:3px;height:6px;">
        <tr>
          <td style="width:{{ $score }}%;background-color:{{ $color }};border-radius:3px;height:6px;"></td>
          <td style="width:{{ 100 - $score }}%;"></td>
        </tr>
      </table>
    </td>
    <td style="font-size:13px;font-weight:bold;color:#1E293B;font-family:Arial,Helvetica,sans-serif;width:36px;text-align:right;">{{ $score }}%</td>
  </tr>
</table>
@endforeach

<table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:28px;">
  <tr>
    <td>
      @if(in_array($session->score_band, ['mid_high', 'high']))
      <a href="/checkout" style="display:inline-block;background-color:#3A54A5;color:#ffffff;padding:12px 24px;border-radius:6px;font-weight:bold;font-size:14px;text-decoration:none;font-family:Arial,Helvetica,sans-serif;">Proceed to Application &rarr; $150</a>
      @else
      <a href="#" style="display:inline-block;background-color:#3A54A5;color:#ffffff;padding:12px 24px;border-radius:6px;font-weight:bold;font-size:14px;text-decoration:none;font-family:Arial,Helvetica,sans-serif;">Download Your Readiness Checklist</a>
      @endif
    </td>
  </tr>
</table>

<p style="margin:20px 0 0 0;font-size:13px;color:#94A3B8;font-style:italic;font-family:Arial,Helvetica,sans-serif;">You will receive a follow-up email shortly with your personalised roadmap.</p>

</x-email-layout>
