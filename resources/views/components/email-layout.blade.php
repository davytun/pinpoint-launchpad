<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>{{ $subject ?? 'Pinpoint Launchpad' }}</title>
</head>
<body style="margin:0;padding:0;background-color:#ffffff;font-family:Arial,Helvetica,sans-serif;">

@isset($preheader)
<span style="display:none;max-height:0;overflow:hidden;mso-hide:all;">{{ $preheader }}</span>
@endisset

<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#ffffff;min-height:100vh;">
  <tr>
    <td align="center" style="padding:40px 16px;">

      {{-- Card --}}
      <table width="500" cellpadding="0" cellspacing="0" border="0" style="max-width:500px;width:100%;background-color:#ffffff;border-radius:8px;border:1px solid #E2E8F0;box-shadow:0 1px 4px rgba(0,0,0,0.06);">

        {{-- Body --}}
        <tr>
          <td style="padding:36px 36px 28px 36px;">

            {{-- Logo (base64 inline so it renders in all email clients regardless of APP_URL) --}}
            @php $logoPath = public_path('pinpoint-logo.png'); @endphp
            @if(file_exists($logoPath))
            <img src="data:image/png;base64,{{ base64_encode(file_get_contents($logoPath)) }}" alt="Pinpoint Launchpad" width="140" style="display:block;margin:0 0 28px 0;max-width:140px;height:auto;">
            @else
            <img src="{{ config('app.url') }}/pinpoint-logo.png" alt="Pinpoint Launchpad" width="140" style="display:block;margin:0 0 28px 0;max-width:140px;height:auto;">
            @endif

            {{-- Slot: content --}}
            {{ $slot }}

          </td>
        </tr>

        {{-- Footer --}}
        <tr>
          <td style="background-color:#3A54A5;padding:24px 36px;border-radius:0 0 8px 8px;">

            <p style="margin:0 0 6px 0;font-size:12px;color:#c7d0ed;line-height:1.6;font-family:Arial,Helvetica,sans-serif;">
              This email was sent to <u>{{ $recipientEmail ?? 'you' }}</u>. If you'd rather not receive this kind of email from Pinpoint Launchpad, you can
              <a href="#" style="color:#c7d0ed;">unsubscribe</a>.
            </p>

            <p style="margin:12px 0 0 0;font-size:12px;color:#8fa0d0;line-height:1.6;font-family:Arial,Helvetica,sans-serif;">
              &copy; 2026 Pinpoint Launchpad
            </p>

          </td>
        </tr>

      </table>
    </td>
  </tr>
</table>

</body>
</html>
