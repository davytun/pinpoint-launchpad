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
        $tierLabel = ucfirst($this->payment->tier);
        $total     = $this->payment->total_amount;

        return new Envelope(
            subject: "New Payment Received — {$tierLabel} | \${$total}",
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.payment.admin-notification',
            with: [
                'tier_label'   => ucfirst($this->payment->tier),
                'total_amount' => $this->payment->total_amount,
                'email'        => $this->payment->customer_email,
                'paid_at'      => $this->payment->paid_at,
                'tier'         => $this->payment->tier,
            ],
        );
    }

    public function attachments(): array
    {
        return [];
    }
}
