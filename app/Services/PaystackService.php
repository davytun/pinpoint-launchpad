<?php

namespace App\Services;

use App\Mail\PaymentAdminNotificationMail;
use App\Mail\PaymentConfirmationMail;
use App\Models\Payment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use RuntimeException;

class PaystackService
{
    private string $secretKey;

    public function __construct()
    {
        $key = config('services.paystack.secret_key');

        if (! is_string($key) || $key === '') {
            throw new \InvalidArgumentException('Paystack secret key is not configured. Set PAYSTACK_SECRET_KEY in your .env file.');
        }

        $this->secretKey = $key;
    }

    public function initializeTransaction(array $data): array
    {
        $tierMap = [
            'foundation' => [
                'amount' => 50000,
                'base'   => 350,
                'total'  => 500,
                'label'  => 'Foundation Audit — PARAGON Certification',
            ],
            'growth' => [
                'amount' => 90000,
                'base'   => 750,
                'total'  => 900,
                'label'  => 'Growth Audit — PARAGON Certification',
            ],
            'institutional' => [
                'amount' => 165000,
                'base'   => 1500,
                'total'  => 1650,
                'label'  => 'Institutional Audit — PARAGON Certification',
            ],
        ];

        // Validate required keys before any access
        $requiredKeys = ['tier', 'email', 'callback_url', 'diagnostic_session_id'];
        $missing      = array_filter($requiredKeys, fn($k) => ! isset($data[$k]) || $data[$k] === '');

        if (! empty($missing)) {
            throw new \InvalidArgumentException('Missing required payment data keys: ' . implode(', ', $missing));
        }

        $tier = $data['tier'];

        if (! isset($tierMap[$tier])) {
            throw new \InvalidArgumentException("Invalid tier: '{$tier}'. Must be one of: " . implode(', ', array_keys($tierMap)));
        }

        $tierData    = $tierMap[$tier];
        $amount      = $tierData['amount'];
        $baseAmount  = $tierData['base'];
        $totalAmount = $tierData['total'];
        $tierLabel   = $tierData['label'];

        try {
            $response = Http::withHeaders([
                'Authorization' => 'Bearer ' . $this->secretKey,
                'Content-Type'  => 'application/json',
            ])->timeout(10)->post('https://api.paystack.co/transaction/initialize', [
                'email'        => $data['email'],
                'amount'       => $amount,
                'callback_url' => $data['callback_url'],
                'metadata'     => [
                    'tier'                  => $tier,
                    'tier_label'            => $tierLabel,
                    'diagnostic_session_id' => $data['diagnostic_session_id'],
                    'cancel_action'         => route('checkout.cancel'),
                ],
            ])->json();
        } catch (\Throwable $e) {
            Log::error('Paystack HTTP request failed during initialization', [
                'error'      => $e->getMessage(),
                'tier'       => $tier,
                'email_hash' => hash('sha256', $data['email']),
            ]);
            throw new RuntimeException('Payment gateway unavailable. Please try again.');
        }

        if (! ($response['status'] ?? false)) {
            Log::error('Paystack initialization rejected', [
                'message' => $response['message'] ?? 'Unknown',
                'tier'    => $tier,
            ]);
            throw new RuntimeException('Payment could not be initialized. Please try again.');
        }

        // status='pending' and audit_status='pending' are set atomically by DB column defaults
        $payment = Payment::create([
            'paystack_reference'    => $response['data']['reference'],
            'paystack_access_code'  => $response['data']['access_code'],
            'tier'                  => $tier,
            'tier_base_amount'      => $baseAmount,
            'gate_fee'              => 150,
            'total_amount'          => $totalAmount,
            'customer_email'        => $data['email'],
            'diagnostic_session_id' => $data['diagnostic_session_id'],
            'currency'              => 'usd',
        ]);

        $payment->log('initialized', [
            'tier'   => $tier,
            'amount' => $totalAmount,
        ]);

        return [
            'authorization_url' => $response['data']['authorization_url'],
            'reference'         => $response['data']['reference'],
            'access_code'       => $response['data']['access_code'],
        ];
    }

