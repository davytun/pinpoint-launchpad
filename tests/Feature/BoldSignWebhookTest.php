<?php

use App\Models\Payment;
use App\Models\Signature;
use App\Models\User;
use Illuminate\Support\Facades\Mail;

test('a signed BoldSign event completes a one-signer agreement without waiting for completed', function () {
    Mail::fake();
    config()->set('services.boldsign.webhook_secret', 'test-webhook-secret');

    $user = User::factory()->create();
    $payment = Payment::create([
        'user_id' => $user->id,
        'customer_email' => $user->email,
        'tier' => 'foundation',
        'tier_base_amount' => 350000,
        'total_amount' => 350000,
        'currency' => 'NGN',
        'paid_at' => now(),
    ]);
    $payment->status = 'paid';
    $payment->save();

    $signature = Signature::create([
        'payment_id' => $payment->id,
        'boldsign_document_id' => 'boldsign-document-123',
        'status' => 'sent',
        'signer_email' => $user->email,
        'metadata' => ['tier' => 'foundation'],
    ]);

    $payload = [
        'event' => ['eventType' => 'Signed'],
        'data' => ['documentId' => $signature->boldsign_document_id],
    ];
    $rawPayload = json_encode($payload, JSON_THROW_ON_ERROR);
    $timestamp = (string) now()->timestamp;
    $hmac = hash_hmac('sha256', "{$timestamp}.{$rawPayload}", 'test-webhook-secret');

    $this->call(
        'POST',
        route('webhooks.boldsign'),
        [],
        [],
        [],
        [
            'CONTENT_TYPE' => 'application/json',
            'HTTP_X_BOLDSIGN_SIGNATURE' => "t={$timestamp}, s0={$hmac}",
        ],
        $rawPayload,
    )->assertOk();

    expect($signature->fresh()->isSigned())->toBeTrue()
        ->and($signature->fresh()->signed_at)->not->toBeNull();
});
