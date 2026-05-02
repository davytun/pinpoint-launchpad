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
        Schema::create('investor_access_requests', function (Blueprint $table) {
            $table->id();
            $table->foreignId('profile_id')->constrained('founder_profiles')->cascadeOnDelete();
            $table->string('investor_name');
            $table->string('investor_email');
            $table->string('firm_name')->nullable();
            $table->string('linkedin_url')->nullable();
            $table->text('message')->nullable();
            $table->string('ip_address')->nullable();
            $table->timestamp('notified_founder_at')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('investor_access_requests');
    }
};
