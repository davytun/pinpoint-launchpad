<x-email-layout :subject="'New Payment Received'" :recipient-email="config('mail.admin_address', 'admin@pinpointlaunchpad.com')">

  <p style="margin:0 0 6px 0;font-size:20px;font-weight:bold;color:#111827;font-family:Arial,Helvetica,sans-serif;">
    New Payment Received
  </p>
  <p style="margin:0 0 20px 0;font-size:13px;color:#6B7280;font-family:Arial,Helvetica,sans-serif;">
    A founder has completed checkout. Details below.
  </p>

  {{-- Details table --}}
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#F9FAFB;border:1px solid #E5E7EB;border-radius:6px;margin-bottom:24px;">
    <tr>
      <td style="padding:20px 24px;">
        <table width="100%" cellpadding="0" cellspacing="0" border="0">
          <tr>
            <td style="padding:5px 0;font-size:13px;color:#6B7280;width:40%;font-family:Arial,Helvetica,sans-serif;">Email</td>
            <td style="padding:5px 0;font-size:13px;color:#111827;font-weight:bold;font-family:Arial,Helvetica,sans-serif;">{{ $email }}</td>
          </tr>
          <tr>
            <td style="padding:5px 0;font-size:13px;color:#6B7280;font-family:Arial,Helvetica,sans-serif;">Tier</td>
            <td style="padding:5px 0;font-size:13px;color:#111827;font-weight:bold;font-family:Arial,Helvetica,sans-serif;">{{ $tier_label }}</td>
          </tr>
          <tr>
            <td style="padding:5px 0;font-size:13px;color:#6B7280;font-family:Arial,Helvetica,sans-serif;">Amount</td>
            <td style="padding:5px 0;font-size:13px;color:#111827;font-weight:bold;font-family:Arial,Helvetica,sans-serif;">${{ number_format($total_amount, 2) }} USD</td>
          </tr>
          <tr>
            <td style="padding:5px 0;font-size:13px;color:#6B7280;font-family:Arial,Helvetica,sans-serif;">Date</td>
            <td style="padding:5px 0;font-size:13px;color:#111827;font-family:Arial,Helvetica,sans-serif;">
              @if($paid_at instanceof \Illuminate\Support\Carbon || $paid_at instanceof \Carbon\Carbon)
                {{ $paid_at->format('d M Y, H:i') }}
              @elseif($paid_at)
                {{ \Carbon\Carbon::parse($paid_at)->format('d M Y, H:i') }}
              @else
                {{ now()->format('d M Y, H:i') }}
              @endif
            </td>
          </tr>
          <tr>
            <td style="padding:5px 0;font-size:13px;color:#6B7280;font-family:Arial,Helvetica,sans-serif;">Audit Status</td>
            <td style="padding:5px 0;font-size:13px;color:#D97706;font-weight:bold;font-family:Arial,Helvetica,sans-serif;">Pending (not yet started)</td>
          </tr>
        </table>
      </td>
    </tr>
  </table>

  {{-- Next action --}}
  <p style="margin:0 0 16px 0;font-size:14px;color:#374151;line-height:1.6;font-family:Arial,Helvetica,sans-serif;">
    <strong>Next action:</strong> Assign an analyst and begin the audit process. Once work begins, update the audit status to <em>In Progress</em> to remove refund eligibility.
  </p>

  {{-- CTA button --}}
  <table cellpadding="0" cellspacing="0" border="0">
    <tr>
      <td style="background-color:#2563EB;border-radius:6px;">
        <a href="{{ url('/admin') }}"
           style="display:inline-block;padding:12px 28px;font-size:14px;font-weight:bold;color:#ffffff;text-decoration:none;font-family:Arial,Helvetica,sans-serif;">
          View in Admin Dashboard
        </a>
      </td>
    </tr>
  </table>

</x-email-layout>
