<x-email-layout :subject="'New PIA Application'" :recipient-email="'Admin'">

  <h1 style="color: #111827; font-size: 24px; font-weight: 800; margin-bottom: 12px; letter-spacing: -0.025em;">New PIA Application</h1>

  <p style="margin-bottom: 24px;">A founder has submitted an application for the Pinpoint Investment Assessment. Review their details and reach out to scope and invoice.</p>

  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #F9FAFB; border-radius: 8px; border: 1px solid #F3F4F6; margin-bottom: 32px;">
    <tr>
      <td style="padding: 24px;">
        <p style="margin: 0 0 16px 0; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; color: #2F4587;">Application Details</p>

        <table width="100%" border="0" cellspacing="0" cellpadding="0">
          <tr>
            <td style="padding: 8px 0; font-size: 14px; color: #6B7280;">Name</td>
            <td style="padding: 8px 0; font-size: 14px; color: #111827; font-weight: 700; text-align: right;">{{ $name }}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; font-size: 14px; color: #6B7280;">Email</td>
            <td style="padding: 8px 0; font-size: 14px; color: #111827; font-weight: 700; text-align: right;">{{ $email }}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; font-size: 14px; color: #6B7280;">Company</td>
            <td style="padding: 8px 0; font-size: 14px; color: #111827; font-weight: 700; text-align: right;">{{ $company }}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; font-size: 14px; color: #6B7280;">Country</td>
            <td style="padding: 8px 0; font-size: 14px; color: #111827; font-weight: 700; text-align: right;">{{ $country }}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; font-size: 14px; color: #6B7280;">Stage</td>
            <td style="padding: 8px 0; font-size: 14px; color: #111827; font-weight: 700; text-align: right; text-transform: capitalize;">{{ $stage }}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; font-size: 14px; color: #6B7280;">Raise Target</td>
            <td style="padding: 8px 0; font-size: 14px; color: #111827; font-weight: 700; text-align: right;">{{ $raise_target }}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; font-size: 14px; color: #6B7280;">Submitted At</td>
            <td style="padding: 8px 0; font-size: 14px; color: #111827; font-weight: 700; text-align: right;">
              @if($submitted_at)
                @php
                  try { echo \Carbon\Carbon::parse($submitted_at)->format('d M Y, H:i') . ' UTC'; }
                  catch (\Exception $e) { echo 'N/A'; }
                @endphp
              @else
                N/A
              @endif
            </td>
          </tr>
        </table>

        @if($founder_message)
        <div style="margin-top: 20px; border-top: 1px solid #E5E7EB; padding-top: 16px;">
          <p style="margin: 0 0 8px 0; font-size: 13px; font-weight: 700; color: #111827;">Message from founder:</p>
          <p style="margin: 0; font-size: 14px; color: #4B5563; line-height: 1.6;">{{ $founder_message }}</p>
        </div>
        @endif
      </td>
    </tr>
  </table>

  <div style="background-color: #F9FAFB; border-radius: 8px; border-left: 4px solid #2F4587; padding: 24px; margin-bottom: 32px;">
    <p style="margin: 0 0 12px 0; font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: #111827;">Action Required:</p>
    <p style="margin: 0; font-size: 14px; color: #4B5563; line-height: 1.6;">
      Contact <strong>{{ $name }}</strong> at <strong>{{ $email }}</strong> within 48 hours to discuss scoping, confirm the applicable tier, and send the invoice.
    </p>
  </div>

  <div style="text-align: center; margin-bottom: 32px; margin-top: 32px;">
    <a href="{{ url('/admin') }}" class="cta-button">
      Go to Admin Dashboard
    </a>
  </div>

  <p style="margin-bottom: 0;">
    &mdash; Pinpoint System
  </p>

</x-email-layout>
