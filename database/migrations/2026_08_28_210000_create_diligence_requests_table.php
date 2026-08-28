<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('diligence_requests', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->foreignUlid('investor_id')->constrained('investors')->cascadeOnDelete();
            $table->foreignUlid('profile_id')->constrained('founder_profiles')->cascadeOnDelete();
            $table->foreignUlid('interest_id')->nullable()->constrained('investor_interests')->nullOnDelete();
            $table->string('category')->default('general_clarification'); // financial, operational, legal_governance, product_market, document_request, general_clarification
            $table->string('subject');
            $table->text('request_details');
            $table->string('status')->default('submitted'); // submitted, under_review, waiting_for_founder, founder_responded, resolved, declined
            $table->text('admin_instructions_for_founder')->nullable();
            $table->text('founder_notes_to_admin')->nullable();
            $table->timestamp('founder_responded_at')->nullable();
            $table->text('investor_visible_response')->nullable();
            $table->text('admin_notes')->nullable();
            $table->boolean('data_room_required')->default(false);
            $table->timestamp('resolved_at')->nullable();
            $table->timestamps();

            $table->index(['investor_id', 'profile_id']);
            $table->index('status');
            $table->index('category');
        });

        Schema::table('investor_interests', function (Blueprint $table) {
            $table->string('deal_stage')->nullable()->after('completed_at'); // introduction, diligence, active_discussion, advanced_discussion, passed, closed
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('investor_interests', function (Blueprint $table) {
            $table->dropColumn('deal_stage');
        });

        Schema::dropIfExists('diligence_requests');
    }
};
