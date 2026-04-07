<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>{{ $subject ?? 'Pinpoint Launchpad' }}</title>
</head>
<body style="margin:0;padding:0;background-color:#F1F5F9;font-family:Arial,Helvetica,sans-serif;">

@isset($preheader)
<span style="display:none;max-height:0;overflow:hidden;mso-hide:all;">{{ $preheader }}</span>
@endisset

<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#F1F5F9;min-height:100vh;">
  <tr>
    <td align="center" style="padding:40px 16px;">

      {{-- Card --}}
      <table width="500" cellpadding="0" cellspacing="0" border="0" style="max-width:500px;width:100%;background-color:#ffffff;border-radius:8px;border:1px solid #E2E8F0;box-shadow:0 1px 4px rgba(0,0,0,0.06);">

        {{-- Body --}}
        <tr>
          <td style="padding:36px 36px 28px 36px;">

            {{-- Brand name --}}
            <p style="margin:0 0 28px 0;font-size:17px;font-weight:bold;color:#2563EB;font-family:Arial,Helvetica,sans-serif;">Pinpoint Launchpad</p>

            {{-- Slot: content --}}
            {{ $slot }}

          </td>
        </tr>

        {{-- Dark footer --}}
        <tr>
          <td style="background-color:#1E293B;padding:24px 36px;border-radius:0 0 8px 8px;">

            <p style="margin:0 0 6px 0;font-size:12px;color:#94A3B8;line-height:1.6;font-family:Arial,Helvetica,sans-serif;">
              This email was sent to <u style="color:#fff;">{{ $recipientEmail ?? 'you' }}</u>. If you'd rather not receive this kind of email from Pinpoint Launchpad, you can
              <a href="#" style="color:#94A3B8;">unsubscribe</a>.
            </p>

            <p style="margin:12px 0 0 0;font-size:12px;color:#64748B;line-height:1.6;font-family:Arial,Helvetica,sans-serif;">
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
