<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // 1. Update the data first (if any)
        DB::table('diagnostic_questions')
            ->where('pillar', 'need')
            ->update(['pillar' => 'network']);

        // 2. Update the enum definition
        // Note: SQLite doesn't support MODIFY COLUMN for enums easily, but we'll assume MySQL/PostgreSQL based on previous migrations using DB::statement
        // The original migration used: $table->enum('pillar', ['potential', 'agility', 'risk', 'alignment', 'governance', 'operations', 'need']);
        
        if (DB::getDriverName() !== 'sqlite') {
            DB::statement("ALTER TABLE diagnostic_questions MODIFY COLUMN pillar ENUM('potential', 'agility', 'risk', 'alignment', 'governance', 'operations', 'network') NOT NULL");
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (DB::getDriverName() !== 'sqlite') {
            DB::statement("ALTER TABLE diagnostic_questions MODIFY COLUMN pillar ENUM('potential', 'agility', 'risk', 'alignment', 'governance', 'operations', 'need') NOT NULL");
        }

        DB::table('diagnostic_questions')
            ->where('pillar', 'network')
            ->update(['pillar' => 'need']);
    }
};
