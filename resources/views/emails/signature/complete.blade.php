<x-email-layout
  :subject="'Agreement Signed — Your PARAGON Audit Begins Now'"
  :recipient-email="$signer_email">

  <p style="margin:0 0 6px 0;font-size:22px;font-weight:bold;color:#111827;font-family:Arial,Helvetica,sans-serif;">
    Agreement Signed ✓
  </p>
  <p style="margin:0 0 20px 0;font-size:14px;color:#374151;line-height:1.6;font-family:Arial,Helvetica,sans-serif;">
    Hi there,
  </p>
  <p style="margin:0 0 24px 0;font-size:14px;color:#374151;line-height:1.6;font-family:Arial,Helvetica,sans-serif;">
    Your Pinpoint Investment Warrant has been successfully signed and is legally binding.
  </p>

  {{-- Confirmation box --}}
  <table width="100%" cellpadding="0" cellspacing="0" border="0"
    style="background-color:#ECFDF5;border:1px solid #6EE7B7;border-radius:6px;margin-bottom:24px;">
    <tr>
      <td style="padding:20px 24px;">
        <p style="margin:0 0 14px 0;font-size:11px;font-weight:bold;letter-spacing:0.1em;text-transform:uppercase;color:#065F46;font-family:Arial,Helvetica,sans-serif;">
          What Happens Next:
        </p>
        <table cellpadding="0" cellspacing="0" border="0">
          <tr>
            <td style="padding:4px 0;font-size:13px;color:#065F46;font-family:Arial,Helvetica,sans-serif;">
              → Your audit has been queued for analyst assignment
            </td>
          </tr>
          <tr>
            <td style="padding:4px 0;font-size:13px;color:#065F46;font-family:Arial,Helvetica,sans-serif;">
              → You will receive a follow-up within 2 business days
            </td>
          </tr>
          <tr>
            <td style="padding:4px 0;font-size:13px;color:#065F46;font-family:Arial,Helvetica,sans-serif;">
              → Your investor verification page will go live upon audit completion
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>

  {{-- Tier badge --}}
  <table width="100%" cellpadding="0" cellspacing="0" border="0"
    style="background-color:#F9FAFB;border:1px solid #E5E7EB;border-radius:6px;margin-bottom:24px;">
    <tr>
      <td style="padding:16px 24px;">
        <table width="100%" cellpadding="0" cellspacing="0" border="0">
          <tr>
            <td style="font-size:13px;color:#374151;font-family:Arial,Helvetica,sans-serif;">Tier</td>
            <td style="font-size:13px;font-weight:bold;color:#111827;text-align:right;font-family:Arial,Helvetica,sans-serif;">{{ $tier_label }} Audit</td>
          </tr>
          <tr>
            <td style="padding-top:8px;font-size:13px;color:#374151;font-family:Arial,Helvetica,sans-serif;">Signed At</td>
            <td style="padding-top:8px;font-size:13px;color:#111827;text-align:right;font-family:Arial,Helvetica,sans-serif;">
              @if($signed_at instanceof \Illuminate\Support\Carbon || $signed_at instanceof \Carbon\Carbon)
                {{ $signed_at->format('d M Y, H:i') }} UTC
              @else
                {{ $signed_at }}
              @endif
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>

  {{-- CTA --}}
  <table cellpadding="0" cellspacing="0" border="0" style="margin-bottom:24px;">
    <tr>
      <td style="background-color:#2563EB;border-radius:6px;">
        <a href="{{ url('/dashboard') }}"
           style="display:inline-block;padding:12px 28px;font-size:14px;font-weight:bold;color:#ffffff;text-decoration:none;font-family:Arial,Helvetica,sans-serif;">
          Access Your Dashboard
        </a>
      </td>
    </tr>
  </table>

  <p style="margin:0 0 20px 0;font-size:13px;color:#374151;line-height:1.6;font-family:Arial,Helvetica,sans-serif;">
    Your signed document has been stored securely and a copy will be emailed to you by BoldSign.
  </p>

  <p style="margin:0;font-size:13px;color:#374151;font-family:Arial,Helvetica,sans-serif;">
    — The Pinpoint Team
  </p>

</x-email-layout>
