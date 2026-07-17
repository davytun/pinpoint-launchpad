<?php

namespace App\Mail;

use App\Models\Payment;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class PaymentAdminNotificationMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(public readonly Payment $payment) {}

    public function envelope(): Envelope
    {
        $currency = strtoupper($this->payment->currency ?? 'USD');
        $symbol = $currency === 'NGN' ? '₦' : '$';
        $tierLabel = $this->payment->tier_label;
        $total = number_format($this->payment->total_amount);

        return new Envelope(
            subject: "New Payment Received — {$tierLabel} | {$symbol}{$total} {$currency}",
        );
    }

    public function content(): Content
    {
        $currency = strtoupper($this->payment->currency ?? 'USD');
        $currencySymbol = $currency === 'NGN' ? '₦' : '$';

        return new Content(
            view: 'emails.payment.admin-notification',
            with: [
                'tier_label'      => $this->payment->tier_label,
                'total_amount'    => $this->payment->total_amount,
                'email'           => $this->payment->customer_email,
                'paid_at'         => $this->payment->paid_at,
                'tier'            => $this->payment->tier,
                'currency'        => $currency,
                'currency_symbol' => $currencySymbol,
            ],
        );
    }

    public function attachments(): array
    {
        return [];
    }
}
