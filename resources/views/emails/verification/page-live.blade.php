<x-email-layout :subject="'Your Investor Page is Now Live — Pinpoint Launchpad'" :recipient-email="$recipientEmail">

  <h1 style="color: #111827; font-size: 24px; font-weight: 800; margin-bottom: 12px; letter-spacing: -0.025em;">Your Investor Page is Live!</h1>
  
  <p style="margin-bottom: 24px;">Congratulations, {{ $founder->full_name }}.</p>
  
  <p style="margin-bottom: 32px;">
    Your PARAGON audit is complete and your investor verification page is now live. This is a significant milestone in your fundraising journey.
  </p>

  {{-- Emerald highlight box --}}
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #F0FDF4; border-radius: 12px; border: 1px solid #BBF7D0; margin-bottom: 32px;">
    <tr>
      <td style="padding: 24px;">
        <p style="margin: 0 0 12px 0; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; color: #15803D;">Your Public Verification Link</p>
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
    Share this link with investors, include it in your pitch deck, and add it to your LinkedIn profile. It provides immediate institutional validation of your venture's fundamentals.
  </p>

  <div style="text-align: center; margin-bottom: 32px; margin-top: 32px;">
    <a href="{{ $verificationUrl }}" class="cta-button" style="background-color: #059669;">
      View Your Investor Page
    </a>
  </div>

  <div style="background-color: #F9FAFB; border-radius: 8px; border-left: 4px solid #3C53A8; padding: 24px; margin-bottom: 32px;">
    <p style="margin: 0 0 12px 0; font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: #111827;">What's on your page:</p>
    <ul style="margin: 0; padding: 0; list-style-type: none; font-size: 14px; color: #4B5563;">
      <li style="margin-bottom: 8px; padding-left: 20px; position: relative;">
        <span style="position: absolute; left: 0; color: #3C53A8;">&bull;</span>
        Your verified PARAGON score
      </li>
      <li style="margin-bottom: 8px; padding-left: 20px; position: relative;">
        <span style="position: absolute; left: 0; color: #3C53A8;">&bull;</span>
        Analyst executive summary
      </li>
      <li style="margin-bottom: 8px; padding-left: 20px; position: relative;">
        <span style="position: absolute; left: 0; color: #3C53A8;">&bull;</span>
        Verified badges for audited pillars
      </li>
      <li style="margin-bottom: 0; padding-left: 20px; position: relative;">
        <span style="position: absolute; left: 0; color: #3C53A8;">&bull;</span>
        Gated data room for serious investors
      </li>
    </ul>
  </div>

  <p style="margin-bottom: 0;">
    &mdash; The Pinpoint Team
  </p>

</x-email-layout>
