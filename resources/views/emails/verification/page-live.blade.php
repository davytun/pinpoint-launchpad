<x-email-layout subject="Your Investor Page is Now Live — Pinpoint Launchpad" :recipient-email="$recipientEmail">

  <p style="margin:0 0 20px 0;font-size:15px;color:#1E293B;font-family:Arial,Helvetica,sans-serif;">
    Congratulations, <strong>{{ $founder->full_name }}</strong>.
  </p>

  <p style="margin:0 0 20px 0;font-size:14px;color:#475569;line-height:1.7;font-family:Arial,Helvetica,sans-serif;">
    Your PARAGON audit is complete and your investor verification page is now live.
  </p>

  {{-- Emerald highlight box --}}
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 24px 0;">
    <tr>
      <td style="background-color:#F0FDF4;border:1px solid #BBF7D0;border-radius:6px;padding:16px 20px;">
        <p style="margin:0 0 6px 0;font-size:11px;font-weight:bold;letter-spacing:0.1em;color:#15803D;font-family:Arial,Helvetica,sans-serif;text-transform:uppercase;">
          YOUR PAGE IS LIVE
        </p>
        <p style="margin:0 0 6px 0;font-size:13px;font-family:Arial,Helvetica,sans-serif;">
          <a href="{{ $verificationUrl }}" style="color:#2563EB;word-break:break-all;">{{ $verificationUrl }}</a>
        </p>
        <p style="margin:0;font-size:12px;color:#64748B;font-family:Arial,Helvetica,sans-serif;">
          Valid for 90 days from today.
        </p>
      </td>
    </tr>
  </table>

  <p style="margin:0 0 20px 0;font-size:14px;color:#475569;line-height:1.7;font-family:Arial,Helvetica,sans-serif;">
    Share this link with investors, add it to your pitch deck, and include it in your fundraising emails.
  </p>

  {{-- CTA Button --}}
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 24px 0;">
    <tr>
      <td align="center">
        <a href="{{ $verificationUrl }}"
           style="display:inline-block;background-color:#2563EB;color:#ffffff;font-size:14px;font-weight:bold;text-decoration:none;padding:12px 28px;border-radius:6px;font-family:Arial,Helvetica,sans-serif;">
          View My Investor Page
        </a>
      </td>
    </tr>
  </table>

  <p style="margin:0 0 8px 0;font-size:13px;color:#475569;font-family:Arial,Helvetica,sans-serif;font-weight:bold;">
    What's on your page:
  </p>
  <p style="margin:0 0 4px 0;font-size:13px;color:#475569;font-family:Arial,Helvetica,sans-serif;">
    &bull; Your verified PARAGON score
  </p>
  <p style="margin:0 0 4px 0;font-size:13px;color:#475569;font-family:Arial,Helvetica,sans-serif;">
    &bull; Analyst executive summary
  </p>
  <p style="margin:0 0 4px 0;font-size:13px;color:#475569;font-family:Arial,Helvetica,sans-serif;">
    &bull; Verified badges for audited areas
  </p>
  <p style="margin:0 0 20px 0;font-size:13px;color:#475569;font-family:Arial,Helvetica,sans-serif;">
    &bull; Gated data room for serious investors
  </p>

  <p style="margin:0;font-size:13px;color:#94A3B8;font-family:Arial,Helvetica,sans-serif;">
    &mdash; The Pinpoint Team
  </p>

</x-email-layout>
