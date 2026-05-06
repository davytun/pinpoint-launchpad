<x-email-layout :subject="'Payment Confirmed — Your PARAGON Audit Has Been Secured'" :recipient-email="$email">

  <h1 style="color: #111827; font-size: 24px; font-weight: 800; margin-bottom: 12px; letter-spacing: -0.025em;">Payment Confirmed ✓</h1>
  
  <p style="margin-bottom: 24px;">Hi there,</p>
  
  <p style="margin-bottom: 32px;">
    Your payment of <strong>${{ number_format($total_amount, 2) }}</strong> has been received. Your place in the PARAGON Certification programme is now secured and your audit is being queued.
  </p>

  {{-- Receipt table --}}
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #F9FAFB; border-radius: 8px; border: 1px solid #F3F4F6; margin-bottom: 32px;">
    <tr>
      <td style="padding: 24px;">
        <p style="margin: 0 0 16px 0; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; color: #3C53A8;">Payment Summary</p>
        
        <table width="100%" border="0" cellspacing="0" cellpadding="0">
          <tr>
            <td style="padding: 8px 0; font-size: 14px; color: #6B7280;">Tier</td>
            <td style="padding: 8px 0; font-size: 14px; color: #111827; font-weight: 700; text-align: right;">{{ $tier_label }} Audit</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; font-size: 14px; color: #6B7280;">Total Charged</td>
            <td style="padding: 8px 0; font-size: 14px; color: #111827; font-weight: 700; text-align: right;">${{ number_format($total_amount, 2) }} USD</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; font-size: 14px; color: #6B7280;">Date</td>
            <td style="padding: 8px 0; font-size: 14px; color: #111827; text-align: right;">
              @if($paid_at instanceof \Illuminate\Support\Carbon || $paid_at instanceof \Carbon\Carbon)
                {{ $paid_at->format('d M Y') }}
              @elseif($paid_at)
                {{ date('d M Y', strtotime($paid_at)) }}
              @else
                {{ date('d M Y') }}
              @endif
            </td>
          </tr>
          <tr>
            <td style="padding: 8px 0; font-size: 14px; color: #6B7280;">Status</td>
            <td style="padding: 8px 0; font-size: 14px; color: #059669; font-weight: 700; text-align: right;">VERIFIED ✓</td>
          </tr>
        </table>
      </td>
    </tr>
  </table>

  <p style="font-weight: 700; color: #111827; margin-bottom: 12px; text-transform: uppercase; font-size: 13px; letter-spacing: 0.05em;">Your Next Step:</p>
  <p style="margin-bottom: 24px;">
    To begin your analyst-led audit, please sign the Success Fee and Confidentiality Agreement. This protects your trade secrets and authorises our team to verify your financials.
  </p>

  <div style="text-align: center; margin-bottom: 32px; margin-top: 32px;">
    <a href="{{ url('/onboarding/sign') }}" class="cta-button">
      Sign Your Agreement
    </a>
  </div>

  <p style="font-size: 13px; color: #9CA3AF; border-top: 1px solid #E2E8F0; padding-top: 24px; margin-bottom: 0;">
    <strong>Refund Policy:</strong> A full refund is available if your audit has not yet commenced. Once analyst work begins, the fee is non-refundable.
  </p>

</x-email-layout>
