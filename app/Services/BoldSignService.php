<?php

namespace App\Services;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class BoldSignService
{
    private string $baseUrl;
    private string $apiKey;
    private string $templateId;

    public function __construct()
    {
        $this->baseUrl    = rtrim(config('services.boldsign.base_url'), '/');
        $this->apiKey     = config('services.boldsign.api_key');
        $this->templateId = config('services.boldsign.template_id');
    }

    public function createDocumentFromTemplate(array $data): array
    {
        $response = Http::withHeaders([
            'X-API-KEY'    => $this->apiKey,
            'Accept'       => 'application/json',
            'Content-Type' => 'application/json',
        ])->post("{$this->baseUrl}/v1/template/send?templateId={$this->templateId}", [
            'title'   => "Pinpoint Investment Warrant — {$data['company_name']}",
            'message' => 'Please sign the Success Fee and Confidentiality Agreement to begin your PARAGON audit.',
            'roles'   => [
                [
                    'roleIndex'   => 1,
                    'signerName'  => $data['name'],
                    'signerEmail' => $data['email'],
                    'signerType'  => 'Signer',
                    'existingFormFields' => [
                        ['id' => 'founder_name',  'value' => $data['founder_name'],     'isReadOnly' => true],
                        ['id' => 'company_name',  'value' => $data['company_name'],     'isReadOnly' => true],
                        ['id' => 'tier_selected', 'value' => $data['tier_selected'],    'isReadOnly' => true],
                        ['id' => 'amount_paid',   'value' => '$' . $data['amount_paid'],'isReadOnly' => true],
                        ['id' => 'date',          'value' => $data['date'],             'isReadOnly' => true],
                    ],
                ],
            ],
            'enableSigningOrder' => false,
            'reminderSettings'   => [
                'enableAutoReminder' => true,
                'reminderDays'       => 2,
                'reminderCount'      => 3,
            ],
        ]);

        if (! $response->successful()) {
            Log::error('BoldSign createDocumentFromTemplate failed', [
                'status' => $response->status(),
                'body'   => $response->body(),
                'email'  => $data['email'],
            ]);
            throw new \RuntimeException('BoldSign API error: ' . $response->body());
        }

        return [
            'document_id' => $response->json('documentId'),
            'status'      => 'sent',
        ];
    }

    // Returns ['url' => string, 'expires_at' => Carbon] — BoldSign URLs are valid ~30 min.
    public function getEmbeddedSignUrl(string $documentId, string $signerEmail): array
    {
        $response = Http::withHeaders([
            'X-API-KEY' => $this->apiKey,
            'Accept'    => 'application/json',
        ])->get("{$this->baseUrl}/v1/document/getEmbeddedSignLink", [
            'documentId'  => $documentId,
            'signerEmail' => $signerEmail,
            'redirectUrl' => route('onboarding.complete'),
        ]);

        if (! $response->successful()) {
            Log::error('BoldSign getEmbeddedSignUrl failed', [
                'status'     => $response->status(),
                'body'       => $response->body(),
                'documentId' => $documentId,
            ]);
            throw new \RuntimeException('BoldSign embed URL error: ' . $response->body());
        }

        return [
            'url'        => $response->json('signLink'),
            'expires_at' => now()->addMinutes(30),
        ];
    }

    public function verifyWebhookSignature(Request $request): bool
    {
        $secret = config('services.boldsign.webhook_secret');

        // No secret = reject everything — never allow unsigned webhooks
        if (empty($secret)) {
            Log::critical('BOLDSIGN_WEBHOOK_SECRET is not configured. All webhooks will be rejected. Set this value immediately.', [
                'ip' => $request->ip(),
            ]);
            return false;
        }

        // BoldSign header format: "t=<timestamp>, s0=<hmac_hex>"
        // HMAC is computed over "<timestamp>.<raw_body>"
        $header = $request->header('X-BoldSign-Signature') ?? '';

        if (empty($header)) {
            Log::warning('BoldSign webhook missing signature header', ['ip' => $request->ip()]);
            return false;
        }

        $timestamp = null;
        $signature = null;

        foreach (explode(',', $header) as $part) {
            $parts = explode('=', trim($part), 2);
            if (count($parts) !== 2) continue;
            [$key, $value] = array_map('trim', $parts);
            if ($key === 't')  $timestamp = $value;
            if ($key === 's0') $signature = $value;
        }

        if (! $timestamp || ! $signature) {
            Log::warning('BoldSign webhook: could not parse signature header', ['header' => $header]);
            return false;
        }

        $payload  = $request->getContent();
        $expected = hash_hmac('sha256', "{$timestamp}.{$payload}", $secret);

        return hash_equals($expected, $signature);
    }

