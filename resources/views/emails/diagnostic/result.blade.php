<x-email-layout
    :recipient-email="$session->email"
    subject="Your PARAGON Diagnostic Results"
    badge="PARAGON Score"
    preheader="Your score is {{ $session->score }}/100. Here is what it means and what happens next.">

  @php
    $bandColors = [
        'low'      => '#DC2626',
        'mid_low'  => '#D97706',
        'mid_high' => '#3C53A8',
        'high'     => '#059669',
    ];
    $bandLabels = [
        'low'      => 'Build Phase',
        'mid_low'  => 'Early Stage',
        'mid_high' => 'Investment Ready',
        'high'     => 'High Velocity',
    ];
    $bandMessages = [
        'low'      => 'You are in the Build phase. Your focus now is product-market validation and structural clean-up before any investor conversation.',
        'mid_low'  => 'You have a foundation, but key gaps could trigger red flags in due diligence. Address them before approaching institutional capital.',
        'mid_high' => 'You are an Investment Ready Candidate. Your fundamentals are solid. A PARAGON Certification closes the final verification gap.',
        'high'     => 'You are a High Velocity Candidate. Your profile is exceptional. A PARAGON Certification makes that verifiable to any investor.',
    ];
    $color   = $bandColors[$session->score_band] ?? '#3C53A8';
    $label   = $bandLabels[$session->score_band]  ?? 'Unknown';
    $message = $bandMessages[$session->score_band] ?? '';
    $isReady = in_array($session->score_band, ['mid_high', 'high']);
  @endphp

  <h1 style="color: #111827; font-size: 24px; font-weight: 800; margin-bottom: 12px; letter-spacing: -0.025em;">Your Diagnostic Results</h1>
  
  <p style="margin-bottom: 32px;">
    We've completed the preliminary analysis of your venture. Your PARAGON score reflects your current institutional readiness across seven core pillars.
  </p>

  {{-- Score block --}}
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #F9FAFB; border-radius: 12px; border: 1px solid #F3F4F6; margin-bottom: 32px;">
    <tr>
      <td style="padding: 40px; text-align: center;">
        <p style="margin: 0 0 8px 0; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; color: #6B7280;">PARAGON Score</p>
        <p style="margin: 0 0 16px 0; font-size: 56px; font-weight: 800; color: {{ $color }}; line-height: 1; letter-spacing: -2px;">
          {{ $session->score }}<span style="font-size: 20px; color: #9CA3AF; font-weight: 400; letter-spacing: 0;">/100</span>
        </p>
        <span style="display: inline-block; background-color: {{ $color }}; color: #ffffff; padding: 6px 16px; border-radius: 9999px; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em;">
          {{ $label }}
        </span>
      </td>
    </tr>
  </table>

  <p style="margin-bottom: 32px; font-size: 16px; color: #4B5563; line-height: 1.6;">
    {{ $message }}
  </p>

  {{-- Pillar breakdown --}}
  <p style="margin: 0 0 16px 0; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; color: #111827;">Pillar Breakdown</p>
  
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #F9FAFB; border-radius: 8px; border: 1px solid #F3F4F6; margin-bottom: 32px;">
    <tr>
      <td style="padding: 24px;">
        @foreach($session->pillar_scores as $pillar => $score)
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="{{ $loop->first ? '' : 'margin-top: 16px;' }}">
          <tr>
            <td style="font-size: 13px; color: #6B7280; width: 100px; text-transform: capitalize;">{{ $pillar }}</td>
            <td style="padding: 0 16px;">
              <div style="background-color: #E2E8F0; border-radius: 9999px; height: 6px; width: 100%;">
                <div style="background-color: {{ $color }}; border-radius: 9999px; height: 6px; width: {{ $score }}%;"></div>
              </div>
            </td>
            <td style="font-size: 13px; color: #111827; font-weight: 700; width: 32px; text-align: right;">{{ $score }}%</td>
          </tr>
        </table>
        @endforeach
      </td>
    </tr>
  </table>

  @if($isReady)
  <div style="text-align: center; margin-bottom: 32px; margin-top: 32px;">
    <a href="{{ url('/checkout') }}" class="cta-button">
      Proceed to Application
    </a>
  </div>
  @else
  <div style="text-align: center; margin-bottom: 32px; margin-top: 32px;">
    <a href="#" class="cta-button" style="background-color: #6B7280;">
      Download Readiness Checklist
    </a>
  </div>
  @endif

  <p style="margin-bottom: 0; font-style: italic; font-size: 14px; color: #9CA3AF;">
    You will receive a follow-up email shortly with your personalised institutional roadmap.
  </p>

</x-email-layout>
