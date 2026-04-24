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
            $table->text('embed_url')->nullable()->after('boldsign_document_id');
            $table->timestamp('embed_url_expires_at')->nullable()->after('embed_url');
        });
    }

    public function down(): void
    {
        Schema::table('signatures', function (Blueprint $table) {
            $table->dropColumn(['embed_url', 'embed_url_expires_at']);
        });
    }
};
