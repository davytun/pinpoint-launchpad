<x-email-layout :subject="'Verification Page Created — Admin'" :recipient-email="'Admin'">

  <h1 style="color: #111827; font-size: 24px; font-weight: 800; margin-bottom: 12px; letter-spacing: -0.025em;">Verification Page Created</h1>
  
  <p style="margin-bottom: 24px;">A new verification page has been initialized for <strong>{{ $founder->company_name }}</strong>.</p>

  {{-- Profile details table --}}
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #F9FAFB; border-radius: 8px; border: 1px solid #F3F4F6; margin-bottom: 32px;">
    <tr>
      <td style="padding: 24px;">
        <p style="margin: 0 0 16px 0; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; color: #3C53A8;">Profile Details</p>
        
        <table width="100%" border="0" cellspacing="0" cellpadding="0">
          <tr>
            <td style="padding: 8px 0; font-size: 14px; color: #6B7280;">Founder</td>
            <td style="padding: 8px 0; font-size: 14px; color: #111827; font-weight: 700; text-align: right;">{{ $founder->full_name }}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; font-size: 14px; color: #6B7280;">Company</td>
            <td style="padding: 8px 0; font-size: 14px; color: #111827; font-weight: 700; text-align: right;">{{ $founder->company_name }}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; font-size: 14px; color: #6B7280;">Public URL</td>
            <td style="padding: 8px 0; font-size: 14px; text-align: right;">
              <a href="{{ $verificationUrl }}" style="color: #2563EB; font-weight: 600;">{{ $profile->slug }}</a>
            </td>
          </tr>
          <tr>
            <td style="padding: 8px 0; font-size: 14px; color: #6B7280;">Expires</td>
            <td style="padding: 8px 0; font-size: 14px; color: #111827; font-weight: 700; text-align: right;">{{ $profile->expires_at?->format('d M Y') }}</td>
          </tr>
        </table>
      </td>
    </tr>
  </table>

  <div style="background-color: #FFFBEB; border-radius: 8px; border-left: 4px solid #D97706; padding: 24px; margin-bottom: 32px;">
    <p style="margin: 0 0 12px 0; font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: #92400E;">Action Required:</p>
    <p style="margin: 0; font-size: 14px; color: #92400E; line-height: 1.6;">
      Add the analyst executive summary, update performance metrics, and verify individual badges before finalizing the page.
    </p>
  </div>

  <div style="text-align: center; margin-bottom: 32px; margin-top: 32px;">
    <a href="{{ $adminUrl }}" class="cta-button">
      Manage Profile
    </a>
  </div>

  <p style="margin-bottom: 0;">
    &mdash; Pinpoint System
  </p>

</x-email-layout>
