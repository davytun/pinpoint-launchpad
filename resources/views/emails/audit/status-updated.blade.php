<x-email-layout :subject="'Audit Update — Pinpoint Launchpad'" :recipient-email="$founderEmail">

  <p style="margin:0 0 6px 0;font-size:20px;font-weight:bold;color:#111827;font-family:Arial,Helvetica,sans-serif;">
    PARAGON Audit Update
  </p>
  <p style="margin:0 0 20px 0;font-size:14px;color:#374151;line-height:1.6;font-family:Arial,Helvetica,sans-serif;">
    Hi {{ $founderName }},
  </p>
  <p style="margin:0 0 24px 0;font-size:14px;color:#374151;line-height:1.6;font-family:Arial,Helvetica,sans-serif;">
    {{ $body }}
  </p>

  @if($ctaText && $ctaUrl)
  <table cellpadding="0" cellspacing="0" border="0" style="margin-bottom:24px;">
    <tr>
      <td style="background-color:#2563EB;border-radius:6px;">
        <a href="{{ $ctaUrl }}"
           style="display:inline-block;padding:12px 28px;font-size:14px;font-weight:bold;color:#ffffff;text-decoration:none;font-family:Arial,Helvetica,sans-serif;">
          {{ $ctaText }}
        </a>
      </td>
    </tr>
  </table>
  @endif

  <p style="margin:0;font-size:13px;color:#6B7280;font-family:Arial,Helvetica,sans-serif;">
    — The Pinpoint Team
  </p>

</x-email-layout>
