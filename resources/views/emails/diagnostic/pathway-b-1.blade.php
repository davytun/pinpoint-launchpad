<x-email-layout :recipient-email="$session->email" subject="You're in the top 20%">

  <p style="margin:0 0 4px 0;font-size:18px;font-weight:bold;color:#1E293B;font-family:Arial,Helvetica,sans-serif;">
    You're in the top 20%</p>
  <p style="margin:0 0 24px 0;font-size:14px;color:#64748B;font-family:Arial,Helvetica,sans-serif;">But the "Unknown No"
    is lurking.</p>

  <p style="margin:0 0 14px 0;font-size:14px;color:#475569;line-height:1.7;font-family:Arial,Helvetica,sans-serif;">Hi
    there,</p>

  <p style="margin:0 0 14px 0;font-size:14px;color:#475569;line-height:1.7;font-family:Arial,Helvetica,sans-serif;">Your
    PARAGON score of <strong style="color:#1E293B;">{{ $session->score }}/100</strong> puts you in the top 20% of
    founders who have taken this diagnostic. That's genuinely impressive. But here is the hard truth:</p>

  <table width="100%" cellpadding="0" cellspacing="0" border="0"
    style="margin-bottom:20px;background-color:#FFFBEB;border-left:3px solid #D97706;border-radius:0 6px 6px 0;">
    <tr>
      <td style="padding:18px 20px;">
        <p
          style="margin:0 0 10px 0;font-size:13px;color:#1E293B;line-height:1.7;font-family:Arial,Helvetica,sans-serif;">
          Founders with scores between 65 and 85 are the most likely to stall at the term-sheet stage — not because
          their business is weak, but because they cannot prove it isn't.</p>
        <p style="margin:0;font-size:13px;color:#1E293B;line-height:1.7;font-family:Arial,Helvetica,sans-serif;">VCs
          call this the "Unknown No." Your numbers look good. Your story sounds right. But without verified data, they
          move on to the next deal.</p>
      </td>
    </tr>
  </table>

  <p style="margin:0 0 14px 0;font-size:14px;color:#475569;line-height:1.7;font-family:Arial,Helvetica,sans-serif;">Your
    weakest pillar right now is <strong style="color:#1E293B;">{{ $session->primaryGap() }}</strong>. That single gap is
    enough to lose a term sheet.</p>

  <p style="margin:0 0 20px 0;font-size:14px;color:#475569;line-height:1.7;font-family:Arial,Helvetica,sans-serif;">The
    PARAGON Certification closes that gap — with verified financials, a clean cap table audit, and an analyst-signed
    Radar Chart that travels with your deck.</p>

  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:20px;">
    <tr>
      <td><a href="/checkout"
          style="display:inline-block;background-color:#3A54A5;color:#ffffff;padding:12px 24px;border-radius:6px;font-weight:bold;font-size:14px;text-decoration:none;font-family:Arial,Helvetica,sans-serif;">Unlock
          Your Professional Audit — $150</a></td>
    </tr>
  </table>

  <p style="margin:0 0 14px 0;font-size:14px;color:#475569;line-height:1.7;font-family:Arial,Helvetica,sans-serif;">This
    is not a course. This is not a PDF. This is a due diligence team stress-testing your business before you step into
    the pitch room.</p>

  <p style="margin:0;font-size:14px;color:#475569;font-family:Arial,Helvetica,sans-serif;">The Pinpoint Team</p>

</x-email-layout>