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
        Schema::create('diagnostic_sessions', function (Blueprint $table) {
            $table->id();
            $table->string('email');
            $table->json('answers');
            $table->unsignedTinyInteger('score');
            $table->enum('score_band', ['low', 'mid_low', 'mid_high', 'high']);
            $table->json('pillar_scores');
            $table->timestamp('cooldown_until')->nullable();
            $table->timestamp('completed_at');
            $table->string('ip_address')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('diagnostic_sessions');
    }
};
