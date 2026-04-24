<x-email-layout
  :subject="'PIW Signed — New Founder Ready for Analyst Assignment'"
  :recipient-email="config('mail.admin_address')">

  <p style="margin:0 0 6px 0;font-size:22px;font-weight:bold;color:#111827;font-family:Arial,Helvetica,sans-serif;">
    New Founder Ready for Audit
  </p>
  <p style="margin:0 0 24px 0;font-size:14px;color:#374151;line-height:1.6;font-family:Arial,Helvetica,sans-serif;">
    A founder has signed their Pinpoint Investment Warrant and is ready for analyst assignment.
  </p>

  {{-- Details table --}}
  <table width="100%" cellpadding="0" cellspacing="0" border="0"
    style="background-color:#F9FAFB;border:1px solid #E5E7EB;border-radius:6px;margin-bottom:24px;">
    <tr>
      <td style="padding:20px 24px;">
        <p style="margin:0 0 14px 0;font-size:11px;font-weight:bold;letter-spacing:0.1em;text-transform:uppercase;color:#1D4ED8;font-family:Arial,Helvetica,sans-serif;">
          Founder Details
        </p>
        <table width="100%" cellpadding="0" cellspacing="0" border="0">
          <tr>
            <td style="padding:5px 0;font-size:13px;color:#374151;font-family:Arial,Helvetica,sans-serif;width:120px;">Email</td>
            <td style="padding:5px 0;font-size:13px;font-weight:bold;color:#111827;font-family:Arial,Helvetica,sans-serif;">{{ $signer_email }}</td>
          </tr>
          <tr>
            <td style="padding:5px 0;font-size:13px;color:#374151;font-family:Arial,Helvetica,sans-serif;">Tier</td>
            <td style="padding:5px 0;font-size:13px;font-weight:bold;color:#111827;font-family:Arial,Helvetica,sans-serif;">{{ $tier_label }} Audit</td>
          </tr>
          <tr>
            <td style="padding:5px 0;font-size:13px;color:#374151;font-family:Arial,Helvetica,sans-serif;">Signed</td>
            <td style="padding:5px 0;font-size:13px;color:#111827;font-family:Arial,Helvetica,sans-serif;">
              @if($signed_at instanceof \Illuminate\Support\Carbon || $signed_at instanceof \Carbon\Carbon)
                {{ $signed_at->format('d M Y, H:i') }} UTC
              @else
                {{ $signed_at }}
              @endif
            </td>
          </tr>
          <tr>
            <td style="padding:5px 0;font-size:13px;color:#374151;font-family:Arial,Helvetica,sans-serif;">Document ID</td>
            <td style="padding:5px 0;font-size:12px;color:#6B7280;font-family:monospace,Arial;">{{ $document_id }}</td>
          </tr>
        </table>
      </td>
    </tr>
  </table>

  {{-- Action required --}}
  <table width="100%" cellpadding="0" cellspacing="0" border="0"
    style="background-color:#FEF3C7;border:1px solid #FDE68A;border-radius:6px;margin-bottom:24px;">
    <tr>
      <td style="padding:16px 24px;">
        <p style="margin:0 0 8px 0;font-size:11px;font-weight:bold;letter-spacing:0.1em;text-transform:uppercase;color:#92400E;font-family:Arial,Helvetica,sans-serif;">
          Action Required
        </p>
        <table cellpadding="0" cellspacing="0" border="0">
          <tr><td style="padding:3px 0;font-size:13px;color:#78350F;font-family:Arial,Helvetica,sans-serif;">→ Assign an analyst and begin the audit process.</td></tr>
          <tr><td style="padding:3px 0;font-size:13px;color:#78350F;font-family:Arial,Helvetica,sans-serif;">→ Update audit_status to "in_progress" once work begins.</td></tr>
        </table>
      </td>
    </tr>
  </table>

  {{-- CTA --}}
  <table cellpadding="0" cellspacing="0" border="0" style="margin-bottom:24px;">
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
