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
        Schema::create('investor_applications', function (Blueprint $table) {
            $table->id();
            $table->string('investor_type'); // angel, vc, family_office, syndicate, dfi, corporate
            $table->string('name');
            $table->string('email');
            $table->string('organisation')->nullable();
            $table->string('role')->nullable();
            $table->string('country');
            $table->string('website')->nullable();
            
            // Mandate details (JSON arrays & strings)
            $table->json('stages')->nullable();
            $table->json('sectors')->nullable();
            $table->json('geographies')->nullable();
            $table->string('cheque_size')->nullable();
            $table->string('instrument')->nullable();
            $table->string('deals_per_year')->nullable();
            $table->string('fund_detail')->nullable();
            $table->text('thesis_notes')->nullable();

            // Status and confirmations
            $table->string('status')->default('pending'); // pending, approved, rejected, request_more_info
            $table->json('confirmations')->nullable();
            $table->timestamp('submitted_at')->nullable();

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('investor_applications');
    }
};
