<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('payment_logs', function (Blueprint $table) {
            $table->id();
            // nullOnDelete: sets payment_id to NULL when parent payment is deleted,
            // preserving audit log rows for compliance/auditability
            $table->foreignId('payment_id')->nullable()->constrained()->nullOnDelete();
            $table->string('event');
            $table->json('metadata')->nullable();
            $table->string('ip_address')->nullable();
            $table->timestamp('created_at')->useCurrent();

            $table->index('payment_id');
            $table->index('created_at');
            $table->index('event');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('payment_logs');
    }
};
