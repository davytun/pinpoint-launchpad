<x-email-layout :subject="'New Message from ' . $company_name . ' — Pinpoint'" :recipient-email="$recipient_email">

  <p style="margin:0 0 6px 0;font-size:20px;font-weight:bold;color:#111827;font-family:Arial,Helvetica,sans-serif;">
    New Message Received
  </p>
  <p style="margin:0 0 20px 0;font-size:13px;color:#6B7280;font-family:Arial,Helvetica,sans-serif;">
    {{ $founder_name }} from <strong>{{ $company_name }}</strong> has sent a new message.
  </p>

  {{-- Message preview box --}}
  @if($message_preview || $has_attachment)
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#EFF6FF;border:1px solid #BFDBFE;border-left:4px solid #2563EB;border-radius:6px;margin-bottom:24px;">
    <tr>
      <td style="padding:16px 20px;">
        @if($message_preview)
        <p style="margin:0 0 {{ $has_attachment ? '10px' : '0' }};font-size:14px;color:#1E40AF;line-height:1.6;font-style:italic;font-family:Arial,Helvetica,sans-serif;">
          "{{ $message_preview }}"
        </p>
        @endif
        @if($has_attachment)
        <p style="margin:0;font-size:13px;color:#2563EB;font-family:Arial,Helvetica,sans-serif;">
          📎 {{ $attachment_filename }} attached
        </p>
        @endif
      </td>
    </tr>
  </table>
  @endif

  {{-- CTA button --}}
  <table cellpadding="0" cellspacing="0" border="0" style="margin-bottom:24px;">
    <tr>
      <td style="background-color:#2563EB;border-radius:6px;">
        <a href="{{ $thread_url }}"
           style="display:inline-block;padding:12px 28px;font-size:14px;font-weight:bold;color:#ffffff;text-decoration:none;font-family:Arial,Helvetica,sans-serif;">
          View &amp; Reply →
        </a>
      </td>
    </tr>
  </table>

  <p style="margin:0;font-size:13px;color:#6B7280;font-family:Arial,Helvetica,sans-serif;">
    — Pinpoint System
  </p>

</x-email-layout>
