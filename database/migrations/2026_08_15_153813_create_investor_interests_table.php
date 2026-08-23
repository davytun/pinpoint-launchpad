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
        Schema::create('investor_interests', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->foreignUlid('investor_id')->constrained('investors')->cascadeOnDelete();
            $table->foreignUlid('profile_id')->constrained('founder_profiles')->cascadeOnDelete();
            $table->enum('type', ['more_details', 'founder_call', 'data_room_access']);
            $table->text('message')->nullable();
            $table->enum('status', ['pending', 'approved', 'denied'])->default('pending');
            $table->foreignUlid('reviewed_by_founder')->nullable()->constrained('founders')->nullOnDelete();
            $table->timestamp('reviewed_at')->nullable();
            $table->timestamps();

            $table->unique(['investor_id', 'profile_id']);
            $table->index(['profile_id', 'status']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('investor_interests');
    }
};
