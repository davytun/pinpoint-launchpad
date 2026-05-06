<x-email-layout :subject="'Investor Interest — ' . ($firmName ?? 'An Investor') . ' Viewed Your Profile'" :recipient-email="$recipientEmail">

  <h1 style="color: #111827; font-size: 24px; font-weight: 800; margin-bottom: 12px; letter-spacing: -0.025em;">Investor Interest Detected</h1>
  
  <p style="margin-bottom: 24px;">Hi {{ $founder->full_name }},</p>
  
  <p style="margin-bottom: 32px;">
    An investor has requested access to your full data room on Pinpoint Launchpad. This is a high-intent signal.
  </p>

  {{-- Investor details box --}}
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #F9FAFB; border-radius: 8px; border: 1px solid #F3F4F6; margin-bottom: 32px;">
    <tr>
      <td style="padding: 24px;">
        <p style="margin: 0 0 16px 0; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; color: #3C53A8;">Investor Details</p>
        
        <table width="100%" border="0" cellspacing="0" cellpadding="0">
          <tr>
            <td style="padding: 8px 0; font-size: 14px; color: #6B7280;">Name</td>
            <td style="padding: 8px 0; font-size: 14px; color: #111827; font-weight: 700; text-align: right;">{{ $investorName }}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; font-size: 14px; color: #6B7280;">Firm</td>
            <td style="padding: 8px 0; font-size: 14px; color: #111827; font-weight: 700; text-align: right;">{{ $firmName ?? 'Independent' }}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; font-size: 14px; color: #6B7280;">Email</td>
            <td style="padding: 8px 0; font-size: 14px; color: #3C53A8; font-weight: 700; text-align: right;">
              <a href="mailto:{{ $investorEmail }}" style="color: #3C53A8; text-decoration: none;">{{ $investorEmail }}</a>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>

  <p style="margin-bottom: 24px;">
    Respond promptly to maintain momentum — high-quality investors move fast. You can reply directly to the investor via the email provided above.
  </p>

  <div style="text-align: center; margin-bottom: 32px; margin-top: 32px;">
    <a href="{{ $verificationUrl }}" class="cta-button">
      View Your Investor Page
    </a>
  </div>

  <p style="margin-bottom: 0;">
    &mdash; The Pinpoint Team
  </p>

</x-email-layout>
