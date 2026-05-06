<x-email-layout :subject="'PIW Signed — New Founder Ready for Analyst Assignment'" :recipient-email="'Admin'">

  <h1 style="color: #111827; font-size: 24px; font-weight: 800; margin-bottom: 12px; letter-spacing: -0.025em;">New Founder Signed</h1>
  
  <p style="margin-bottom: 24px;">A founder has signed their Pinpoint Investment Warrant and is ready for analyst assignment.</p>

  {{-- Founder details table --}}
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #F9FAFB; border-radius: 8px; border: 1px solid #F3F4F6; margin-bottom: 32px;">
    <tr>
      <td style="padding: 24px;">
        <p style="margin: 0 0 16px 0; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; color: #3C53A8;">Founder Details</p>
        
        <table width="100%" border="0" cellspacing="0" cellpadding="0">
          <tr>
            <td style="padding: 8px 0; font-size: 14px; color: #6B7280;">Email</td>
            <td style="padding: 8px 0; font-size: 14px; color: #111827; font-weight: 700; text-align: right;">{{ $signer_email }}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; font-size: 14px; color: #6B7280;">Audit Tier</td>
            <td style="padding: 8px 0; font-size: 14px; color: #111827; font-weight: 700; text-align: right;">{{ $tier_label }}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; font-size: 14px; color: #6B7280;">Signed At</td>
            <td style="padding: 8px 0; font-size: 14px; color: #111827; font-weight: 700; text-align: right;">
              @if($signed_at instanceof \Illuminate\Support\Carbon || $signed_at instanceof \Carbon\Carbon)
                {{ $signed_at->format('d M Y, H:i') }} UTC
              @else
                {{ $signed_at }}
              @endif
            </td>
          </tr>
          <tr>
            <td style="padding: 8px 0; font-size: 14px; color: #6B7280;">Document ID</td>
            <td style="padding: 8px 0; font-size: 12px; color: #6B7280; font-weight: 400; text-align: right; font-family: monospace;">{{ $document_id }}</td>
          </tr>
        </table>
      </td>
    </tr>
  </table>

  <div style="background-color: #FFFBEB; border-radius: 8px; border-left: 4px solid #D97706; padding: 24px; margin-bottom: 32px;">
    <p style="margin: 0 0 12px 0; font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: #92400E;">Next Steps:</p>
    <ul style="margin: 0; padding: 0; list-style-type: none; font-size: 14px; color: #92400E;">
      <li style="margin-bottom: 8px; padding-left: 20px; position: relative;">
        <span style="position: absolute; left: 0;">&bull;</span>
        Assign an analyst to begin the audit.
      </li>
      <li style="margin-bottom: 0; padding-left: 20px; position: relative;">
        <span style="position: absolute; left: 0;">&bull;</span>
        Update the founder status to 'In Progress'.
      </li>
    </ul>
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
