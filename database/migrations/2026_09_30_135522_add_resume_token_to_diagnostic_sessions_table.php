<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('diagnostic_sessions', function (Blueprint $table) {
            $table->string('resume_token', 80)->nullable()->unique()->after('email');
        });

        DB::table('diagnostic_sessions')
            ->whereNull('resume_token')
            ->orderBy('id')
            ->lazy()
            ->each(function (object $row): void {
                DB::table('diagnostic_sessions')->where('id', $row->id)->update([
                    'resume_token' => Str::random(64),
                ]);
            });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('diagnostic_sessions', function (Blueprint $table) {
            $table->dropUnique(['resume_token']);
            $table->dropColumn('resume_token');
        });
    }
};
