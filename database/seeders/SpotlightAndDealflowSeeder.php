<?php

namespace Database\Seeders;

use App\Models\AuditLog;
use App\Models\Founder;
use App\Models\FounderDocument;
use App\Models\FounderProfile;
use App\Models\Investor;
use App\Models\InvestorDataRoomGrant;
use App\Models\InvestorInterest;
use App\Models\SpotlightEntry;
use App\Models\User;
use App\Models\VerificationBadge;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Storage;

class SpotlightAndDealflowSeeder extends Seeder
{
    public function run(): void
    {
        $admin = User::first();
        $investor = Investor::first() ?? Investor::factory()->create([
            'email' => 'davidakintunde433@gmail.com',
            'account_status' => Investor::ACCOUNT_STATUS_ACTIVE,
            'kyc_status' => Investor::KYC_STATUS_APPROVED,
        ]);

        // Helper to generate a valid PDF presentation with readable slides
        $createPitchDeckPdf = function (string $title, string $tagline, string $sector, string $raise, array $highlights) {
            $h1 = $highlights[0] ?? 'High growth metrics';
            $h2 = $highlights[1] ?? 'Massive market TAM';
            $h3 = $highlights[2] ?? 'Exceptional founder pedigree';
            $h4 = $highlights[3] ?? 'Clear path to profitability';

            $streamContent = "BT\n" .
                "/F1 22 Tf\n" .
                "50 720 Td\n" .
                "(" . addcslashes($title, "()") . " - Pitch Deck) Tj\n" .
                "/F1 13 Tf\n" .
                "0 -35 Td\n" .
                "(" . addcslashes($tagline, "()") . ") Tj\n" .
                "0 -25 Td\n" .
                "(Sector: " . addcslashes($sector, "()") . " | Target Raise: " . addcslashes($raise, "()") . ") Tj\n" .
                "0 -40 Td\n" .
                "/F1 15 Tf\n" .
                "(Key Investment Highlights:) Tj\n" .
                "/F1 12 Tf\n" .
                "0 -25 Td\n" .
                "(- 1. " . addcslashes($h1, "()") . ") Tj\n" .
                "0 -22 Td\n" .
                "(- 2. " . addcslashes($h2, "()") . ") Tj\n" .
                "0 -22 Td\n" .
                "(- 3. " . addcslashes($h3, "()") . ") Tj\n" .
                "0 -22 Td\n" .
                "(- 4. " . addcslashes($h4, "()") . ") Tj\n" .
                "0 -45 Td\n" .
                "/F1 10 Tf\n" .
                "(Confidential Document - Pinpoint Venture Launchpad Verified PARAGON Audit) Tj\n" .
                "ET";

            $streamLen = strlen($streamContent);

            return "%PDF-1.4\n" .
                "1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n" .
                "2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n" .
                "3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>\nendobj\n" .
                "4 0 obj\n<< /Length {$streamLen} >>\nstream\n{$streamContent}\nendstream\nendobj\n" .
                "5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>\nendobj\n" .
                "xref\n0 6\n0000000000 65535 f \n0000000009 00000 n \n0000000058 00000 n \n0000000115 00000 n \n0000000244 00000 n \n0000000350 00000 n \n" .
                "trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n450\n%%EOF";
        };

        // -------------------------------------------------------------
        // Startup 1: PayFlow Africa (Published in Spotlight)
        // -------------------------------------------------------------
        $payflowFounder = Founder::updateOrCreate(
            ['email' => 'chioma@payflow.africa'],
            [
                'full_name' => 'Chioma Adebayo',
                'company_name' => 'PayFlow Africa',
                'phone' => '+2348012345678',
                'password' => bcrypt('password123'),
                'email_verified_at' => now(),
            ]
        );

        $payflowProfile = FounderProfile::updateOrCreate(
            ['founder_id' => $payflowFounder->id],
            [
                'slug' => 'payflow-africa',
                'is_public' => true,
                'verified_at' => now()->subDays(14),
                'overall_score' => 92,
                'sector' => 'Fintech / Payments',
                'batch' => 'Cohort 2026-Q1',
                'spotlight_one_liner' => 'Cross-border treasury & real-time liquidity infrastructure for African B2B enterprises.',
                'spotlight_summary' => 'PayFlow powers multi-currency liquidity and automated compliance across 12 African markets, processing over $4M in monthly B2B payment volumes with 40%+ MoM growth.',
                'is_featured_in_spotlight' => true,
            ]
        );

        $badges1 = [
            ['badge_type' => 'legal', 'label' => 'Incorporation & Legal Cleanliness'],
            ['badge_type' => 'financial', 'label' => 'Audited Financials & Revenue'],
            ['badge_type' => 'tech_stack', 'label' => 'SOC2 Compliant Architecture'],
            ['badge_type' => 'unit_economics', 'label' => 'Positive Unit Economics'],
        ];
        foreach ($badges1 as $badge) {
            VerificationBadge::updateOrCreate(
                ['profile_id' => $payflowProfile->id, 'badge_type' => $badge['badge_type']],
                ['label' => $badge['label'], 'is_verified' => true, 'verified_at' => now()->subDays(10)]
            );
        }

        $deckPath1 = "founder-documents/{$payflowFounder->id}/payflow_deck.pdf";
        $pdf1 = $createPitchDeckPdf(
            'PayFlow Africa',
            'Cross-border treasury & real-time liquidity infrastructure',
            'Fintech / Payments',
            '$3.5M Series Seed',
            [
                '$4.2M processed monthly across 12 African corridors',
                '40%+ Compound Monthly Volume Growth with positive net margin',
                'Direct API integration with Tier-1 banking partners',
                'SOC2 Type II certified and regulatory licensed',
            ]
        );
        Storage::disk('local')->put($deckPath1, $pdf1);

        FounderDocument::updateOrCreate(
            ['founder_id' => $payflowFounder->id, 'category' => 'pitch_deck'],
            [
                'visibility' => 'spotlight',
                'original_filename' => 'PayFlow_Series_Seed_Deck.pdf',
                'stored_filename' => 'payflow_deck.pdf',
                'file_path' => $deckPath1,
                'file_size' => strlen($pdf1),
                'mime_type' => 'application/pdf',
                'extension' => 'pdf',
                'is_reviewed' => true,
                'reviewed_at' => now()->subDays(8),
                'reviewed_by' => $admin?->id,
                'analyst_note' => 'Exceptional pitch deck with clear traction metrics and verified revenue numbers.',
            ]
        );

        SpotlightEntry::updateOrCreate(
            ['profile_id' => $payflowProfile->id],
            [
                'published_at' => now()->subDays(7),
                'published_by' => $admin?->id,
            ]
        );

        // -------------------------------------------------------------
        // Startup 2: AgriDrone Robotics (Published in Spotlight)
        // -------------------------------------------------------------
        $agriFounder = Founder::updateOrCreate(
            ['email' => 'kofi@agridrone.io'],
            [
                'full_name' => 'Kofi Mensah',
                'company_name' => 'AgriDrone Robotics',
                'phone' => '+233241234567',
                'password' => bcrypt('password123'),
                'email_verified_at' => now(),
            ]
        );

        $agriProfile = FounderProfile::updateOrCreate(
            ['founder_id' => $agriFounder->id],
            [
                'slug' => 'agridrone-robotics',
                'is_public' => true,
                'verified_at' => now()->subDays(4),
                'overall_score' => 86,
                'sector' => 'Agtech & Robotics',
                'batch' => 'Cohort 2026-Q2',
                'spotlight_one_liner' => 'Autonomous drone fleets for crop health analytics and targeted micro-spraying.',
                'spotlight_summary' => 'AgriDrone reduces crop yield loss by 35% through hyperspectral aerial scouting and automated spraying, currently serving 50,000+ hectares of commercial farmland.',
                'is_featured_in_spotlight' => true,
            ]
        );

        $agriDeckPath = "founder-documents/{$agriFounder->id}/agridrone_deck.pdf";
        $pdf2 = $createPitchDeckPdf(
            'AgriDrone Robotics',
            'Autonomous drone fleets for crop health analytics & micro-spraying',
            'Agtech & Robotics',
            '$1.8M Seed Round',
            [
                '50,000+ hectares under active precision monitoring',
                '35% average reduction in chemical input wastage',
                'Proprietary hyperspectral imaging edge AI models',
                'Backed by leading agritech accelerators and farm syndicates',
            ]
        );
        Storage::disk('local')->put($agriDeckPath, $pdf2);

        FounderDocument::updateOrCreate(
            ['founder_id' => $agriFounder->id, 'category' => 'pitch_deck'],
            [
                'visibility' => 'spotlight',
                'original_filename' => 'AgriDrone_Seed_Deck.pdf',
                'stored_filename' => 'agridrone_deck.pdf',
                'file_path' => $agriDeckPath,
                'file_size' => strlen($pdf2),
                'mime_type' => 'application/pdf',
                'extension' => 'pdf',
                'is_reviewed' => true,
                'reviewed_at' => now()->subDays(3),
                'reviewed_by' => $admin?->id,
            ]
        );

        SpotlightEntry::updateOrCreate(
            ['profile_id' => $agriProfile->id],
            [
                'published_at' => now()->subDays(2),
                'published_by' => $admin?->id,
            ]
        );

        // -------------------------------------------------------------
        // Startup 3: BioLogix Diagnostics (Ready to Publish — Unpublished)
        // -------------------------------------------------------------
        $bioFounder = Founder::updateOrCreate(
            ['email' => 'tariq@biologix.health'],
            [
                'full_name' => 'Dr. Tariq Mansoor',
                'company_name' => 'BioLogix Diagnostics',
                'phone' => '+254711234567',
                'password' => bcrypt('password123'),
                'email_verified_at' => now(),
            ]
        );

        $bioProfile = FounderProfile::updateOrCreate(
            ['founder_id' => $bioFounder->id],
            [
                'slug' => 'biologix-diagnostics',
                'is_public' => true,
                'verified_at' => now()->subDays(2),
                'overall_score' => 89,
                'sector' => 'Healthtech & Biotech',
                'batch' => 'Cohort 2026-Q2',
                'spotlight_one_liner' => 'AI-guided rapid diagnostic test readers delivering lab-grade results in 15 minutes.',
                'spotlight_summary' => 'BioLogix digitizes rapid diagnostic strips with computer vision and clinical-grade accuracy for sub-Saharan healthcare clinics, partnered with 140+ regional clinics.',
                'is_featured_in_spotlight' => false,
            ]
        );

        $bioDeckPath = "founder-documents/{$bioFounder->id}/biologix_deck.pdf";
        $pdf3 = $createPitchDeckPdf(
            'BioLogix Diagnostics',
            'AI-guided rapid diagnostic test readers with lab-grade precision',
            'Healthtech & Biotech',
            '$2.5M Series A',
            [
                '140+ active primary healthcare clinics deployed in East Africa',
                '99.4% diagnostic concordance with standard lab benchmarks',
                'ISO 13485 compliant software medical device workflow',
                'High-margin SaaS + reagent recurring subscription model',
            ]
        );
        Storage::disk('local')->put($bioDeckPath, $pdf3);

        FounderDocument::updateOrCreate(
            ['founder_id' => $bioFounder->id, 'category' => 'pitch_deck'],
            [
                'visibility' => 'spotlight',
                'original_filename' => 'BioLogix_Series_A_Deck.pdf',
                'stored_filename' => 'biologix_deck.pdf',
                'file_path' => $bioDeckPath,
                'file_size' => strlen($pdf3),
                'mime_type' => 'application/pdf',
                'extension' => 'pdf',
                'is_reviewed' => true,
                'reviewed_at' => now()->subDays(1),
                'reviewed_by' => $admin?->id,
            ]
        );

        // -------------------------------------------------------------
        // Startup 4: SolarGrid Nexus (Needs Review / Incomplete)
        // -------------------------------------------------------------
        $solarFounder = Founder::updateOrCreate(
            ['email' => 'amina@solargrid.energy'],
            [
                'full_name' => 'Amina Bello',
                'company_name' => 'SolarGrid Nexus',
                'phone' => '+2348098765432',
                'password' => bcrypt('password123'),
                'email_verified_at' => now(),
            ]
        );

        $solarProfile = FounderProfile::updateOrCreate(
            ['founder_id' => $solarFounder->id],
            [
                'slug' => 'solargrid-nexus',
                'is_public' => true,
                'verified_at' => now()->subDays(1),
                'overall_score' => 78,
                'sector' => 'Cleantech & Energy',
                'batch' => 'Cohort 2026-Q2',
                'spotlight_one_liner' => 'Decentralized mini-grid metering and smart solar power distribution for off-grid communities.',
                'spotlight_summary' => 'Deploying smart micro-grids with IoT prepaid metering in rural commercial hubs.',
                'is_featured_in_spotlight' => false,
            ]
        );

        $solarDeckPath = "founder-documents/{$solarFounder->id}/solargrid_deck.pdf";
        $pdf4 = $createPitchDeckPdf(
            'SolarGrid Nexus',
            'Decentralized mini-grid metering & smart solar distribution',
            'Cleantech & Energy',
            '$1.2M Seed Round',
            [
                '14 operational mini-grids powering 3,200 rural commercial merchants',
                '$380k ARR with 98% on-time digital bill collection rate',
                'Proprietary GSM/LoRa smart prepaid metering hardware',
                '3.2-year asset payback period per localized installation',
            ]
        );
        Storage::disk('local')->put($solarDeckPath, $pdf4);

        FounderDocument::updateOrCreate(
            ['founder_id' => $solarFounder->id, 'category' => 'pitch_deck'],
            [
                'visibility' => 'spotlight',
                'original_filename' => 'SolarGrid_Seed_Draft.pdf',
                'stored_filename' => 'solargrid_deck.pdf',
                'file_path' => $solarDeckPath,
                'file_size' => strlen($pdf4),
                'mime_type' => 'application/pdf',
                'extension' => 'pdf',
                'is_reviewed' => false, // Needs review!
            ]
        );
    }
}
