<x-email-layout subject="Investor Interest — Pinpoint Launchpad" :recipient-email="$recipientEmail">

  <p style="margin:0 0 20px 0;font-size:15px;color:#1E293B;font-family:Arial,Helvetica,sans-serif;">
    Hi <strong>{{ $founder->full_name }}</strong>,
  </p>

  <p style="margin:0 0 20px 0;font-size:14px;color:#475569;line-height:1.7;font-family:Arial,Helvetica,sans-serif;">
    An investor has requested access to your full data room on Pinpoint Launchpad.
  </p>

  {{-- Investor details box --}}
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 24px 0;">
    <tr>
      <td style="background-color:#EFF6FF;border:1px solid #BFDBFE;border-radius:6px;padding:16px 20px;">
        <p style="margin:0 0 6px 0;font-size:11px;font-weight:bold;letter-spacing:0.1em;color:#1D4ED8;font-family:Arial,Helvetica,sans-serif;text-transform:uppercase;">
          INVESTOR DETAILS
        </p>
        <p style="margin:0 0 4px 0;font-size:13px;color:#1E293B;font-family:Arial,Helvetica,sans-serif;">
          <strong>Name:</strong> {{ $investorName }}
        </p>
        <p style="margin:0 0 4px 0;font-size:13px;color:#1E293B;font-family:Arial,Helvetica,sans-serif;">
          <strong>Firm:</strong> {{ $firmName ?? 'Independent' }}
        </p>
        <p style="margin:0;font-size:13px;color:#1E293B;font-family:Arial,Helvetica,sans-serif;">
          <strong>Email:</strong>
          <a href="mailto:{{ $investorEmail }}" style="color:#2563EB;">{{ $investorEmail }}</a>
        </p>
      </td>
    </tr>
  </table>

  <p style="margin:0 0 20px 0;font-size:14px;color:#475569;line-height:1.7;font-family:Arial,Helvetica,sans-serif;">
    This is a warm signal. Respond promptly — investors move fast.
  </p>

  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 24px 0;">
    <tr>
      <td align="center">
        <a href="{{ $verificationUrl }}"
           style="display:inline-block;background-color:#2563EB;color:#ffffff;font-size:14px;font-weight:bold;text-decoration:none;padding:12px 28px;border-radius:6px;font-family:Arial,Helvetica,sans-serif;">
          View Your Investor Page
        </a>
      </td>
    </tr>
  </table>

  <p style="margin:0 0 20px 0;font-size:13px;color:#475569;font-family:Arial,Helvetica,sans-serif;">
    You can reply directly to this investor at
    <a href="mailto:{{ $investorEmail }}" style="color:#2563EB;">{{ $investorEmail }}</a>.
  </p>

  <p style="margin:0;font-size:13px;color:#94A3B8;font-family:Arial,Helvetica,sans-serif;">
    &mdash; The Pinpoint Team
  </p>

</x-email-layout>
