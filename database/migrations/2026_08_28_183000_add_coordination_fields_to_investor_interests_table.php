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
        Schema::table('investor_interests', function (Blueprint $table) {
            $table->timestamp('scheduled_at')->nullable()->after('reviewed_at');
            $table->timestamp('completed_at')->nullable()->after('scheduled_at');
            $table->string('meeting_link')->nullable()->after('completed_at');
            $table->text('admin_notes')->nullable()->after('meeting_link');
            $table->text('founder_notes')->nullable()->after('admin_notes');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('investor_interests', function (Blueprint $table) {
            $table->dropColumn([
                'scheduled_at',
                'completed_at',
                'meeting_link',
                'admin_notes',
                'founder_notes',
            ]);
        });
    }
};
