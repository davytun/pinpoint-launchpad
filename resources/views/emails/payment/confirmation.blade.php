<x-email-layout :subject="'Payment Confirmed — Your PARAGON Audit Has Been Secured'" :recipient-email="$email">

  {{-- Heading --}}
  <p style="margin:0 0 6px 0;font-size:22px;font-weight:bold;color:#111827;font-family:Arial,Helvetica,sans-serif;">
    Payment Confirmed ✓
  </p>
  <p style="margin:0 0 20px 0;font-size:14px;color:#374151;line-height:1.6;font-family:Arial,Helvetica,sans-serif;">
    Hi there,
  </p>
  <p style="margin:0 0 24px 0;font-size:14px;color:#374151;line-height:1.6;font-family:Arial,Helvetica,sans-serif;">
    Your payment of <strong>${{ number_format($total_amount) }}</strong> has been received and your place in the PARAGON Certification programme has been secured.
  </p>

  {{-- Receipt box --}}
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#EFF6FF;border:1px solid #BFDBFE;border-radius:6px;margin-bottom:24px;">
    <tr>
      <td style="padding:20px 24px;">
        <p style="margin:0 0 14px 0;font-size:11px;font-weight:bold;letter-spacing:0.1em;text-transform:uppercase;color:#1D4ED8;font-family:Arial,Helvetica,sans-serif;">
          Payment Summary
        </p>
        <table width="100%" cellpadding="0" cellspacing="0" border="0">
          <tr>
            <td style="padding:4px 0;font-size:13px;color:#374151;font-family:Arial,Helvetica,sans-serif;">Tier</td>
            <td style="padding:4px 0;font-size:13px;color:#111827;font-weight:bold;text-align:right;font-family:Arial,Helvetica,sans-serif;">{{ $tier_label }} Audit</td>
          </tr>
          <tr>
            <td style="padding:4px 0;font-size:13px;color:#374151;font-family:Arial,Helvetica,sans-serif;">Audit Fee</td>
            <td style="padding:4px 0;font-size:13px;color:#111827;text-align:right;font-family:Arial,Helvetica,sans-serif;">${{ number_format($base_price) }}</td>
          </tr>
          <tr>
            <td style="padding:4px 0;font-size:13px;color:#374151;font-family:Arial,Helvetica,sans-serif;">Application Fee</td>
            <td style="padding:4px 0;font-size:13px;color:#111827;text-align:right;font-family:Arial,Helvetica,sans-serif;">${{ number_format($gate_fee) }} (included)</td>
          </tr>
          <tr>
            <td style="padding:4px 0;font-size:13px;font-weight:bold;color:#374151;font-family:Arial,Helvetica,sans-serif;">Total Charged</td>
            <td style="padding:4px 0;font-size:13px;font-weight:bold;color:#111827;text-align:right;font-family:Arial,Helvetica,sans-serif;">${{ number_format($total_amount) }}</td>
          </tr>
          <tr>
            <td style="padding:4px 0;font-size:13px;color:#374151;font-family:Arial,Helvetica,sans-serif;">Currency</td>
            <td style="padding:4px 0;font-size:13px;color:#111827;text-align:right;font-family:Arial,Helvetica,sans-serif;">USD</td>
          </tr>
          <tr>
            <td style="padding:4px 0;font-size:13px;color:#374151;font-family:Arial,Helvetica,sans-serif;">Date</td>
            <td style="padding:4px 0;font-size:13px;color:#111827;text-align:right;font-family:Arial,Helvetica,sans-serif;">{{ $paid_at ? $paid_at->format('d M Y, H:i') : now()->format('d M Y, H:i') }}</td>
          </tr>
          <tr>
            <td style="padding:4px 0;font-size:13px;color:#374151;font-family:Arial,Helvetica,sans-serif;">Status</td>
            <td style="padding:4px 0;font-size:13px;color:#16A34A;font-weight:bold;text-align:right;font-family:Arial,Helvetica,sans-serif;">CONFIRMED ✓</td>
          </tr>
        </table>
      </td>
    </tr>
  </table>

  {{-- Next step --}}
  <p style="margin:0 0 8px 0;font-size:13px;font-weight:bold;text-transform:uppercase;letter-spacing:0.08em;color:#111827;font-family:Arial,Helvetica,sans-serif;">
    Your Next Step:
  </p>
  <p style="margin:0 0 8px 0;font-size:14px;color:#374151;line-height:1.6;font-family:Arial,Helvetica,sans-serif;">
    To begin your analyst-led audit, please sign the Success Fee and Confidentiality Agreement. This document:
  </p>
  <table cellpadding="0" cellspacing="0" border="0" style="margin:0 0 20px 0;">
    <tr><td style="padding:3px 0;font-size:14px;color:#374151;font-family:Arial,Helvetica,sans-serif;">→ Protects your trade secrets during the audit</td></tr>
    <tr><td style="padding:3px 0;font-size:14px;color:#374151;font-family:Arial,Helvetica,sans-serif;">→ Confirms your place in the PIN Network</td></tr>
    <tr><td style="padding:3px 0;font-size:14px;color:#374151;font-family:Arial,Helvetica,sans-serif;">→ Authorises our team to verify your financials</td></tr>
  </table>

  {{-- CTA button --}}
  <table cellpadding="0" cellspacing="0" border="0" style="margin-bottom:24px;">
    <tr>
      <td style="background-color:#2563EB;border-radius:6px;">
        <a href="{{ url('/onboarding/sign') }}"
           style="display:inline-block;padding:12px 28px;font-size:14px;font-weight:bold;color:#ffffff;text-decoration:none;font-family:Arial,Helvetica,sans-serif;">
          Sign Your Agreement Now
        </a>
      </td>
    </tr>
  </table>

  {{-- Refund policy --}}
  <p style="margin:0;font-size:12px;color:#6B7280;line-height:1.6;font-family:Arial,Helvetica,sans-serif;border-top:1px solid #E5E7EB;padding-top:16px;">
    <strong>Refund Policy:</strong> A full refund is available if your audit has not yet commenced. Once analyst work begins, no refund is applicable.
  </p>

  <p style="margin:20px 0 0 0;font-size:13px;color:#374151;font-family:Arial,Helvetica,sans-serif;">
    — The Pinpoint Team
  </p>

</x-email-layout>
