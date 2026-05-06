<x-email-layout :subject="'New Message from Pinpoint Launchpad'" :recipient-email="$recipient_email">

  <h1 style="color: #111827; font-size: 24px; font-weight: 800; margin-bottom: 12px; letter-spacing: -0.025em;">New Message Received</h1>
  
  <p style="margin-bottom: 24px;">Hi {{ $founder_name }},</p>
  
  <p style="margin-bottom: 32px;">
    Your analyst has sent you a new message regarding your PARAGON audit. Review the details below and respond via your dashboard.
  </p>

  {{-- Message preview box --}}
  @if($message_preview || $has_attachment)
  <div style="background-color: #F9FAFB; border-radius: 8px; border-left: 4px solid #3C53A8; padding: 24px; margin-bottom: 32px;">
    <p style="margin: 0 0 12px 0; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; color: #111827;">Message Preview</p>
    
    @if($message_preview)
    <p style="margin: 0 0 {{ $has_attachment ? '12px' : '0' }} 0; font-size: 15px; color: #4B5563; line-height: 1.6; font-style: italic;">
      "{{ $message_preview }}"
    </p>
    @endif
    
    @if($has_attachment)
    <p style="margin: 0; font-size: 13px; color: #3C53A8; font-weight: 600;">
      📎 {{ $attachment_filename }} attached
    </p>
    @endif
  </div>
  @endif

  <div style="text-align: center; margin-bottom: 32px; margin-top: 32px;">
    <a href="{{ $dashboard_url }}" class="cta-button">
      View Message
    </a>
  </div>

  <p style="margin-bottom: 0;">
    &mdash; The Pinpoint Team
  </p>

</x-email-layout>
