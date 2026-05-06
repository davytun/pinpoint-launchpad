<x-email-layout :subject="'Set Up Your Pinpoint Dashboard'" :recipient-email="$email">

  <h1 style="color: #111827; font-size: 24px; font-weight: 800; margin-bottom: 12px; letter-spacing: -0.025em;">Set Up Your Dashboard</h1>
  
  <p style="margin-bottom: 24px;">Hi there,</p>
  
  <p style="margin-bottom: 32px;">
    Your agreement has been signed and your audit is now queued. To track your progress and manage your profile, you'll need to set up your dashboard access.
  </p>

  <div style="text-align: center; margin-bottom: 32px; margin-top: 32px;">
    <a href="{{ $setupUrl }}" class="cta-button">
      Set Up Your Dashboard
    </a>
  </div>

  <p style="margin-bottom: 24px; font-size: 14px; color: #6B7280;">
    Note: This invitation link will expire in 48 hours for security reasons.
  </p>

  <p style="margin-bottom: 0;">
    If you did not initiate this application, please contact us immediately at 
    <a href="mailto:support@pinpointlaunchpad.com" style="color: #3C53A8; text-decoration: none;">support@pinpointlaunchpad.com</a>.
  </p>

</x-email-layout>
