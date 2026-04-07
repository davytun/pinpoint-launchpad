<x-email-layout :recipient-email="$session->email" preheader="Your score indicates you're in the Foundational Phase. Here's your roadmap." subject="Your PARAGON Roadmap">

<p style="margin:0 0 4px 0;font-size:18px;font-weight:bold;color:#1E293B;font-family:Arial,Helvetica,sans-serif;">Your PARAGON Roadmap</p>
<p style="margin:0 0 24px 0;font-size:14px;color:#64748B;font-family:Arial,Helvetica,sans-serif;">3 Steps to Investment Readiness</p>

<p style="margin:0 0 14px 0;font-size:14px;color:#475569;line-height:1.7;font-family:Arial,Helvetica,sans-serif;">Hi there,</p>

<p style="margin:0 0 14px 0;font-size:14px;color:#475569;line-height:1.7;font-family:Arial,Helvetica,sans-serif;">Your preliminary PARAGON score of <strong style="color:#1E293B;">{{ $session->score }}/100</strong> indicates you are in the Foundational Phase. This is not a setback — it is the most critical time to get your structural house in order before talking to VCs.</p>

<p style="margin:0 0 20px 0;font-size:14px;color:#475569;line-height:1.7;font-family:Arial,Helvetica,sans-serif;">Instead of a pitch deck, you need a blueprint.</p>

{{-- Checklist --}}
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:20px;background-color:#EEF1FB;border-left:3px solid #3A54A5;border-radius:0 6px 6px 0;">
  <tr>
    <td style="padding:18px 20px;">
      <p style="margin:0 0 10px 0;font-size:12px;font-weight:bold;color:#3A54A5;text-transform:uppercase;letter-spacing:0.8px;font-family:Arial,Helvetica,sans-serif;">The Founder Readiness Checklist</p>
      <p style="margin:0 0 8px 0;font-size:13px;color:#475569;font-family:Arial,Helvetica,sans-serif;">Your action plan before your next diagnostic:</p>
      <p style="margin:0;font-size:13px;color:#1E293B;line-height:2;font-family:Arial,Helvetica,sans-serif;">
        &#10003;&nbsp; Ensure your MVP is in the hands of at least 5–10 real users<br>
        &#10003;&nbsp; Assign all IP, trademarks, and domain names to the company<br>
        &#10003;&nbsp; Clean your cap table — founders should own &gt;80%<br>
        &#10003;&nbsp; Document your CAC and LTV, even if estimates<br>
        &#10003;&nbsp; Build a 12–18 month financial forecast<br>
        &#10003;&nbsp; Secure at least one LOI, pilot contract, or $1k MRR
      </p>
    </td>
  </tr>
</table>

<p style="margin:0 0 14px 0;font-size:14px;color:#475569;line-height:1.7;font-family:Arial,Helvetica,sans-serif;">Focus on your <strong style="color:#1E293B;">{{ $session->primaryGap() }}</strong> pillar first — that is where your score took the biggest hit. Fixing structural issues now costs $100. Fixing them during due diligence costs $10,000.</p>

<table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:20px;">
  <tr>
    <td><a href="#" style="display:inline-block;background-color:#3A54A5;color:#ffffff;padding:12px 24px;border-radius:6px;font-weight:bold;font-size:14px;text-decoration:none;font-family:Arial,Helvetica,sans-serif;">Download the Full Checklist</a></td>
  </tr>
</table>

<p style="margin:0 0 14px 0;font-size:14px;color:#475569;line-height:1.7;font-family:Arial,Helvetica,sans-serif;">We have set a reminder to reach back out in <strong style="color:#1E293B;">{{ $session->daysRemainingOnCooldown() }} days</strong>. When you return, you will know exactly what to fix.</p>

<p style="margin:0;font-size:14px;color:#475569;font-family:Arial,Helvetica,sans-serif;">The Pinpoint Team</p>

</x-email-layout>
