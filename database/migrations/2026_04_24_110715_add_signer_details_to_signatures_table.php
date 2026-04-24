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
        Schema::table('signatures', function (Blueprint $table) {
            $table->string('signer_full_name')->nullable()->after('signer_email');
            $table->string('signer_company_name')->nullable()->after('signer_full_name');
            $table->boolean('details_confirmed')->default(false)->after('signer_company_name');
        });
    }

    public function down(): void
    {
        Schema::table('signatures', function (Blueprint $table) {
            $table->dropColumn(['signer_full_name', 'signer_company_name', 'details_confirmed']);
        });
    }
};
