<x-email-layout :subject="'Your PIA agreement is ready to sign'">
  <h1 style="color: #111827; font-size: 24px; font-weight: 800; margin-bottom: 12px; letter-spacing: -0.025em;">Your PIA agreement is ready</h1>

  <p style="margin-bottom: 24px;">Hi {{ $name }},</p>

  <p style="margin-bottom: 32px;">We have confirmed your payment for the PARAGON Investment Assessment. Please review your details and sign the agreement to begin onboarding.</p>

  <div style="text-align: center; margin: 32px 0;">
    <a href="{{ $agreementUrl }}" class="cta-button">Review and sign agreement</a>
  </div>

  <p style="margin-bottom: 0; font-size: 14px; color: #6B7280;">This secure link expires in 7 days. If you did not request this assessment, please contact support.</p>
</x-email-layout>
