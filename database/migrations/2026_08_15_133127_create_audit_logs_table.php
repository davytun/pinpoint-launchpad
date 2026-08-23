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
        Schema::create('audit_logs', function (Blueprint $table): void {
            $table->id();
            $table->string('event')->index();
            $table->string('actor_type')->nullable();
            $table->string('actor_id')->nullable();
            $table->index(['actor_type', 'actor_id']);
            $table->string('auditable_type')->nullable();
            $table->string('auditable_id')->nullable();
            $table->index(['auditable_type', 'auditable_id']);
            $table->json('metadata')->nullable();
            $table->string('ip_address', 45)->nullable();
            $table->text('user_agent')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('audit_logs');
    }
};
