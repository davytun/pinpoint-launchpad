<x-email-layout :subject="'Your Pinpoint profile is now live'" :recipient-email="$recipientEmail">

  <h1 style="color: #111827; font-size: 24px; font-weight: 800; margin-bottom: 12px; letter-spacing: -0.025em;">Your Pinpoint profile is live</h1>

  <p style="margin-bottom: 24px;">Congratulations, {{ $founder->full_name }}.</p>

  <p style="margin-bottom: 32px;">
    Your PARAGON audit is complete and your Pinpoint profile is now live. You can prepare Spotlight content for Pinpoint review when you are ready.
  </p>

  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #F0FDF4; border-radius: 12px; border: 1px solid #BBF7D0; margin-bottom: 32px;">
    <tr>
      <td style="padding: 24px;">
        <p style="margin: 0 0 12px 0; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; color: #15803D;">Your profile verification link</p>
        <p style="margin: 0 0 12px 0; font-size: 14px;">
          <a href="{{ $verificationUrl }}" style="color: #2563EB; word-break: break-all; font-weight: 600;">{{ $verificationUrl }}</a>
        </p>
        <p style="margin: 0; font-size: 12px; color: #15803D; font-style: italic;">
          Valid for 90 days. Next scheduled review: {{ now()->addDays(90)->format('d M Y') }}.
        </p>
      </td>
    </tr>
  </table>

  <p style="margin-bottom: 24px;">
    You may share this link in your pitch deck or on your LinkedIn profile. It communicates that your venture has completed the PARAGON process.
  </p>

  <div style="text-align: center; margin-bottom: 32px; margin-top: 32px;">
    <a href="{{ $verificationUrl }}" class="cta-button" style="background-color: #059669;">
      View your Pinpoint profile
    </a>
  </div>

  <div style="background-color: #F9FAFB; border-radius: 8px; border: 1px solid #D1D5DB; padding: 24px; margin-bottom: 32px;">
    <p style="margin: 0 0 12px 0; font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: #111827;">Your profile includes:</p>
    <ul style="margin: 0; padding: 0; list-style-type: none; font-size: 14px; color: #4B5563;">
      <li style="margin-bottom: 8px; padding-left: 20px; position: relative;">
        <span style="position: absolute; left: 0; color: #2F4587;">&bull;</span>
        Your verified PARAGON score
      </li>
      <li style="margin-bottom: 8px; padding-left: 20px; position: relative;">
        <span style="position: absolute; left: 0; color: #2F4587;">&bull;</span>
        Analyst executive summary
      </li>
      <li style="margin-bottom: 8px; padding-left: 20px; position: relative;">
        <span style="position: absolute; left: 0; color: #2F4587;">&bull;</span>
        Verified badges for audited pillars
      </li>
      <li style="margin-bottom: 0; padding-left: 20px; position: relative;">
        <span style="position: absolute; left: 0; color: #2F4587;">&bull;</span>
        A path to Spotlight review for qualified investors
      </li>
    </ul>
  </div>

  <p style="margin-bottom: 0;">
    The Pinpoint Team
  </p>

</x-email-layout>