    public function handleWebhook(Request $request): void
    {
        $payload   = json_decode($request->getContent(), true) ?? [];
        $eventType = $payload['event']['eventType'] ?? ($payload['event'] ?? 'unknown');
        $documentId = $payload['data']['documentId'] ?? null;

        Log::info('BoldSign webhook received', [
            'eventType'  => $eventType,
            'documentId' => $documentId,
            'ip'         => $request->ip(),
            'timestamp'  => now()->toISOString(),
        ]);

        if (! $this->verifyWebhookSignature($request)) {
            abort(400, 'Invalid webhook signature.');
        }

        match ($eventType) {
            'Completed' => $this->handleDocumentCompleted($payload),
            'Declined'  => $this->handleDocumentDeclined($payload),
            'Revoked'   => $this->handleDocumentRevoked($payload),
            default     => Log::info('BoldSign unhandled event', ['eventType' => $eventType]),
        };
    }

    public function downloadSignedDocument(string $documentId): string|null
    {
        try {
            $response = Http::withHeaders([
                'X-API-KEY' => $this->apiKey,
            ])->get("{$this->baseUrl}/v1/document/download", [
                'documentId' => $documentId,
            ]);

            if ($response->successful()) {
                $path = 'signatures/piw_' . $documentId . '.pdf';
                Storage::disk('local')->put($path, $response->body());
                return $path;
            }

            Log::warning('BoldSign downloadSignedDocument: non-200 response', [
                'status'     => $response->status(),
                'documentId' => $documentId,
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to download signed PDF', [
                'documentId' => $documentId,
                'error'      => $e->getMessage(),
            ]);
        }

        return null;
    }

    private function handleDocumentCompleted(array $payload): void
    {
        $documentId = $payload['data']['documentId'] ?? null;

        if (! $documentId) {
            Log::warning('BoldSign Completed event missing documentId', ['payload' => $payload]);
            return;
        }

        $signature = \App\Models\Signature::where('boldsign_document_id', $documentId)->first();

        if (! $signature) {
            Log::warning('BoldSign Completed: no Signature record found', ['documentId' => $documentId]);
            return;
        }

        $signature->log('webhook_received', ['eventType' => 'Completed']);

        // Idempotency — webhook may fire more than once
        if ($signature->isSigned()) {
            return;
        }

        $signature->update([
            'status'    => 'signed',
            'signed_at' => now(),
        ]);

        $signature->log('signed');

        // Download and store a local copy of the signed PDF
        $pdfPath = $this->downloadSignedDocument($documentId);
        if ($pdfPath) {
            $signature->update(['signed_pdf_path' => $pdfPath]);
            $signature->log('pdf_downloaded', ['path' => $pdfPath]);
        }

        $tierLabel = ucfirst($signature->metadata['tier'] ?? 'Foundation');

        Mail::to($signature->signer_email)
            ->send(new \App\Mail\SignatureCompleteMail($signature, $tierLabel));

        Mail::to(config('mail.admin_address'))
            ->send(new \App\Mail\SignatureAdminNotificationMail($signature, $tierLabel));

        // Generate a one-time setup token so the founder can create their dashboard account.
        // The token is validated in FounderAuthController::showSetup() and setup().
        $setupToken = Str::random(64);
        Cache::put(
            'founder_setup_token_' . $signature->signer_email,
            $setupToken,
            now()->addHours(48)
        );

        $setupUrl = route('founder.setup') . '?token=' . $setupToken . '&email=' . urlencode($signature->signer_email);

        Mail::to($signature->signer_email)
            ->send(new \App\Mail\FounderSetupInviteMail($signature->signer_email, $setupUrl));

        Log::info('BoldSign document signed, PDF stored, emails dispatched', [
            'documentId'   => $documentId,
            'signer_email' => $signature->signer_email,
            'pdf_path'     => $pdfPath,
        ]);
    }

    private function handleDocumentDeclined(array $payload): void
    {
        $documentId = $payload['data']['documentId'] ?? null;
        $signature  = \App\Models\Signature::where('boldsign_document_id', $documentId)->first();

        if ($signature) {
            $signature->update(['status' => 'declined']);
            $signature->log('webhook_received', ['eventType' => 'Declined']);
            Log::info('BoldSign document declined', ['documentId' => $documentId]);
        }
    }

    private function handleDocumentRevoked(array $payload): void
    {
        $documentId = $payload['data']['documentId'] ?? null;
        $signature  = \App\Models\Signature::where('boldsign_document_id', $documentId)->first();

        if ($signature) {
            $signature->update(['status' => 'revoked']);
            $signature->log('webhook_received', ['eventType' => 'Revoked']);
            Log::info('BoldSign document revoked', ['documentId' => $documentId]);
        }
    }
}
