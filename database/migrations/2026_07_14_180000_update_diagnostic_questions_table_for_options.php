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
        Schema::table('diagnostic_questions', function (Blueprint $table) {
            $table->json('options')->nullable()->after('sub_text');
            $table->string('strand')->nullable()->after('options');
            $table->dropColumn('points');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('diagnostic_questions', function (Blueprint $table) {
            $table->unsignedTinyInteger('points')->default(10)->after('sub_text');
            $table->dropColumn(['options', 'strand']);
        });
    }
};
