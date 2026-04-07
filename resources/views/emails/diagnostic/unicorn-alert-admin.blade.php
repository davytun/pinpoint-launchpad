<x-email-layout :recipient-email="config('mail.admin_address')" subject="UNICORN ALERT — High Velocity Candidate">

<p style="margin:0 0 4px 0;font-size:18px;font-weight:bold;color:#DC2626;font-family:Arial,Helvetica,sans-serif;">&#128680; High Velocity Candidate Detected</p>
<p style="margin:0 0 24px 0;font-size:14px;color:#64748B;font-family:Arial,Helvetica,sans-serif;">Immediate action required within 72 hours.</p>

<p style="margin:0 0 14px 0;font-size:14px;color:#475569;line-height:1.7;font-family:Arial,Helvetica,sans-serif;">A founder just scored <strong style="color:#1E293B;">{{ $session->score }}/100</strong> on the PARAGON Diagnostic. This puts them in the top tier of all applicants.</p>

<table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:24px;border:1px solid #E2E8F0;border-radius:6px;overflow:hidden;">
  <tr style="background-color:#F8FAFC;">
    <td style="padding:10px 14px;font-size:12px;font-weight:bold;color:#94A3B8;text-transform:uppercase;font-family:Arial,Helvetica,sans-serif;width:100px;">Email</td>
    <td style="padding:10px 14px;font-size:14px;color:#1E293B;font-family:Arial,Helvetica,sans-serif;">{{ $session->email }}</td>
  </tr>
  <tr>
    <td style="padding:10px 14px;font-size:12px;font-weight:bold;color:#94A3B8;text-transform:uppercase;font-family:Arial,Helvetica,sans-serif;border-top:1px solid #F1F5F9;">Score</td>
    <td style="padding:10px 14px;font-size:14px;font-weight:bold;color:#6EBE44;font-family:Arial,Helvetica,sans-serif;border-top:1px solid #F1F5F9;">{{ $session->score }}/100</td>
  </tr>
  <tr style="background-color:#F8FAFC;">
    <td style="padding:10px 14px;font-size:12px;font-weight:bold;color:#94A3B8;text-transform:uppercase;font-family:Arial,Helvetica,sans-serif;border-top:1px solid #F1F5F9;">Band</td>
    <td style="padding:10px 14px;font-size:14px;color:#1E293B;font-family:Arial,Helvetica,sans-serif;border-top:1px solid #F1F5F9;">High Velocity</td>
  </tr>
  <tr>
    <td style="padding:10px 14px;font-size:12px;font-weight:bold;color:#94A3B8;text-transform:uppercase;font-family:Arial,Helvetica,sans-serif;border-top:1px solid #F1F5F9;">Completed</td>
    <td style="padding:10px 14px;font-size:14px;color:#1E293B;font-family:Arial,Helvetica,sans-serif;border-top:1px solid #F1F5F9;">{{ $session->completed_at?->format('D d M Y, H:i') }}</td>
  </tr>
</table>

<p style="margin:0 0 10px 0;font-size:12px;font-weight:bold;color:#94A3B8;text-transform:uppercase;letter-spacing:0.8px;font-family:Arial,Helvetica,sans-serif;">Pillar Breakdown</p>

@foreach($session->pillar_scores as $pillar => $score)
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:8px;">
  <tr>
    <td style="font-size:13px;color:#475569;font-family:Arial,Helvetica,sans-serif;width:100px;">{{ ucfirst($pillar) }}</td>
    <td style="padding:0 10px;">
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#F1F5F9;border-radius:3px;height:6px;">
        <tr>
          <td style="width:{{ $score }}%;background-color:#6EBE44;border-radius:3px;height:6px;"></td>
          <td style="width:{{ 100 - $score }}%;"></td>
        </tr>
      </table>
    </td>
    <td style="font-size:13px;font-weight:bold;color:#1E293B;font-family:Arial,Helvetica,sans-serif;width:36px;text-align:right;">{{ $score }}%</td>
  </tr>
</table>
@endforeach

<table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:24px;margin-bottom:20px;background-color:#FEF2F2;border-left:3px solid #DC2626;border-radius:0 6px 6px 0;">
  <tr>
    <td style="padding:16px 20px;">
      <p style="margin:0 0 4px 0;font-size:12px;font-weight:bold;color:#DC2626;text-transform:uppercase;letter-spacing:0.8px;font-family:Arial,Helvetica,sans-serif;">Action Required</p>
      <p style="margin:0;font-size:13px;color:#1E293B;line-height:1.7;font-family:Arial,Helvetica,sans-serif;">Reach out personally within 72 hours. Do not let this founder go through the standard intake.</p>
    </td>
  </tr>
</table>

<table width="100%" cellpadding="0" cellspacing="0" border="0">
  <tr>
    <td><a href="/admin/diagnostic" style="display:inline-block;background-color:#DC2626;color:#ffffff;padding:12px 24px;border-radius:6px;font-weight:bold;font-size:14px;text-decoration:none;font-family:Arial,Helvetica,sans-serif;">View All Diagnostics</a></td>
  </tr>
</table>

</x-email-layout>
