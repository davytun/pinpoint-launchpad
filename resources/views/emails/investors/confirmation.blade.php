<x-email-layout :subject="'PIN Application Received'" :recipient-email="$application->email">

  <h1 style="color: #111827; font-size: 24px; font-weight: 800; margin-bottom: 12px; letter-spacing: -0.025em;">Application Received</h1>
  
  <p style="margin-bottom: 24px; font-size: 15px; color: #4B5563; line-height: 1.6;">
    Hi {{ $application->name }},
  </p>

  <p style="margin-bottom: 24px; font-size: 15px; color: #4B5563; line-height: 1.6;">
    Thank you for applying to join the <strong>Pinpoint Investment Network (the PIN)</strong>. We have received your details and mandate preferences.
  </p>

  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #F9FAFB; border-radius: 8px; border: 1px solid #F3F4F6; margin-bottom: 32px;">
    <tr>
      <td style="padding: 24px;">
        <p style="margin: 0 0 16px 0; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; color: #2F4587;">Submitted Details</p>
        
        <table width="100%" border="0" cellspacing="0" cellpadding="0">
          <tr>
            <td style="padding: 8px 0; font-size: 14px; color: #6B7280;">Investor Type</td>
            <td style="padding: 8px 0; font-size: 14px; color: #111827; font-weight: 700; text-align: right; text-transform: capitalize;">{{ str_replace('_', ' ', $application->investor_type) }}</td>
          </tr>
          @if($application->organisation)
          <tr>
            <td style="padding: 8px 0; font-size: 14px; color: #6B7280;">Organisation</td>
            <td style="padding: 8px 0; font-size: 14px; color: #111827; font-weight: 700; text-align: right;">{{ $application->organisation }}</td>
          </tr>
          @endif
          @if($application->role)
          <tr>
            <td style="padding: 8px 0; font-size: 14px; color: #6B7280;">Role</td>
            <td style="padding: 8px 0; font-size: 14px; color: #111827; font-weight: 700; text-align: right;">{{ $application->role }}</td>
          </tr>
          @endif
          <tr>
            <td style="padding: 8px 0; font-size: 14px; color: #6B7280;">Country</td>
            <td style="padding: 8px 0; font-size: 14px; color: #111827; font-weight: 700; text-align: right;">{{ $application->country }}</td>
          </tr>
        </table>
      </td>
    </tr>
  </table>

  <p style="margin-bottom: 24px; font-size: 15px; color: #4B5563; line-height: 1.6;">
    <strong>What happens next?</strong><br>
    We review every application individually and verify investor status before admission to protect the network's integrity. You will hear from us at this email address once our review is complete.
  </p>

  <p style="margin-bottom: 0; font-size: 14px; color: #9CA3AF; font-style: italic;">
    If we require any additional information to verify your status or mandate, our support team will reach out directly.
  </p>

  <p style="margin-top: 32px; font-size: 14px; color: #4B5563;">
    Best regards,<br>
    <strong>The Pinpoint Team</strong>
  </p>

</x-email-layout>
