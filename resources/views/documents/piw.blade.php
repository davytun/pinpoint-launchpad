<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    font-family: 'Georgia', serif;
    font-size: 11pt;
    color: #1a1a2e;
    line-height: 1.7;
    padding: 60px 70px;
    background: #ffffff;
  }
  .header {
    text-align: center;
    border-bottom: 3px solid #2563EB;
    padding-bottom: 24px;
    margin-bottom: 32px;
  }
  .brand {
    font-family: 'Arial', sans-serif;
    font-size: 22pt;
    font-weight: bold;
    color: #2563EB;
    letter-spacing: 2px;
    text-transform: uppercase;
  }
  .brand-tagline {
    font-size: 9pt;
    color: #64748B;
    letter-spacing: 3px;
    text-transform: uppercase;
    margin-top: 4px;
  }
  .document-title {
    text-align: center;
    margin: 28px 0;
  }
  .document-title h1 {
    font-size: 16pt;
    font-weight: bold;
    color: #0F172A;
    text-transform: uppercase;
    letter-spacing: 1px;
  }
  .document-title .subtitle {
    font-size: 10pt;
    color: #64748B;
    margin-top: 6px;
    font-style: italic;
  }
  .confidential-badge {
    display: inline-block;
    background: #FEF3C7;
    border: 1px solid #FCD34D;
    color: #92400E;
    font-size: 8pt;
    font-weight: bold;
    padding: 3px 10px;
    border-radius: 3px;
    text-transform: uppercase;
    letter-spacing: 1px;
    margin-bottom: 16px;
  }
  .reference-box {
    background: #F8FAFC;
    border: 1px solid #E2E8F0;
    border-left: 4px solid #2563EB;
    padding: 16px 20px;
    margin-bottom: 28px;
    border-radius: 0 4px 4px 0;
  }
  .reference-box table {
    width: 100%;
    border-collapse: collapse;
  }
  .reference-box td {
    padding: 4px 0;
    font-size: 10pt;
  }
  .reference-box td:first-child {
    color: #64748B;
    width: 160px;
    font-weight: bold;
    font-family: 'Arial', sans-serif;
    font-size: 9pt;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }
  .reference-box td:last-child {
    color: #0F172A;
    font-weight: bold;
  }
  .section {
    margin-bottom: 24px;
  }
  .section-title {
    font-family: 'Arial', sans-serif;
    font-size: 10pt;
    font-weight: bold;
    color: #2563EB;
    text-transform: uppercase;
    letter-spacing: 1px;
    margin-bottom: 10px;
    padding-bottom: 4px;
    border-bottom: 1px solid #E2E8F0;
  }
  .section p {
    font-size: 10.5pt;
    color: #334155;
    margin-bottom: 10px;
    text-align: justify;
  }
  .clause-box {
    background: #EFF6FF;
    border: 1px solid #BFDBFE;
    border-radius: 4px;
    padding: 16px 20px;
    margin: 16px 0;
  }
  .clause-box p {
    font-size: 10pt;
    color: #1E3A5F;
    font-style: italic;
    margin: 0;
    text-align: justify;
  }
  .obligation-item {
    margin-bottom: 8px;
    font-size: 10pt;
    color: #334155;
    padding-left: 20px;
  }
  .obligation-number {
    font-weight: bold;
    color: #2563EB;
    margin-right: 8px;
  }
  .signature-section {
    margin-top: 48px;
    border-top: 2px solid #E2E8F0;
    padding-top: 32px;
  }
  .signature-table {
    width: 100%;
    border-collapse: collapse;
  }
  .signature-label {
    font-family: 'Arial', sans-serif;
    font-size: 8pt;
    color: #64748B;
    text-transform: uppercase;
    letter-spacing: 1px;
    margin-bottom: 40px;
    display: block;
  }
  .signature-line {
    border-bottom: 1.5px solid #0F172A;
    margin-bottom: 8px;
    margin-top: 40px;
    height: 1px;
  }
  .signature-name {
    font-size: 10pt;
    color: #0F172A;
    font-weight: bold;
  }
  .signature-title {
    font-size: 9pt;
    color: #64748B;
  }
  .footer {
    margin-top: 48px;
    padding-top: 16px;
    border-top: 1px solid #E2E8F0;
    text-align: center;
  }
  .footer p {
    font-size: 8pt;
    color: #94A3B8;
    letter-spacing: 0.5px;
  }
