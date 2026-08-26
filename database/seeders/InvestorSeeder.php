<?php

namespace Database\Seeders;

use App\Models\Investor;
use App\Models\InvestorKycSubmission;
use App\Models\InvestorProfile;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Support\Facades\Storage;

class InvestorSeeder extends Seeder
{
    public function run(): void
    {
        // Clean out any old dummy kyc files
        Storage::disk('local')->deleteDirectory('investor-kyc');

        // Helper to generate realistic official SVG documents
        $createIdCardSvg = function (string $name, string $idNum, string $country, string $docTitle, string $accentColor = '#3b82f6') {
            return <<<SVG
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 700 440" width="700" height="440" style="background:#ffffff; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
  <defs>
    <linearGradient id="headerGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0f172a"/>
      <stop offset="100%" stop-color="#1e293b"/>
    </linearGradient>
    <linearGradient id="goldSeal" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#fef08a"/>
      <stop offset="50%" stop-color="#f59e0b"/>
      <stop offset="100%" stop-color="#b45309"/>
    </linearGradient>
    <pattern id="guilloche" width="40" height="40" patternUnits="userSpaceOnUse">
      <path d="M 0,20 Q 10,0 20,20 T 40,20" fill="none" stroke="#f1f5f9" stroke-width="1.5"/>
      <path d="M 0,20 Q 10,40 20,20 T 40,20" fill="none" stroke="#f1f5f9" stroke-width="1.5"/>
    </pattern>
  </defs>
  
  <!-- Outer Card Frame -->
  <rect x="5" y="5" width="690" height="430" rx="20" fill="#ffffff" stroke="#e2e8f0" stroke-width="2"/>
  <rect x="15" y="15" width="670" height="410" rx="16" fill="url(#guilloche)" stroke="#cbd5e1" stroke-width="1"/>
  
  <!-- Header Bar -->
  <rect x="15" y="15" width="670" height="75" rx="16" fill="url(#headerGrad)"/>
  <rect x="15" y="65" width="670" height="25" fill="url(#headerGrad)"/>
  <circle cx="55" cy="52" r="18" fill="{$accentColor}"/>
  <text x="55" y="58" fill="#ffffff" font-size="16" font-weight="900" text-anchor="middle">★</text>
  
  <text x="88" y="44" fill="#ffffff" font-size="15" font-weight="800" letter-spacing="1">{$country} · OFFICIAL IDENTITY SYSTEM</text>
  <text x="88" y="64" fill="#94a3b8" font-size="11" font-weight="600" letter-spacing="2">{$docTitle}</text>
  
  <text x="660" y="54" fill="#38bdf8" font-size="13" font-weight="700" text-anchor="end" font-family="monospace">{$idNum}</text>

  <!-- Photo Box Container -->
  <g transform="translate(45, 115)">
    <rect width="150" height="190" rx="12" fill="#f8fafc" stroke="#cbd5e1" stroke-width="1.5"/>
    <!-- Stylized Avatar Silhouette -->
    <circle cx="75" cy="80" r="38" fill="#94a3b8"/>
    <path d="M 30 160 C 30 125, 120 125, 120 160 Z" fill="#94a3b8"/>
    <rect x="0" y="160" width="150" height="30" rx="6" fill="#0f172a" opacity="0.8"/>
    <text x="75" y="180" fill="#ffffff" font-size="10" font-weight="700" text-anchor="middle" letter-spacing="1">VERIFIED BIOMETRIC</text>
  </g>

  <!-- Security Hologram Badge -->
  <g transform="translate(45, 320)">
    <rect width="70" height="70" rx="10" fill="url(#goldSeal)" stroke="#b45309" stroke-width="1"/>
    <circle cx="35" cy="35" r="26" fill="none" stroke="#ffffff" stroke-width="1.5" stroke-dasharray="3,2"/>
    <text x="35" y="32" fill="#78350f" font-size="18" font-weight="900" text-anchor="middle">★</text>
    <text x="35" y="50" fill="#78350f" font-size="8" font-weight="800" text-anchor="middle" letter-spacing="1">SECURE</text>
  </g>

  <!-- Investor & Document Information Grid -->
  <g transform="translate(230, 115)">
    <!-- Full Name -->
    <text x="0" y="18" fill="#64748b" font-size="10" font-weight="700" letter-spacing="1">FULL LEGAL NAME / NOM COMPLET</text>
    <text x="0" y="44" fill="#0f172a" font-size="22" font-weight="800">{$name}</text>

    <!-- Document Number & Type -->
    <text x="0" y="85" fill="#64748b" font-size="10" font-weight="700" letter-spacing="1">DOCUMENT IDENTIFIER</text>
    <text x="0" y="108" fill="#0f172a" font-size="15" font-weight="700" font-family="monospace">{$idNum}</text>

    <text x="230" y="85" fill="#64748b" font-size="10" font-weight="700" letter-spacing="1">JURISDICTION</text>
    <text x="230" y="108" fill="#0f172a" font-size="15" font-weight="700">{$country}</text>

    <!-- Accreditation Status -->
    <text x="0" y="148" fill="#64748b" font-size="10" font-weight="700" letter-spacing="1">INVESTOR CLASSIFICATION</text>
    <rect x="0" y="158" width="260" height="26" rx="6" fill="#ecfdf5" stroke="#a7f3d0"/>
    <text x="12" y="175" fill="#065f46" font-size="11" font-weight="700">✓ ACCREDITED INSTITUTIONAL / HNW</text>

    <text x="290" y="148" fill="#64748b" font-size="10" font-weight="700" letter-spacing="1">EXPIRY DATE</text>
    <text x="290" y="175" fill="#0f172a" font-size="13" font-weight="600">31 DEC 2030</text>
  </g>

  <!-- Machine Readable Zone (MRZ) Strip at Bottom -->
  <g transform="translate(135, 335)">
    <rect width="525" height="55" rx="8" fill="#0f172a"/>
    <text x="20" y="26" fill="#94a3b8" font-family="monospace" font-size="12" font-weight="700" letter-spacing="2">P&lt;{$country}&lt;{$name}&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;</text>
    <text x="20" y="44" fill="#94a3b8" font-family="monospace" font-size="12" font-weight="700" letter-spacing="2">{$idNum}7{$country}8506124M3012318&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;02</text>
  </g>
</svg>
SVG;
        };

        $investors = [
            [
                'email' => 'davidakintunde433@gmail.com',
                'name' => 'David Akintunde',
                'company' => 'Akintunde Capital',
                'type' => 'individual',
                'phone' => '+234 904 497 4094',
                'address' => 'Victoria Island, Lagos, Nigeria',
                'kyc_status' => Investor::KYC_STATUS_PENDING,
                'doc_name' => 'National_ID_Card.svg',
                'doc_title' => 'FEDERAL NATIONAL IDENTITY CARD',
                'doc_type' => 'valid_id',
                'mime' => 'image/svg+xml',
                'id_num' => 'NIN-8492018491',
                'country' => 'NIGERIA (NGA)',
                'accent' => '#10b981',
                'sub_status' => InvestorKycSubmission::STATUS_PENDING,
            ],
            [
                'email' => 'elena.rostova@genevahorizon.ch',
                'name' => 'Elena Rostova',
                'company' => 'Geneva Horizon SA',
                'type' => 'corporate',
                'phone' => '+41 22 819 9000',
                'address' => 'Rue du Rhône 42, 1204 Geneva, Switzerland',
                'kyc_status' => Investor::KYC_STATUS_PENDING,
                'doc_name' => 'Swiss_Passport_Certified.svg',
                'doc_title' => 'SWISS CONFEDERATION PASSPORT',
                'doc_type' => 'passport',
                'mime' => 'image/svg+xml',
                'id_num' => 'CHE-P7892104',
                'country' => 'SWITZERLAND (CHE)',
                'accent' => '#ef4444',
                'sub_status' => InvestorKycSubmission::STATUS_PENDING,
            ],
            [
                'email' => 'marcus.vance@vancecap.co.uk',
                'name' => 'Marcus Vance',
                'company' => 'Vance Syndicate',
                'type' => 'individual',
                'phone' => '+44 20 7946 0912',
                'address' => '10 Berkeley Square, Mayfair, London, United Kingdom',
                'kyc_status' => Investor::KYC_STATUS_APPROVED,
                'doc_name' => 'UK_Drivers_License.svg',
                'doc_title' => 'UK DRIVING LICENCE & IDENTITY',
                'doc_type' => 'drivers_license',
                'mime' => 'image/svg+xml',
                'id_num' => 'GBR-VANCE9028',
                'country' => 'UNITED KINGDOM (GBR)',
                'accent' => '#3b82f6',
                'sub_status' => InvestorKycSubmission::STATUS_APPROVED,
            ],
            [
                'email' => 'chen.wei@silkroadbiotech.hk',
                'name' => 'Dr. Chen Wei',
                'company' => 'SilkRoad BioTech Fund',
                'type' => 'corporate',
                'phone' => '+852 2588 1234',
                'address' => 'Two International Finance Centre, Central, Hong Kong',
                'kyc_status' => Investor::KYC_STATUS_APPROVED,
                'doc_name' => 'HK_Corporate_Registry_Certificate.svg',
                'doc_title' => 'CERTIFICATE OF INCORPORATION',
                'doc_type' => 'certificate_of_incorporation',
                'mime' => 'image/svg+xml',
                'id_num' => 'HK-CR-99201481',
                'country' => 'HONG KONG (HKG)',
                'accent' => '#6366f1',
                'sub_status' => InvestorKycSubmission::STATUS_APPROVED,
            ],
            [
                'email' => 'fatima.almansoor@oasisfo.ae',
                'name' => 'Fatima Al-Mansoor',
                'company' => 'Gulf Oasis Family Office',
                'type' => 'corporate',
                'phone' => '+971 4 362 7000',
                'address' => 'DIFC Gate Tower 4, Dubai, United Arab Emirates',
                'kyc_status' => Investor::KYC_STATUS_NOT_SUBMITTED,
                'doc_name' => null,
                'doc_title' => null,
                'doc_type' => null,
                'mime' => null,
                'id_num' => null,
                'country' => null,
                'accent' => null,
                'sub_status' => null,
            ],
            [
                'email' => 'jeanluc.moreau@moreaucie.fr',
                'name' => 'Jean-Luc Moreau',
                'company' => 'Moreau & Cie',
                'type' => 'individual',
                'phone' => '+33 1 42 68 55 00',
                'address' => 'Boulevard Haussmann 85, Paris, France',
                'kyc_status' => Investor::KYC_STATUS_REJECTED,
                'doc_name' => 'Expired_French_Passport.svg',
                'doc_title' => 'PASSEPORT RÉPUBLIQUE FRANÇAISE',
                'doc_type' => 'passport',
                'mime' => 'image/svg+xml',
                'id_num' => 'FRA-EXP-201894',
                'country' => 'FRANCE (FRA)',
                'accent' => '#f59e0b',
                'sub_status' => InvestorKycSubmission::STATUS_REJECTED,
            ],
        ];

        // Delete all old submission records to avoid stale 1x1 green pixel images
        InvestorKycSubmission::query()->delete();

        foreach ($investors as $data) {
            $investor = Investor::updateOrCreate(
                ['email' => $data['email']],
                [
                    'password' => bcrypt('password123'),
                    'account_status' => Investor::ACCOUNT_STATUS_ACTIVE,
                    'kyc_status' => $data['kyc_status'],
                    'kyc_approved_at' => $data['kyc_status'] === Investor::KYC_STATUS_APPROVED ? now()->subDays(3) : null,
                    'email_verified_at' => now()->subDays(5),
                    'aml_confirmed_at' => now()->subDays(5),
                    'terms_accepted_at' => now()->subDays(5),
                ]
            );

            InvestorProfile::updateOrCreate(
                ['investor_id' => $investor->id],
                [
                    'investor_type' => $data['type'],
                    'full_name' => $data['name'],
                    'company_name' => $data['company'],
                    'phone' => $data['phone'],
                    'address' => $data['address'],
                ]
            );

            if ($data['doc_name']) {
                $storagePath = "investor-kyc/{$investor->id}/{$data['doc_name']}.enc";
                $rawSvg = $createIdCardSvg(
                    $data['name'],
                    $data['id_num'],
                    $data['country'],
                    $data['doc_title'],
                    $data['accent'] ?? '#3b82f6'
                );
                Storage::disk('local')->put($storagePath, Crypt::encryptString($rawSvg));

                InvestorKycSubmission::create([
                    'investor_id' => $investor->id,
                    'original_name' => $data['doc_name'],
                    'document_type' => $data['doc_type'],
                    'storage_path' => $storagePath,
                    'mime_type' => $data['mime'],
                    'size_bytes' => strlen($rawSvg),
                    'status' => $data['sub_status'],
                    'review_notes' => $data['sub_status'] === InvestorKycSubmission::STATUS_REJECTED ? 'The submitted document has expired. Please re-submit a valid unexpired passport.' : null,
                    'reviewed_at' => $data['sub_status'] !== InvestorKycSubmission::STATUS_PENDING ? now()->subDays(2) : null,
                ]);
            }
        }
    }
}
