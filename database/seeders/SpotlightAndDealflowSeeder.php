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

        // -------------------------------------------------------------
        // Startup 1: PayFlow Africa (Published in Spotlight + Granted Data Room)
        // -------------------------------------------------------------
        $payflowFounder = Founder::updateOrCreate(
            ['email' => 'chioma@payflow.africa'],
            [
                'full_name' => 'Chioma Adebayo',
                'company_name' => 'PayFlow Africa',
                'phone' => '+2348012345678',
                'password' => 'password123',
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

        // Verification Badges
        $badges = [
            ['badge_type' => 'legal', 'label' => 'Incorporation & Legal Cleanliness'],
            ['badge_type' => 'financial', 'label' => 'Audited Financials & Revenue'],
            ['badge_type' => 'tech_stack', 'label' => 'SOC2 Compliant Architecture'],
            ['badge_type' => 'unit_economics', 'label' => 'Positive Unit Economics'],
        ];
        foreach ($badges as $badge) {
            VerificationBadge::updateOrCreate(
                ['profile_id' => $payflowProfile->id, 'badge_type' => $badge['badge_type']],
                ['label' => $badge['label'], 'is_verified' => true, 'verified_at' => now()->subDays(10)]
            );
        }

        // Dummy PDF file in local storage for pitch deck
        $deckPath = "founder-documents/{$payflowFounder->id}/payflow_deck.pdf";
        Storage::disk('local')->put($deckPath, '%PDF-1.4 sample content for pitch deck');

        FounderDocument::updateOrCreate(
            ['founder_id' => $payflowFounder->id, 'category' => 'pitch_deck'],
            [
                'visibility' => 'spotlight',
                'original_filename' => 'PayFlow_Series_Seed_Deck.pdf',
                'stored_filename' => 'payflow_deck.pdf',
                'file_path' => $deckPath,
                'file_size' => 2450000,
                'mime_type' => 'application/pdf',
                'extension' => 'pdf',
                'is_reviewed' => true,
                'reviewed_at' => now()->subDays(8),
                'reviewed_by' => $admin?->id,
                'analyst_note' => 'Exceptional pitch deck with clear traction metrics and verified revenue numbers.',
            ]
        );

        // Data Room documents
        FounderDocument::updateOrCreate(
            ['founder_id' => $payflowFounder->id, 'category' => 'cap_table'],
            [
                'visibility' => 'data_room',
                'original_filename' => 'PayFlow_Cap_Table_2026.xlsx',
                'stored_filename' => 'payflow_captable.xlsx',
                'file_path' => $deckPath,
                'file_size' => 120000,
                'mime_type' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                'extension' => 'xlsx',
                'is_reviewed' => true,
                'reviewed_at' => now()->subDays(8),
                'reviewed_by' => $admin?->id,
            ]
        );

        // Spotlight Entry
        SpotlightEntry::updateOrCreate(
            ['profile_id' => $payflowProfile->id],
            [
                'published_at' => now()->subDays(7),
                'published_by' => $admin?->id,
            ]
        );

        // Investor Interest & Data Room Grant
        InvestorInterest::updateOrCreate(
            ['investor_id' => $investor->id, 'profile_id' => $payflowProfile->id],
            [
                'type' => 'data_room_access',
                'status' => 'approved',
                'message' => 'We are reviewing fintech infrastructure deals in West Africa. Requesting full data room access.',
                'reviewed_by_founder' => $payflowFounder->id,
                'reviewed_at' => now()->subDays(5),
            ]
        );

        $grant = InvestorDataRoomGrant::updateOrCreate(
            ['investor_id' => $investor->id, 'profile_id' => $payflowProfile->id],
            [
                'granted_by_founder' => $payflowFounder->id,
                'granted_at' => now()->subDays(5),
                'revoked_at' => null,
            ]
        );

        // -------------------------------------------------------------
        // Startup 2: AgriDrone Robotics (Ready to Publish in Spotlight)
        // -------------------------------------------------------------
        $agriFounder = Founder::updateOrCreate(
            ['email' => 'kofi@agridrone.io'],
            [
                'full_name' => 'Kofi Mensah',
                'company_name' => 'AgriDrone Robotics',
                'phone' => '+233241234567',
                'password' => 'password123',
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
                'is_featured_in_spotlight' => false,
            ]
        );

        $agriDeckPath = "founder-documents/{$agriFounder->id}/agridrone_deck.pdf";
        Storage::disk('local')->put($agriDeckPath, '%PDF-1.4 sample content for agridrone deck');

        FounderDocument::updateOrCreate(
            ['founder_id' => $agriFounder->id, 'category' => 'pitch_deck'],
            [
                'visibility' => 'spotlight',
                'original_filename' => 'AgriDrone_Seed_Deck.pdf',
                'stored_filename' => 'agridrone_deck.pdf',
                'file_path' => $agriDeckPath,
                'file_size' => 3100000,
                'mime_type' => 'application/pdf',
                'extension' => 'pdf',
                'is_reviewed' => true,
                'reviewed_at' => now()->subDays(3),
                'reviewed_by' => $admin?->id,
            ]
        );

        InvestorInterest::updateOrCreate(
            ['investor_id' => $investor->id, 'profile_id' => $agriProfile->id],
            [
                'type' => 'founder_call',
                'status' => 'pending',
                'message' => 'Impressive yield metrics. Would love a 30-minute introductory call to discuss unit economics.',
            ]
        );

        // -------------------------------------------------------------
        // Audit Logs
        // -------------------------------------------------------------
        AuditLog::create([
            'event' => 'spotlight.published',
            'actor_type' => User::class,
            'actor_id' => $admin?->id ?? 1,
            'auditable_type' => SpotlightEntry::class,
            'auditable_id' => $payflowProfile->id,
            'metadata' => ['profile_id' => $payflowProfile->id, 'company' => 'PayFlow Africa'],
            'ip_address' => '127.0.0.1',
        ]);

        AuditLog::create([
            'event' => 'data_room.granted',
            'actor_type' => Founder::class,
            'actor_id' => $payflowFounder->id,
            'auditable_type' => InvestorDataRoomGrant::class,
            'auditable_id' => $grant->id,
            'metadata' => ['profile_id' => $payflowProfile->id, 'investor_id' => $investor->id],
            'ip_address' => '127.0.0.1',
        ]);
    }
}
