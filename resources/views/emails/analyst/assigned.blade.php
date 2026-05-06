<x-email-layout :subject="'New Founder Assigned — ' . $companyName" :recipient-email="$analystEmail">

  <h1 style="color: #111827; font-size: 24px; font-weight: 800; margin-bottom: 12px; letter-spacing: -0.025em;">New Founder Assigned</h1>
  
  <p style="margin-bottom: 24px;">Hi {{ $analystName }},</p>
  
  <p style="margin-bottom: 32px;">
    You have been assigned as the lead analyst for a new venture audit. Please review the details below to begin the PARAGON certification process.
  </p>

  {{-- Founder details table --}}
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #F9FAFB; border-radius: 8px; border: 1px solid #F3F4F6; margin-bottom: 32px;">
    <tr>
      <td style="padding: 24px;">
        <p style="margin: 0 0 16px 0; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; color: #3C53A8;">Founder Details</p>
        
        <table width="100%" border="0" cellspacing="0" cellpadding="0">
          <tr>
            <td style="padding: 8px 0; font-size: 14px; color: #6B7280;">Founder</td>
            <td style="padding: 8px 0; font-size: 14px; color: #111827; font-weight: 700; text-align: right;">{{ $founderName }}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; font-size: 14px; color: #6B7280;">Company</td>
            <td style="padding: 8px 0; font-size: 14px; color: #111827; font-weight: 700; text-align: right;">{{ $companyName }}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; font-size: 14px; color: #6B7280;">Audit Tier</td>
            <td style="padding: 8px 0; font-size: 14px; color: #111827; font-weight: 700; text-align: right;">{{ $tier }}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; font-size: 14px; color: #6B7280;">Current Score</td>
            <td style="padding: 8px 0; font-size: 14px; color: #111827; font-weight: 700; text-align: right;">{{ $score }}/100</td>
          </tr>
        </table>
      </td>
    </tr>
  </table>

  <div style="text-align: center; margin-bottom: 32px; margin-top: 32px;">
    <a href="{{ $profileUrl }}" class="cta-button">
      View Founder Profile
    </a>
  </div>

  <p style="margin-bottom: 0;">
    &mdash; The Pinpoint Team
  </p>

</x-email-layout>
