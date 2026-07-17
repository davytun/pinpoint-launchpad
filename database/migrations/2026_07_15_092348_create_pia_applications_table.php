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
        Schema::create('pia_applications', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('email');
            $table->string('company');
            $table->string('country');
            $table->string('stage');          // concept | seed | growth
            $table->string('raise_target');   // e.g. "$100k–$500k"
            $table->text('message')->nullable();
            $table->string('status')->default('pending'); // pending | contacted | converted
            $table->string('source')->default('assessment_page'); // track origin
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('pia_applications');
    }
};
