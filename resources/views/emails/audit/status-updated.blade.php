<x-email-layout :subject="'Audit Update — Pinpoint Launchpad'" :recipient-email="$founderEmail">

  <h1 style="color: #111827; font-size: 24px; font-weight: 800; margin-bottom: 12px; letter-spacing: -0.025em;">PARAGON Audit Update</h1>
  
  <p style="margin-bottom: 24px;">Hi {{ $founderName }},</p>
  
  <p style="margin-bottom: 32px;">
    {{ $body }}
  </p>

  @if($ctaText && $ctaUrl)
  <div style="text-align: center; margin-bottom: 32px;">
    <a href="{{ $ctaUrl }}" class="cta-button">
      {{ $ctaText }}
    </a>
  </div>
  @endif

  <p style="margin-bottom: 0;">
    If you have any questions, please reach out to your assigned analyst via the dashboard messages.
  </p>

</x-email-layout>
