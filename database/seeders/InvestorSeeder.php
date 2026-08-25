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
        // 1. Investor with Pending KYC for testing review
        $investor = Investor::firstOrCreate(
            ['email' => 'davidakintunde433@gmail.com'],
            [
                'password' => 'password123',
                'account_status' => Investor::ACCOUNT_STATUS_ACTIVE,
                'kyc_status' => Investor::KYC_STATUS_PENDING,
                'email_verified_at' => now(),
            ]
        );

        InvestorProfile::updateOrCreate(
            ['investor_id' => $investor->id],
            [
                'investor_type' => 'individual',
                'full_name' => 'David Akintunde',
                'company_name' => 'Akintunde Capital',
                'phone' => '+2349044974094',
                'address' => 'Victoria Island, Lagos, Nigeria',
            ]
        );

        // Create sample dummy encrypted document
        $storagePath = "investor-kyc/{$investor->id}/sample_id.png.enc";
        $dummyImage = base64_decode('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==');
        Storage::disk('local')->put($storagePath, Crypt::encryptString($dummyImage));

        InvestorKycSubmission::updateOrCreate(
            [
                'investor_id' => $investor->id,
                'original_name' => 'National_ID_Card.png',
            ],
            [
                'document_type' => 'valid_id',
                'storage_path' => $storagePath,
                'mime_type' => 'image/png',
                'size_bytes' => strlen($dummyImage),
                'status' => InvestorKycSubmission::STATUS_PENDING,
            ]
        );
    }
}
