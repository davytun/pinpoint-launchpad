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
            $table->string('company_name')->nullable()->after('email');
            $table->string('country')->nullable()->after('company_name');
            $table->string('sector')->nullable()->after('country');
            $table->string('growth_stage')->nullable()->after('sector');
            $table->string('describe_you')->nullable()->after('growth_stage');
            $table->string('looking_to_raise')->nullable()->after('describe_you');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('diagnostic_sessions', function (Blueprint $table) {
            $table->dropColumn([
                'company_name',
                'country',
                'sector',
                'growth_stage',
                'describe_you',
                'looking_to_raise',
            ]);
        });
    }
};
