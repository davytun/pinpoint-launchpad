<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('founder_profiles', function (Blueprint $table) {
            $table->string('spotlight_one_liner', 120)->nullable()->after('sector');
            $table->text('spotlight_summary')->nullable()->after('spotlight_one_liner');
            $table->boolean('is_featured_in_spotlight')->default(false)->after('spotlight_summary');
        });

        Schema::table('founder_documents', function (Blueprint $table) {
            $table->enum('visibility', ['spotlight', 'data_room', 'internal'])->default('data_room')->after('category');
            $table->index(['founder_id', 'visibility', 'is_reviewed']);
        });

        DB::table('founder_documents')->where('category', 'pitch_deck')->update(['visibility' => 'spotlight']);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('founder_profiles', function (Blueprint $table) {
            $table->dropColumn(['spotlight_one_liner', 'spotlight_summary', 'is_featured_in_spotlight']);
        });

        Schema::table('founder_documents', function (Blueprint $table) {
            $table->dropIndex(['founder_id', 'visibility', 'is_reviewed']);
            $table->dropColumn('visibility');
        });
    }
};
