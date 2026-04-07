<x-email-layout :recipient-email="$session->email" subject="Moving your venture to the Fast-Track">

<p style="margin:0 0 4px 0;font-size:18px;font-weight:bold;color:#1E293B;font-family:Arial,Helvetica,sans-serif;">Moving your venture to the Fast-Track.</p>
<p style="margin:0 0 24px 0;font-size:14px;color:#64748B;font-family:Arial,Helvetica,sans-serif;">A personal note from our Lead Analyst.</p>

<p style="margin:0 0 14px 0;font-size:14px;color:#475569;line-height:1.7;font-family:Arial,Helvetica,sans-serif;">Hi there,</p>

<p style="margin:0 0 14px 0;font-size:14px;color:#475569;line-height:1.7;font-family:Arial,Helvetica,sans-serif;">I just reviewed your PARAGON diagnostic. A score of <strong style="color:#1E293B;">{{ $session->score }}/100</strong> is rare at this stage — specifically your performance across <strong style="color:#1E293B;">{{ $session->topTwoPillars() }}</strong>.</p>

<p style="margin:0 0 20px 0;font-size:14px;color:#475569;line-height:1.7;font-family:Arial,Helvetica,sans-serif;">I have flagged your venture for our High-Priority Fast-Track.</p>

<table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:20px;background-color:#F0FAE8;border-left:3px solid #6EBE44;border-radius:0 6px 6px 0;">
  <tr>
    <td style="padding:18px 20px;">
      <p style="margin:0 0 10px 0;font-size:12px;font-weight:bold;color:#6EBE44;text-transform:uppercase;letter-spacing:0.8px;font-family:Arial,Helvetica,sans-serif;">What this means for you</p>
      <p style="margin:0;font-size:13px;color:#1E293B;line-height:2;font-family:Arial,Helvetica,sans-serif;">
        &rarr;&nbsp; You bypass the standard $150 intake queue<br>
        &rarr;&nbsp; You speak directly with our Lead Analyst this week<br>
        &rarr;&nbsp; Your venture gets first-look placement in the Spring 2026 PIN Network cohort
      </p>
    </td>
  </tr>
</table>

<p style="margin:0 0 20px 0;font-size:14px;color:#475569;line-height:1.7;font-family:Arial,Helvetica,sans-serif;">I would like to get 15 minutes with you before the end of this week to discuss your placement.</p>

<table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:24px;">
  <tr>
    <td><a href="{{ config('mail.booking_link') }}" style="display:inline-block;background-color:#6EBE44;color:#ffffff;padding:12px 24px;border-radius:6px;font-weight:bold;font-size:14px;text-decoration:none;font-family:Arial,Helvetica,sans-serif;">Book Your Fast-Track Sync</a></td>
  </tr>
</table>

<p style="margin:0 0 4px 0;font-size:14px;color:#475569;font-family:Arial,Helvetica,sans-serif;">Looking forward to it.</p>
<p style="margin:0;font-size:14px;color:#475569;font-family:Arial,Helvetica,sans-serif;">{{ config('mail.analyst_name') }}<br>Pinpoint Launchpad</p>

</x-email-layout>
