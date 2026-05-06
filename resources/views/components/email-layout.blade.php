<!DOCTYPE html>
<html lang="en" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="x-apple-disable-message-reformatting">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <title>{{ $subject ?? 'Pinpoint Launchpad' }}</title>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap');
        
        body {
            margin: 0;
            padding: 0;
            width: 100% !important;
            -webkit-text-size-adjust: 100%;
            -ms-text-size-adjust: 100%;
            background-color: #F8FAFC;
        }
        
        img {
            border: 0;
            height: auto;
            line-height: 100%;
            outline: none;
            text-decoration: none;
        }
        
        table {
            border-collapse: collapse !important;
        }
        
        .container {
            width: 100%;
            max-width: 600px;
            margin: 0 auto;
        }
        
        .content-card {
            background-color: #ffffff;
            border-radius: 12px;
            border: 1px solid #E2E8F0;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
        }
        
        .header {
            padding: 40px 0 32px;
            text-align: center;
        }
        
        .body {
            padding: 48px;
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            color: #4B5563;
            font-size: 16px;
            line-height: 1.6;
        }
        
        .footer {
            padding: 32px 48px;
            text-align: center;
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            font-size: 12px;
            color: #9CA3AF;
        }
        
        .social-link {
            display: inline-block;
            margin: 0 8px;
            color: #9CA3AF;
            text-decoration: none;
        }
        
        .cta-button {
            display: inline-block;
            background-color: #3C53A8;
            color: #ffffff !important;
            padding: 14px 28px;
            border-radius: 8px;
            font-weight: 700;
            text-decoration: none;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            font-size: 14px;
        }
        
        @media only screen and (max-width: 620px) {
            .container {
                width: 100% !important;
            }
            .body {
                padding: 32px 24px !important;
            }
        }
    </style>
</head>
<body style="background-color: #F8FAFC; margin: 0; padding: 0;">
    <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #F8FAFC;">
        <tr>
            <td align="center" style="padding: 0 16px;">
                <div class="container">
                    <!-- Header -->
                    <div class="header">
                        <a href="{{ config('app.url') }}" target="_blank">
                            <img src="{{ rtrim(config('app.url'), '/') }}/pinpoint-logo.png" alt="Pinpoint Launchpad" width="140" style="display: block; margin: 0 auto; max-width: 140px;">
                        </a>
                    </div>
                    
                    <!-- Main Card -->
                    <table width="100%" border="0" cellspacing="0" cellpadding="0" class="content-card">
                        <tr>
                            <td class="body">
                                {{ $slot }}
                            </td>
                        </tr>
                    </table>
                    
                    <!-- Footer -->
                    <div class="footer">
                        <div style="margin-bottom: 20px;">
                            <a href="#" class="social-link">LinkedIn</a>
                            <span style="color: #E2E8F0;">&bull;</span>
                            <a href="#" class="social-link">Twitter</a>
                            <span style="color: #E2E8F0;">&bull;</span>
                            <a href="#" class="social-link">Website</a>
                        </div>
                        
                        <p style="margin: 0 0 8px 0;">&copy; {{ date('Y') }} Pinpoint Launchpad. All rights reserved.</p>
                        <p style="margin: 0 0 20px 0;">Pinpoint HQ, Lagos, Nigeria</p>
                        
                        <p style="margin: 0;">
                            Sent to <span style="color: #6B7280;">{{ $recipientEmail ?? 'you' }}</span>.
                            <a href="#" style="color: #9CA3AF; text-decoration: underline;">Unsubscribe</a>
                        </p>
                    </div>
                </div>
            </td>
        </tr>
    </table>
</body>
</html>
