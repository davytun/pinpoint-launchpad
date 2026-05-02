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
        Schema::create('founder_profiles', function (Blueprint $table) {
            $table->id();
            $table->foreignId('founder_id')->unique()->constrained('founders')->cascadeOnDelete();
            $table->foreignId('payment_id')->nullable()->constrained('payments')->nullOnDelete();
            $table->string('slug')->unique();
            $table->boolean('is_public')->default(false);
            $table->json('radar_data')->nullable();
            $table->unsignedTinyInteger('overall_score')->nullable();
            $table->text('analyst_summary')->nullable();
            $table->string('batch')->nullable();
            $table->string('sector')->nullable();
            $table->timestamp('verified_at')->nullable();
            $table->timestamp('expires_at')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('founder_profiles');
    }
};
