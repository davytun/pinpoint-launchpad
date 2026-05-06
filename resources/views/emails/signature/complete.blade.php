<x-email-layout :subject="'Agreement Signed — Your PARAGON Audit Begins Now'" :recipient-email="$signer_email">

  <h1 style="color: #111827; font-size: 24px; font-weight: 800; margin-bottom: 12px; letter-spacing: -0.025em;">Agreement Signed ✓</h1>
  
  <p style="margin-bottom: 24px;">Hi there,</p>
  
  <p style="margin-bottom: 32px;">
    Your Pinpoint Investment Warrant has been successfully signed and is now legally binding. Your audit has been queued for analyst assignment.
  </p>

  {{-- Audit details table --}}
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #F9FAFB; border-radius: 8px; border: 1px solid #F3F4F6; margin-bottom: 32px;">
    <tr>
      <td style="padding: 24px;">
        <p style="margin: 0 0 16px 0; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; color: #3C53A8;">Signature Details</p>
        
        <table width="100%" border="0" cellspacing="0" cellpadding="0">
          <tr>
            <td style="padding: 8px 0; font-size: 14px; color: #6B7280;">Audit Tier</td>
            <td style="padding: 8px 0; font-size: 14px; color: #111827; font-weight: 700; text-align: right;">{{ $tier_label }} Audit</td>
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
            <td style="padding: 8px 0; font-size: 14px; color: #6B7280;">Status</td>
            <td style="padding: 8px 0; font-size: 14px; color: #059669; font-weight: 700; text-align: right;">COMPLETED ✓</td>
          </tr>
        </table>
      </td>
    </tr>
  </table>

  <div style="background-color: #F9FAFB; border-radius: 8px; border-left: 4px solid #3C53A8; padding: 24px; margin-bottom: 32px;">
    <p style="margin: 0 0 12px 0; font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: #111827;">What happens next:</p>
    <ul style="margin: 0; padding: 0; list-style-type: none; font-size: 14px; color: #4B5563;">
      <li style="margin-bottom: 8px; padding-left: 20px; position: relative;">
        <span style="position: absolute; left: 0; color: #3C53A8;">&bull;</span>
        Your audit is now in the analyst assignment queue.
      </li>
      <li style="margin-bottom: 8px; padding-left: 20px; position: relative;">
        <span style="position: absolute; left: 0; color: #3C53A8;">&bull;</span>
        You will receive a notification within 2 business days.
      </li>
      <li style="margin-bottom: 0; padding-left: 20px; position: relative;">
        <span style="position: absolute; left: 0; color: #3C53A8;">&bull;</span>
        Your investor verification page will go live upon completion.
      </li>
    </ul>
  </div>

  <div style="text-align: center; margin-bottom: 32px; margin-top: 32px;">
    <a href="{{ url('/dashboard') }}" class="cta-button">
      Access Your Dashboard
    </a>
  </div>

  <p style="margin-bottom: 0;">
    Your signed document has been stored securely. A copy will also be emailed to you by BoldSign for your records.
  </p>

</x-email-layout>
