<x-email-layout :subject="'New Document Uploaded — ' . $company_name" :recipient-email="'Admin'">

  <h1 style="color: #111827; font-size: 24px; font-weight: 800; margin-bottom: 12px; letter-spacing: -0.025em;">New Document Uploaded</h1>
  
  <p style="margin-bottom: 24px;"><strong>{{ $company_name }}</strong> has uploaded a new document for analyst review.</p>

  {{-- Document details table --}}
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #F9FAFB; border-radius: 8px; border: 1px solid #F3F4F6; margin-bottom: 32px;">
    <tr>
      <td style="padding: 24px;">
        <p style="margin: 0 0 16px 0; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; color: #3C53A8;">Upload Details</p>
        
        <table width="100%" border="0" cellspacing="0" cellpadding="0">
          <tr>
            <td style="padding: 8px 0; font-size: 14px; color: #6B7280;">Document</td>
            <td style="padding: 8px 0; font-size: 14px; color: #111827; font-weight: 700; text-align: right;">{{ $filename }}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; font-size: 14px; color: #6B7280;">Category</td>
            <td style="padding: 8px 0; font-size: 14px; color: #111827; font-weight: 700; text-align: right;">{{ $category_label }}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; font-size: 14px; color: #6B7280;">Founder</td>
            <td style="padding: 8px 0; font-size: 14px; color: #111827; font-weight: 700; text-align: right;">{{ $founder_name }}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; font-size: 14px; color: #6B7280;">Uploaded</td>
            <td style="padding: 8px 0; font-size: 14px; color: #111827; font-weight: 700; text-align: right;">{{ $uploaded_at }}</td>
          </tr>
        </table>
      </td>
    </tr>
  </table>

  <div style="text-align: center; margin-bottom: 32px; margin-top: 32px;">
    <a href="{{ $review_url }}" class="cta-button">
      Review Document
    </a>
  </div>

  <p style="margin-bottom: 0;">
    &mdash; Pinpoint System
  </p>

</x-email-layout>
