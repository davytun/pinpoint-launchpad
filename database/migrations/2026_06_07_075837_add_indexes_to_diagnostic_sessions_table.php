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
        Schema::table('diagnostic_sessions', function (Blueprint $table) {
            $table->index('email');
            $table->index('completed_at');
            $table->index(['ip_address', 'created_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('diagnostic_sessions', function (Blueprint $table) {
            $table->dropIndex(['email']);
            $table->dropIndex(['completed_at']);
            $table->dropIndex(['ip_address', 'created_at']);
        });
    }
};
