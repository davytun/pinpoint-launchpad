<x-email-layout
    :recipient-email="$session->email"
    subject="Moving your venture to the Fast-Track"
    badge="High Velocity"
    preheader="A score of {{ $session->score }}/100 is rare. We have flagged your venture for our High-Priority Fast-Track.">

  <h1 style="color: #111827; font-size: 24px; font-weight: 800; margin-bottom: 12px; letter-spacing: -0.025em;">Moving your venture to the Fast-Track.</h1>
  
  <p style="margin-bottom: 24px;">Hi there,</p>
  
  <p style="margin-bottom: 24px;">
    I just reviewed your PARAGON diagnostic. A score of <strong>{{ $session->score }}/100</strong> is rare at this stage — specifically your performance across <strong>{{ $session->topTwoPillars() }}</strong>. I have flagged your venture for our High-Priority Fast-Track.
  </p>

  {{-- What this means box --}}
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #F9FAFB; border-radius: 12px; border: 1px solid #F3F4F6; margin-bottom: 32px;">
    <tr>
      <td style="padding: 24px;">
        <p style="margin: 0 0 16px 0; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; color: #059669;">What this means for you</p>
        
        @php
        $items = [
            'You bypass the standard intake queue entirely',
            'You speak directly with our Lead Analyst this week',
            'Your venture gets first-look placement in the Spring 2026 PIN Network cohort',
        ];
        @endphp

        <table width="100%" border="0" cellspacing="0" cellpadding="0">
          @foreach($items as $item)
          <tr>
            <td width="24" valign="top" style="padding-bottom: 12px;">
              <span style="color: #059669; font-weight: 700;">✓</span>
            </td>
            <td style="font-size: 14px; color: #4B5563; padding-bottom: 12px;">{{ $item }}</td>
          </tr>
          @endforeach
        </table>
      </td>
    </tr>
  </table>

  <p style="margin-bottom: 32px;">
    I would like to get 15 minutes with you before the end of this week to discuss your placement and institutional readiness.
  </p>

  <div style="text-align: center; margin-bottom: 32px; margin-top: 32px;">
    <a href="{{ config('mail.booking_link') }}" class="cta-button" style="background-color: #059669;">
      Book Your Fast-Track Sync
    </a>
  </div>

  <p style="margin-bottom: 0;">
    Looking forward to it,<br>
    <strong>{{ config('mail.analyst_name') }}</strong><br>
    <span style="color: #9CA3AF; font-size: 13px;">Lead Analyst, Pinpoint Launchpad</span>
  </p>

</x-email-layout>
