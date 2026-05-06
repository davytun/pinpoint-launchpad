<x-email-layout :subject="'New Payment Received'" :recipient-email="'Admin'">

  <h1 style="color: #111827; font-size: 24px; font-weight: 800; margin-bottom: 12px; letter-spacing: -0.025em;">New Payment Received</h1>
  
  <p style="margin-bottom: 24px;">A founder has successfully completed the checkout process for their PARAGON audit.</p>

  {{-- Payment details table --}}
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #F9FAFB; border-radius: 8px; border: 1px solid #F3F4F6; margin-bottom: 32px;">
    <tr>
      <td style="padding: 24px;">
        <p style="margin: 0 0 16px 0; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; color: #3C53A8;">Transaction Details</p>
        
        <table width="100%" border="0" cellspacing="0" cellpadding="0">
          <tr>
            <td style="padding: 8px 0; font-size: 14px; color: #6B7280;">Founder Email</td>
            <td style="padding: 8px 0; font-size: 14px; color: #111827; font-weight: 700; text-align: right;">{{ $email }}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; font-size: 14px; color: #6B7280;">Audit Tier</td>
            <td style="padding: 8px 0; font-size: 14px; color: #111827; font-weight: 700; text-align: right;">{{ $tier_label }}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; font-size: 14px; color: #6B7280;">Amount Paid</td>
            <td style="padding: 8px 0; font-size: 14px; color: #059669; font-weight: 700; text-align: right;">${{ number_format($total_amount, 2) }} USD</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; font-size: 14px; color: #6B7280;">Paid At</td>
            <td style="padding: 8px 0; font-size: 14px; color: #111827; font-weight: 700; text-align: right;">
              @if($paid_at instanceof \Illuminate\Support\Carbon || $paid_at instanceof \Carbon\Carbon)
                {{ $paid_at->format('d M Y, H:i') }} UTC
              @elseif($paid_at)
                @php
                  try { echo \Carbon\Carbon::parse($paid_at)->format('d M Y, H:i') . ' UTC'; }
                  catch (\Exception $e) { echo 'N/A'; }
                @endphp
              @else
                N/A
              @endif
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>

  <div style="background-color: #F9FAFB; border-radius: 8px; border-left: 4px solid #3C53A8; padding: 24px; margin-bottom: 32px;">
    <p style="margin: 0 0 12px 0; font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: #111827;">Action Required:</p>
    <p style="margin: 0; font-size: 14px; color: #4B5563; line-height: 1.6;">
      Assign an analyst to begin the audit. Note: Founders are eligible for a refund until the audit status is updated to <strong>In Progress</strong>.
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