    public function verifyTransaction(string $reference): array
    {
        try {
            $response = Http::withHeaders([
                'Authorization' => 'Bearer ' . $this->secretKey,
            ])->timeout(10)->get('https://api.paystack.co/transaction/verify/' . rawurlencode($reference))->json();
        } catch (\Throwable $e) {
            Log::error('Paystack HTTP request failed during verification', [
                'reference' => $reference,
                'error'     => $e->getMessage(),
            ]);
            throw new RuntimeException('Payment gateway unavailable. Please try again.');
        }

        if (! ($response['status'] ?? false)) {
            Log::warning('Paystack verification returned failure', [
                'reference' => $reference,
                'message'   => $response['message'] ?? 'Unknown',
            ]);
            throw new RuntimeException('Payment verification failed.');
        }

        return $response['data'];
    }

    public function verifyWebhookSignature(Request $request): bool
    {
        $hash = hash_hmac('sha512', $request->getContent(), $this->secretKey);

        return hash_equals($hash, (string) $request->header('x-paystack-signature', ''));
    }

    public function handleWebhook(Request $request): void
    {
        // Verify signature FIRST — before touching anything
        if (! $this->verifyWebhookSignature($request)) {
            Log::warning('Paystack webhook signature mismatch', [
                'ip'        => $request->ip(),
                'timestamp' => now()->toIso8601String(),
            ]);
            abort(400, 'Invalid signature');
        }

        $payload = json_decode($request->getContent(), true);

        // Validate payload structure before processing
        if (! isset($payload['event'], $payload['data'])) {
            Log::warning('Paystack webhook malformed payload', [
                'ip'             => $request->ip(),
                'payload_length' => strlen($request->getContent()),
                'payload_hash'   => hash('sha256', $request->getContent()),
            ]);
            abort(400, 'Malformed payload');
        }

        match ($payload['event']) {
            'charge.success' => $this->handleChargeSuccess($payload['data']),
            'charge.failed'  => $this->handleChargeFailed($payload['data']),
            default          => null,
        };
    }

    private function handleChargeSuccess(array $data): void
    {
        $reference = $data['reference'] ?? null;
        if (! $reference) {
            return;
        }

        $payment = Payment::where('paystack_reference', $reference)->first();

        // Not a transaction initiated by this app — ignore silently
        if (! $payment) {
            return;
        }

        // Atomic idempotent update — only proceeds if not already paid
        $affected = Payment::where('id', $payment->id)
            ->where('status', '!=', 'paid')
            ->update(['status' => 'paid', 'paid_at' => now()]);

        if ($affected === 0) {
            Log::info('Webhook received for already-paid payment', [
                'reference' => $reference,
            ]);
            return;
        }

        $payment->refresh();
        $payment->log('webhook_received', ['event' => 'charge.success']);
        $payment->log('paid');

        try {
            Mail::to($payment->customer_email)->queue(new PaymentConfirmationMail($payment));

            $adminAddress = config('mail.admin_address');
            if ($adminAddress && filter_var($adminAddress, FILTER_VALIDATE_EMAIL)) {
                Mail::to($adminAddress)->queue(new PaymentAdminNotificationMail($payment));
            } else {
                Log::warning('Admin notification skipped: invalid or missing mail.admin_address', [
                    'payment_id' => $payment->id,
                ]);
            }
        } catch (\Throwable $e) {
            Log::error('Failed to queue payment emails after webhook', [
                'payment_id' => $payment->id,
                'error'      => $e->getMessage(),
            ]);
        }
    }

    private function handleChargeFailed(array $data): void
    {
        $reference = $data['reference'] ?? null;
        if (! $reference) {
            return;
        }

        // Atomic update — only marks failed if still pending
        $affected = Payment::where('paystack_reference', $reference)
            ->where('status', 'pending')
            ->update(['status' => 'failed']);

        if ($affected > 0) {
            $failed = Payment::where('paystack_reference', $reference)->first();
            $failed?->log('failed');
        }
    }
}
