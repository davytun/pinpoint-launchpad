<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('signatures', function (Blueprint $table) {
            $table->id();
            $table->foreignId('payment_id')->constrained()->cascadeOnDelete();
            $table->foreignId('diagnostic_session_id')->nullable()->constrained()->nullOnDelete();
            $table->string('boldsign_document_id')->unique();
            $table->string('boldsign_template_id');
            $table->enum('status', ['pending', 'sent', 'signed', 'declined', 'revoked'])->default('pending');
            $table->string('signer_email');
            $table->string('signer_name')->nullable();
            $table->timestamp('signed_at')->nullable();
            $table->json('metadata')->nullable();
            $table->timestamps();

            $table->index('signer_email');
            $table->index('status');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('signatures');
    }
};
