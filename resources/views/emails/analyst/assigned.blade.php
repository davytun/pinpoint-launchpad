<x-email-layout :subject="'New Founder Assigned — ' . $companyName" :recipient-email="$analystEmail">

  <p style="margin:0 0 6px 0;font-size:20px;font-weight:bold;color:#111827;font-family:Arial,Helvetica,sans-serif;">
    New Founder Assigned
  </p>
  <p style="margin:0 0 20px 0;font-size:14px;color:#374151;line-height:1.6;font-family:Arial,Helvetica,sans-serif;">
    Hi {{ $analystName }},
  </p>
  <p style="margin:0 0 20px 0;font-size:14px;color:#374151;line-height:1.6;font-family:Arial,Helvetica,sans-serif;">
    You have been assigned a new founder audit. Please review their details below and reach out if you need anything.
  </p>

  {{-- Founder details box --}}
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#EFF6FF;border:1px solid #BFDBFE;border-left:4px solid #2563EB;border-radius:6px;margin-bottom:24px;">
    <tr>
      <td style="padding:16px 20px;">
        <p style="margin:0 0 8px 0;font-size:13px;color:#1E40AF;font-family:Arial,Helvetica,sans-serif;"><strong>Founder:</strong> {{ $founderName }}</p>
        <p style="margin:0 0 8px 0;font-size:13px;color:#1E40AF;font-family:Arial,Helvetica,sans-serif;"><strong>Company:</strong> {{ $companyName }}</p>
        <p style="margin:0 0 8px 0;font-size:13px;color:#1E40AF;font-family:Arial,Helvetica,sans-serif;"><strong>Tier:</strong> {{ $tier }}</p>
        <p style="margin:0;font-size:13px;color:#1E40AF;font-family:Arial,Helvetica,sans-serif;"><strong>Score:</strong> {{ $score }}/100</p>
      </td>
    </tr>
  </table>

  {{-- CTA button --}}
  <table cellpadding="0" cellspacing="0" border="0" style="margin-bottom:24px;">
    <tr>
      <td style="background-color:#2563EB;border-radius:6px;">
        <a href="{{ $profileUrl }}"
           style="display:inline-block;padding:12px 28px;font-size:14px;font-weight:bold;color:#ffffff;text-decoration:none;font-family:Arial,Helvetica,sans-serif;">
          View Founder Profile
        </a>
      </td>
    </tr>
  </table>

  <p style="margin:0;font-size:13px;color:#6B7280;font-family:Arial,Helvetica,sans-serif;">
    — The Pinpoint Team
  </p>

</x-email-layout>
