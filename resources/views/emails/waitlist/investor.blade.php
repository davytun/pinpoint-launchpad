<x-email-layout
    :recipient-email="$entry->email"
    subject="Welcome to the PIN Network — Pinpoint Launchpad"
    badge="PIN Network"
    preheader="You're in. Priority access to vetted founder deal flow — no noise, no intermediaries.">

  <h1 style="color: #111827; font-size: 24px; font-weight: 800; margin-bottom: 12px; letter-spacing: -0.025em;">You're in. Welcome to the PIN Network.</h1>
  
  <p style="margin-bottom: 24px;">Hi {{ $entry->name }},</p>
  
  <p style="margin-bottom: 32px;">
    Pinpoint is building the infrastructure layer between serious investors and pre-market founders. We're deliberate about who joins early — so deal flow quality stays high and the signal-to-noise ratio stays low.
  </p>

  {{-- Benefits box --}}
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #F9FAFB; border-radius: 12px; border: 1px solid #F3F4F6; margin-bottom: 32px;">
    <tr>
      <td style="padding: 24px;">
        <p style="margin: 0 0 16px 0; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; color: #3C53A8;">Priority Access Benefits</p>
        
        @php
        $benefits = [
            'Early access to vetted founder profiles before public launch',
            'Filter by stage, sector, geography, and funding ask',
            'Direct contact — no intermediaries, no cold outreach noise',
            'A founder matching brief you can set once and update any time',
        ];
        @endphp

        <table width="100%" border="0" cellspacing="0" cellpadding="0">
          @foreach($benefits as $benefit)
          <tr>
            <td width="24" valign="top" style="padding-bottom: 12px;">
              <span style="color: #3C53A8; font-weight: 700;">&bull;</span>
            </td>
            <td style="font-size: 14px; color: #4B5563; padding-bottom: 12px;">{{ $benefit }}</td>
          </tr>
          @endforeach
        </table>
      </td>
    </tr>
  </table>

  <p style="margin-bottom: 24px;">
    We know your time is spent filtering noise. Pinpoint is built to bring you signal. We will reach out shortly for a <strong>15-minute briefing</strong> to ensure our audit criteria align with your firm's specific mandate.
  </p>

  <p style="margin-bottom: 32px;">
    If anything changes on your end — fund stage, thesis, check size — just reply to this email and we'll update your profile.
  </p>

  <p style="margin-bottom: 0;">
    Good to have you here,<br>
    <strong>The Pinpoint Team</strong>
  </p>

</x-email-layout>
