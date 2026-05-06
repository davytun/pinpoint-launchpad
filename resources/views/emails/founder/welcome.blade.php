<x-email-layout :subject="'Welcome to Pinpoint — Your Dashboard is Ready'" :recipient-email="$founder->email">

  <h1 style="color: #111827; font-size: 24px; font-weight: 800; margin-bottom: 12px; letter-spacing: -0.025em;">Welcome to Pinpoint, {{ $founder->full_name }}.</h1>
  
  <p style="margin-bottom: 24px;">Hi {{ $founder->full_name }},</p>
  
  <p style="margin-bottom: 32px;">
    Your account has been created and your <strong>{{ $tierLabel }} Audit</strong> is now in the queue. We're excited to help you get investor-ready.
  </p>

  <div style="background-color: #F9FAFB; border-radius: 8px; border-left: 4px solid #3C53A8; padding: 24px; margin-bottom: 32px;">
    <p style="margin: 0 0 12px 0; font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: #111827;">What happens next:</p>
    <ul style="margin: 0; padding: 0; list-style-type: none; font-size: 14px; color: #4B5563;">
      <li style="margin-bottom: 8px; padding-left: 20px; position: relative;">
        <span style="position: absolute; left: 0; color: #3C53A8;">&bull;</span>
        An analyst will be assigned to your venture within 2 business days.
      </li>
      <li style="margin-bottom: 8px; padding-left: 20px; position: relative;">
        <span style="position: absolute; left: 0; color: #3C53A8;">&bull;</span>
        You will receive a notification as soon as your audit begins.
      </li>
      <li style="margin-bottom: 0; padding-left: 20px; position: relative;">
        <span style="position: absolute; left: 0; color: #3C53A8;">&bull;</span>
        Your investor verification page goes live immediately upon completion.
      </li>
    </ul>
  </div>

  <p style="margin-bottom: 32px;">
    In the meantime, you can access your founder dashboard to review your profile and track your progress.
  </p>

  <div style="text-align: center; margin-bottom: 32px;">
    <a href="{{ $dashboardUrl }}" class="cta-button">
      Access Your Dashboard
    </a>
  </div>

  <p style="margin-bottom: 0;">
    Keep an eye on your inbox — your analyst will reach out directly when they begin reviewing your profile.
  </p>

</x-email-layout>
