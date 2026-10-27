<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * An investor can pursue multiple engagement types (data room, founder call,
     * question) on the same venture. Replace the one-interest-per-startup
     * constraint with one-interest-per-engagement-type.
     *
     * The new index is added before the old one is dropped: on MySQL the
     * investor_id foreign key relies on a leftmost-prefix index, so the
     * replacement (which also leads with investor_id) must exist first.
     */
    public function up(): void
    {
        Schema::table('investor_interests', function (Blueprint $table) {
            $table->unique(['investor_id', 'profile_id', 'type'], 'investor_interests_investor_profile_type_unique');
        });

        Schema::table('investor_interests', function (Blueprint $table) {
            $table->dropUnique('investor_interests_investor_id_profile_id_unique');
        });
    }

    public function down(): void
    {
        Schema::table('investor_interests', function (Blueprint $table) {
            $table->unique(['investor_id', 'profile_id'], 'investor_interests_investor_id_profile_id_unique');
        });

        Schema::table('investor_interests', function (Blueprint $table) {
            $table->dropUnique('investor_interests_investor_profile_type_unique');
        });
    }
};
