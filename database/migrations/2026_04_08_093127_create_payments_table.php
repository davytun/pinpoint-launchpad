<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('payments', function (Blueprint $table) {
            $table->id();
            // restrictOnDelete preserves payment records as financial audit trail
            $table->foreignId('user_id')->nullable()->constrained()->restrictOnDelete();
            $table->foreignId('diagnostic_session_id')->nullable()->constrained()->restrictOnDelete();
            // nullable: record is created before Paystack returns a reference
            $table->string('paystack_reference')->nullable()->unique();
            $table->string('paystack_access_code')->nullable();
            $table->enum('tier', ['foundation', 'growth', 'institutional']);
            // Amounts stored in USD dollars (not cents) as unsigned integers
            $table->unsignedInteger('tier_base_amount');
            $table->unsignedInteger('gate_fee')->default(150);
            // total_amount must equal tier_base_amount + gate_fee (enforced at application layer)
            $table->unsignedInteger('total_amount');
            $table->string('currency', 10)->default('usd');
            $table->enum('status', ['pending', 'paid', 'failed', 'refunded'])->default('pending');
            $table->enum('audit_status', ['pending', 'in_progress', 'complete'])->default('pending');
            $table->string('customer_email');
            $table->timestamp('paid_at')->nullable();
            $table->timestamps();

            // Indexes for common query patterns
            $table->index('status');
            $table->index('audit_status');
            $table->index('paid_at');
            $table->index('customer_email');
            $table->index(['user_id', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('payments');
    }
};
