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
        Schema::create('investor_data_room_grants', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->foreignUlid('investor_id')->constrained('investors')->cascadeOnDelete();
            $table->foreignUlid('profile_id')->constrained('founder_profiles')->cascadeOnDelete();
            $table->foreignUlid('granted_by_founder')->constrained('founders')->cascadeOnDelete();
            $table->timestamp('granted_at');
            $table->timestamp('revoked_at')->nullable();
            $table->timestamps();

            $table->unique(['investor_id', 'profile_id']);
            $table->index(['investor_id', 'revoked_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('investor_data_room_grants');
    }
};
