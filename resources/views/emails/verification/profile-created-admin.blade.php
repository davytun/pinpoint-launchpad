<x-email-layout subject="Verification Page Created — Admin" :recipient-email="$recipientEmail">

  <p style="margin:0 0 20px 0;font-size:15px;color:#1E293B;font-weight:bold;font-family:Arial,Helvetica,sans-serif;">
    New Verification Page Created
  </p>

  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 24px 0;">
    <tr>
      <td style="background-color:#F8FAFC;border:1px solid #E2E8F0;border-radius:6px;padding:16px 20px;">
        <p style="margin:0 0 8px 0;font-size:13px;color:#475569;font-family:Arial,Helvetica,sans-serif;">
          <strong>Founder:</strong> {{ $founder->full_name }}
        </p>
        <p style="margin:0 0 8px 0;font-size:13px;color:#475569;font-family:Arial,Helvetica,sans-serif;">
          <strong>Company:</strong> {{ $founder->company_name }}
        </p>
        <p style="margin:0 0 8px 0;font-size:13px;color:#475569;font-family:Arial,Helvetica,sans-serif;">
          <strong>Profile URL:</strong>
          <a href="{{ $verificationUrl }}" style="color:#2563EB;">{{ $verificationUrl }}</a>
        </p>
        <p style="margin:0;font-size:13px;color:#475569;font-family:Arial,Helvetica,sans-serif;">
          <strong>Expires:</strong> {{ $profile->expires_at?->format('d M Y') }}
        </p>
      </td>
    </tr>
  </table>

  <p style="margin:0 0 20px 0;font-size:14px;color:#475569;line-height:1.7;font-family:Arial,Helvetica,sans-serif;">
    Action required: Add the analyst summary and verify badges from the admin panel.
  </p>

  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 24px 0;">
    <tr>
      <td align="center">
        <a href="{{ $adminUrl }}"
           style="display:inline-block;background-color:#2563EB;color:#ffffff;font-size:14px;font-weight:bold;text-decoration:none;padding:12px 28px;border-radius:6px;font-family:Arial,Helvetica,sans-serif;">
          Manage Profile &rarr;
        </a>
      </td>
    </tr>
  </table>

</x-email-layout>
