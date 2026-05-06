<x-email-layout
    :recipient-email="$entry->email"
    subject="You're on the list — Pinpoint Launchpad"
    badge="Waitlist Confirmed"
    preheader="You're on the list. Here's your Founder Readiness Checklist — the signals that separate investable from interesting.">

  <h1 style="color: #111827; font-size: 24px; font-weight: 800; margin-bottom: 12px; letter-spacing: -0.025em;">You're officially on the waitlist.</h1>
  
  <p style="margin-bottom: 24px;">Hi {{ $entry->name }},</p>
  
  <p style="margin-bottom: 32px;">
    While we calibrate the <strong>PARAGON engine</strong> and prepare your diagnostic slot, here's your head start — the <strong>Founder Readiness Checklist</strong>. These are the signals that separate investable from interesting.
  </p>

  {{-- Checklist box --}}
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #F9FAFB; border-radius: 12px; border: 1px solid #F3F4F6; margin-bottom: 32px;">
    <tr>
      <td style="padding: 24px;">
        <p style="margin: 0 0 16px 0; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; color: #059669;">Founder Readiness Checklist</p>
        
        @php
        $items = [
            'MVP in hands of 5–10 pilot users',
            'Company legally owns all IP and trademarks',
            'Cap table is clean — founders own >80%',
            'You know your CAC and LTV',
            '12–18 month financial forecast exists',
            'At least 1 LOI, pilot contract, or $1k MRR secured',
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
    We'll notify you the moment your diagnostic slot opens. Until then, use this checklist to close any gaps — the founders who move fast get seen first.
  </p>

  <p style="margin-bottom: 0;">
    Talk soon,<br>
    <strong>The Pinpoint Team</strong>
  </p>

</x-email-layout>
