<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('payments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained()->restrictOnDelete();
            $table->foreignId('diagnostic_session_id')->nullable()->constrained()->restrictOnDelete();
            $table->string('paystack_reference')->nullable()->unique();
            $table->string('paystack_access_code')->nullable();
            $table->enum('tier', ['foundation', 'growth', 'institutional']);
            $table->unsignedInteger('tier_base_amount');
            $table->unsignedInteger('total_amount');
            $table->string('currency', 10)->default('usd');
            $table->enum('status', ['pending', 'paid', 'failed', 'refunded'])->default('pending');
            $table->enum('audit_status', ['pending', 'in_progress', 'complete'])->default('pending');
            $table->string('customer_email');
            $table->timestamp('paid_at')->nullable();
            $table->timestamps();

            $table->index('status');
            $table->index('audit_status');
            $table->index('paid_at');
            $table->index('customer_email');
            $table->index(['user_id', 'status']);
        });

        if (DB::getDriverName() === 'mysql') {
            DB::statement('ALTER TABLE payments ADD CONSTRAINT chk_payments_owner
                CHECK (user_id IS NOT NULL OR diagnostic_session_id IS NOT NULL)');
        }
    }

    public function down(): void
    {
        if (DB::getDriverName() === 'mysql') {
            DB::statement('ALTER TABLE payments DROP CONSTRAINT IF EXISTS chk_payments_owner');
        }
        Schema::dropIfExists('payments');
    }
};
