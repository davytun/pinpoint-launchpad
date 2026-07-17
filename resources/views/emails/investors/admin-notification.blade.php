<x-email-layout :subject="'New PIN Membership Application'" :recipient-email="'Admin'">

  <h1 style="color: #111827; font-size: 24px; font-weight: 800; margin-bottom: 12px; letter-spacing: -0.025em;">New PIN Membership Application</h1>

  <p style="margin-bottom: 24px; font-size: 15px; color: #4B5563; line-height: 1.6;">
    An investor has submitted an application to join the Pinpoint Investment Network. Review their details and verify status on the admin panel.
  </p>

  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #F9FAFB; border-radius: 8px; border: 1px solid #F3F4F6; margin-bottom: 32px;">
    <tr>
      <td style="padding: 24px;">
        <p style="margin: 0 0 16px 0; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; color: #2F4587;">Applicant Details</p>

        <table width="100%" border="0" cellspacing="0" cellpadding="0">
          <tr>
            <td style="padding: 8px 0; font-size: 14px; color: #6B7280;">Name</td>
            <td style="padding: 8px 0; font-size: 14px; color: #111827; font-weight: 700; text-align: right;">{{ $application->name }}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; font-size: 14px; color: #6B7280;">Email</td>
            <td style="padding: 8px 0; font-size: 14px; color: #111827; font-weight: 700; text-align: right;">{{ $application->email }}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; font-size: 14px; color: #6B7280;">Investor Type</td>
            <td style="padding: 8px 0; font-size: 14px; color: #111827; font-weight: 700; text-align: right; text-transform: capitalize;">{{ str_replace('_', ' ', $application->investor_type) }}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; font-size: 14px; color: #6B7280;">Organisation</td>
            <td style="padding: 8px 0; font-size: 14px; color: #111827; font-weight: 700; text-align: right;">{{ $application->organisation ?: 'N/A' }}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; font-size: 14px; color: #6B7280;">Role</td>
            <td style="padding: 8px 0; font-size: 14px; color: #111827; font-weight: 700; text-align: right;">{{ $application->role ?: 'N/A' }}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; font-size: 14px; color: #6B7280;">Country</td>
            <td style="padding: 8px 0; font-size: 14px; color: #111827; font-weight: 700; text-align: right;">{{ $application->country }}</td>
          </tr>
          @if($application->website)
          <tr>
            <td style="padding: 8px 0; font-size: 14px; color: #6B7280;">Website / LinkedIn</td>
            <td style="padding: 8px 0; font-size: 14px; color: #111827; font-weight: 700; text-align: right;">{{ $application->website }}</td>
          </tr>
          @endif
        </table>
      </td>
    </tr>
  </table>

  <div style="background-color: #F9FAFB; border-radius: 8px; border-left: 4px solid #2F4587; padding: 24px; margin-bottom: 32px;">
    <p style="margin: 0 0 12px 0; font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: #111827;">Action Required:</p>
    <p style="margin: 0; font-size: 14px; color: #4B5563; line-height: 1.6;">
      Review and verify the investor status of <strong>{{ $application->name }}</strong> on the Pinpoint Command dashboard. Once verified, you can approve, reject, or request more information.
    </p>
  </div>

  <div style="text-align: center; margin-bottom: 32px; margin-top: 32px;">
    <a href="{{ route('admin.investors.show', $application->id) }}" class="cta-button">
      View Application Details
    </a>
  </div>

  <p style="margin-bottom: 0;">
    &mdash; Pinpoint System
  </p>

</x-email-layout>
