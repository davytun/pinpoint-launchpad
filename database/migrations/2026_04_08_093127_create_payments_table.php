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
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('diagnostic_session_id')->nullable()->constrained()->nullOnDelete();
            $table->string('paystack_reference')->unique();
            $table->string('paystack_access_code')->nullable();
            $table->enum('tier', ['foundation', 'growth', 'institutional']);
            $table->unsignedInteger('tier_base_amount');
            $table->unsignedInteger('gate_fee')->default(150);
            $table->unsignedInteger('total_amount');
            $table->string('currency')->default('usd');
            $table->enum('status', ['pending', 'paid', 'failed', 'refunded'])->default('pending');
            $table->enum('audit_status', ['pending', 'in_progress', 'complete'])->default('pending');
            $table->string('customer_email');
            $table->timestamp('paid_at')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('payments');
    }
};
