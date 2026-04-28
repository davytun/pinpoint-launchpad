<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('messages', function (Blueprint $table) {
            $table->id();
            $table->foreignId('thread_id')->constrained('message_threads')->cascadeOnDelete();
            $table->enum('sender_type', ['founder', 'admin']);
            $table->unsignedBigInteger('sender_id');
            $table->text('body')->nullable();
            $table->boolean('has_attachment')->default(false);
            $table->string('attachment_filename')->nullable();
            $table->string('attachment_stored_name')->nullable();
            $table->string('attachment_path')->nullable();
            $table->string('attachment_mime_type')->nullable();
            $table->unsignedBigInteger('attachment_size')->nullable();
            $table->boolean('is_deleted')->default(false);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('messages');
    }
};
