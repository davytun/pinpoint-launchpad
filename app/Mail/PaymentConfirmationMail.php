<?php

namespace App\Mail;

use App\Models\Payment;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class PaymentConfirmationMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(public readonly Payment $payment) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Payment Confirmed — Your PARAGON Audit Has Been Secured',
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.payment.confirmation',
            with: [
                'tier_label'   => ucfirst($this->payment->tier),
                'total_amount' => $this->payment->total_amount,
                'base_price'   => $this->payment->tier_base_amount,
                'gate_fee'     => $this->payment->gate_fee,
                'email'        => $this->payment->customer_email,
                'paid_at'      => $this->payment->paid_at,
            ],
        );
    }

    public function attachments(): array
    {
        return [];
    }
}
