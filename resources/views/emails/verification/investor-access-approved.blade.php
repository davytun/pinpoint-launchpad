<x-email-layout :subject="'Access Granted — Secure Data Room Unlocked: ' . $profile->founder->company_name" :recipient-email="$recipientEmail">

  <h1 style="color: #111827; font-size: 24px; font-weight: 800; margin-bottom: 12px; letter-spacing: -0.025em;">Access Request Approved</h1>
  
  <p style="margin-bottom: 24px;">Hi {{ $investorName }},</p>
  
  <p style="margin-bottom: 24px;">
    We are pleased to inform you that {{ $founder->full_name }}, founder of <strong>{{ $profile->founder->company_name }}</strong>, has approved your request for access to their private data room on Pinpoint Launchpad.
  </p>

  <p style="margin-bottom: 32px;">
    You can now view and download their verified diligence assets, including unit economics models, articles of incorporation, and cap tables, using the secure link below:
  </p>

  <div style="text-align: center; margin-bottom: 32px; margin-top: 32px;">
    <a href="{{ $unlockedUrl }}" class="cta-button">
      Access Secure Data Room
    </a>
  </div>

  <p style="margin-bottom: 24px; font-size: 13px; color: #6B7280;">
    Note: This secure link is uniquely tied to your approved request. For security reasons, please do not forward this email or share your link.
  </p>

  <p style="margin-bottom: 0;">
    &mdash; The Pinpoint Team
  </p>

</x-email-layout>
