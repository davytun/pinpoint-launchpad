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
        Schema::create('waitlist_entries', function (Blueprint $table) {
            $table->id();
            $table->enum('type', ['founder', 'investor']);
            $table->string('name', 100);
            $table->string('email', 150)->unique();
            $table->string('company_name', 150)->nullable();
            $table->string('firm_name', 150)->nullable();
            $table->enum('stage', ['idea', 'pre-revenue', 'revenue', 'scaling'])->nullable();
            $table->enum('role', ['angel', 'micro-vc', 'institutional-vc', 'family-office', 'other'])->nullable();
            $table->timestamp('email_sent_at')->nullable();
            $table->timestamp('converted_at')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('waitlist_entries');
    }
};
