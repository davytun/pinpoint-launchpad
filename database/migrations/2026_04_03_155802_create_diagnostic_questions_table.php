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
        Schema::create('diagnostic_questions', function (Blueprint $table) {
            $table->id();
            $table->enum('pillar', ['potential', 'agility', 'risk', 'alignment', 'governance', 'operations', 'need']);
            $table->text('question_text');
            $table->string('sub_text')->nullable();
            $table->unsignedTinyInteger('points');
            $table->unsignedTinyInteger('order');
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('diagnostic_questions');
    }
};
