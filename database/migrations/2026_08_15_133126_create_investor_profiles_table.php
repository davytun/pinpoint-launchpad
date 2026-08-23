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
        Schema::create('investor_profiles', function (Blueprint $table): void {
            $table->id();
            $table->foreignUlid('investor_id')->unique()->constrained('investors')->cascadeOnDelete();
            $table->enum('investor_type', ['individual', 'corporate']);
            $table->string('full_name');
            $table->string('company_name')->nullable();
            $table->string('phone', 40);
            $table->text('address');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('investor_profiles');
    }
};