</style>
</head>
<body>

  {{-- HEADER --}}
  <div class="header">
    <div class="brand">Pinpoint Launchpad</div>
    <div class="brand-tagline">
      Filtering for Quality. Solving for Success.
    </div>
  </div>

  {{-- DOCUMENT TITLE --}}
  <div class="document-title">
    <div class="confidential-badge">
      Confidential Legal Document
    </div>
    <h1>Pinpoint Investment Warrant (PIW)</h1>
    <div class="subtitle">
      Success Fee &amp; Confidentiality Agreement
    </div>
  </div>

  {{--
    BoldSign text tags are placed here only.
    These will be auto-detected by BoldSign
    and replaced with real founder data.
  --}}
  <div class="reference-box">
    <table>
      <tr>
        <td>Founder Name</td>
        <td>&nbsp;</td>
      </tr>
      <tr>
        <td>Company Name</td>
        <td>&nbsp;</td>
      </tr>
      <tr>
        <td>Audit Tier</td>
        <td>&nbsp;</td>
      </tr>
      <tr>
        <td>Amount Paid</td>
        <td>&nbsp;</td>
      </tr>
      <tr>
        <td>Agreement Date</td>
        <td>&nbsp;</td>
      </tr>
      <tr>
        <td>Document Reference</td>
        <td>PIW-{{ strtoupper(substr(md5(uniqid()), 0, 8)) }}</td>
      </tr>
    </table>
  </div>

  {{-- SECTION 1 --}}
  <div class="section">
    <div class="section-title">
      1. Parties to This Agreement
    </div>
    <p>
      This Pinpoint Investment Warrant
      ("Agreement") is entered into between
      <strong>Pinpoint Launchpad</strong>
      ("Pinpoint"), a venture-readiness platform,
      and the Company identified in the reference
      section above ("the Company"), represented
      by the Founder named above ("the Founder").
    </p>
  </div>

  {{-- SECTION 2 --}}
  <div class="section">
    <div class="section-title">
      2. Mutual Non-Disclosure Agreement
    </div>
    <p>
      Both parties agree to maintain strict
      confidentiality regarding all proprietary
      information shared during the audit process.
      Pinpoint Launchpad agrees not to disclose
      any financial, operational, or strategic
      information provided by the Company to any
      third party without explicit written consent.
    </p>
    <p>
      The Company agrees not to disclose
      Pinpoint's proprietary audit methodologies,
      scoring frameworks, or analyst reports to
      any third party.
    </p>
  </div>

  {{-- SECTION 3 --}}
  <div class="section">
    <div class="section-title">
      3. Audit Authorization
    </div>
    <p>
      By signing this Agreement, the Company
      grants Pinpoint Launchpad permission to
      conduct a comprehensive PARAGON audit,
      which includes verification of the
      following:
    </p>
    <div class="obligation-item">
      <span class="obligation-number">a.</span>
      Financial statements, forecasts, and
      use-of-funds documentation
    </div>
    <div class="obligation-item">
      <span class="obligation-number">b.</span>
      Cap table structure and equity
      distribution records
    </div>
    <div class="obligation-item">
      <span class="obligation-number">c.</span>
      Intellectual property ownership and
      trademark registration
    </div>
    <div class="obligation-item">
      <span class="obligation-number">d.</span>
      Customer acquisition metrics, unit
      economics, and revenue data
    </div>
    <div class="obligation-item">
      <span class="obligation-number">e.</span>
      Articles of incorporation and legal
      standing documentation
    </div>
  </div>

  {{-- SECTION 4 --}}
  <div class="section">
    <div class="section-title">
      4. Success Fee &amp; Equity Warrant
    </div>
    <p>
      In consideration of the audit services,
      analyst time, and network access provided
      by Pinpoint Launchpad, the Company agrees
      to the following success fee structure:
    </p>
    <div class="clause-box">
      <p>
        "By signing this agreement, the Company
        grants Pinpoint Launchpad a warrant to
        purchase 2% of the Company's Fully
        Diluted Capital Stock at a nominal strike
        price, exercisable only upon the close of
        a Qualified Financing Event ($250,000+)
        facilitated by the Pinpoint Certification
        or PIN Network introduction."
      </p>
    </div>
    <p>
      For Institutional Tier clients, the audit
      fee of $1,500 shall be credited in full
      against the 2% success fee upon the
      successful close of a Qualified Financing
      Event.
    </p>
  </div>

  {{-- SECTION 5 --}}
  <div class="section">
    <div class="section-title">
      5. Refund Policy
    </div>
    <p>
      A full refund of the audit fee is available
      if Pinpoint Launchpad has not commenced any
      work relating to the Company's application.
      Once analyst work has begun, no part of the
      fee is refundable. The Company will be
      notified when audit work commences.
    </p>
  </div>

  {{-- SECTION 6 --}}
  <div class="section">
    <div class="section-title">
      6. Governing Law
    </div>
    <p>
      This Agreement shall be governed by and
      construed in accordance with applicable
      international commercial law. Any disputes
      arising from this Agreement shall be
      resolved through binding arbitration.
    </p>
  </div>

  {{-- SIGNATURE SECTION --}}
  <div class="signature-section">
    <table class="signature-table">
      <tr>
        <td style="width:45%;vertical-align:top;padding-right:20px;">
          <span class="signature-label">
            For and on behalf of the Company
          </span>
          <div class="signature-line"></div>
          <div class="signature-name">
            Founder Signature
          </div>
          <div class="signature-title">
            Authorized Signatory
          </div>
          <div class="signature-title" style="margin-top:4px;">
            As named in reference section above
          </div>
        </td>
        <td style="width:10%;"></td>
        <td style="width:45%;vertical-align:top;">
          <span class="signature-label">
            For and on behalf of Pinpoint Launchpad
          </span>
          <div class="signature-line"></div>
          <div class="signature-name">
            Pinpoint Launchpad
          </div>
          <div class="signature-title">
            Authorized Representative
          </div>
          <div class="signature-title" style="margin-top:4px;">
            Pinpoint Launchpad Ltd.
          </div>
        </td>
      </tr>
    </table>
  </div>

  {{-- FOOTER --}}
  <div class="footer">
    <p>
      This document is legally binding upon
      signature. Pinpoint Investment Warrant —
      Confidential &amp; Proprietary —
      &copy; 2026 Pinpoint Launchpad
    </p>
  </div>

</body>
</html>
