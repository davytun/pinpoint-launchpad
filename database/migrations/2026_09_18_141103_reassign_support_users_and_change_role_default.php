<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Retire operable `support` staff: reassign to analyst and stop defaulting new rows to support.
     * The ENUM value remains for historical rows until a later hard drop.
     */
    public function up(): void
    {
        DB::table('users')->where('role', 'support')->update(['role' => 'analyst']);

        if (DB::getDriverName() === 'mysql') {
            DB::statement("ALTER TABLE users MODIFY COLUMN role ENUM('superadmin','analyst','support','compliance','investor_relations') NOT NULL DEFAULT 'analyst'");
        }
    }

    public function down(): void
    {
        if (DB::getDriverName() === 'mysql') {
            DB::statement("ALTER TABLE users MODIFY COLUMN role ENUM('superadmin','analyst','support','compliance','investor_relations') NOT NULL DEFAULT 'support'");
        }
    }
};
