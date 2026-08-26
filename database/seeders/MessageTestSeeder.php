<?php

namespace Database\Seeders;

use App\Models\Founder;
use App\Models\Message;
use App\Models\MessageThread;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Database\Seeder;

class MessageTestSeeder extends Seeder
{
    public function run(): void
    {
        $adminUser = User::first();
        $adminId = $adminUser ? $adminUser->id : 1;

        // Find or create sample founders
        $founder1 = Founder::firstOrCreate(
            ['email' => 'ethan.blake@refero.design'],
            [
                'full_name' => 'Ethan Blake',
                'company_name' => 'Refero Systems',
                'phone' => '+1 (555) 382-9104',
                'password' => bcrypt('password'),
            ]
        );

        $founder2 = Founder::firstOrCreate(
            ['email' => 'connie.perry@apexai.io'],
            [
                'full_name' => 'Connie Perry',
                'company_name' => 'Apex Intelligence',
                'phone' => '+44 7700 900077',
                'password' => bcrypt('password'),
            ]
        );

        $founder3 = Founder::firstOrCreate(
            ['email' => 'marcus.vance@solarispay.com'],
            [
                'full_name' => 'Marcus Vance',
                'company_name' => 'Solaris Pay',
                'phone' => '+1 (415) 889-1230',
                'password' => bcrypt('password'),
            ]
        );

        // Create Thread 1 (Ethan Blake)
        $thread1 = MessageThread::firstOrCreate(
            ['founder_id' => $founder1->id],
            [
                'last_message_at' => Carbon::now()->subMinutes(12),
                'founder_unread_count' => 0,
                'admin_unread_count' => 1,
            ]
        );

        Message::where('thread_id', $thread1->id)->delete();

        Message::create([
            'thread_id' => $thread1->id,
            'sender_type' => 'founder',
            'sender_id' => $founder1->id,
            'body' => "Hi Pinpoint Team, we just finished uploading our updated Q3 financials and diagnostic metrics. Could you review our readiness score for Tier 1 matching?",
            'has_attachment' => false,
            'created_at' => Carbon::now()->subHours(3),
        ]);

        Message::create([
            'thread_id' => $thread1->id,
            'sender_type' => 'admin',
            'sender_id' => $adminId,
            'body' => "Hi Ethan, thanks for sharing. Our analyst team is looking through your unit economics right now. We'll have feedback on the diagnostic audit shortly.",
            'has_attachment' => false,
            'created_at' => Carbon::now()->subHours(2),
        ]);

        Message::create([
            'thread_id' => $thread1->id,
            'sender_type' => 'founder',
            'sender_id' => $founder1->id,
            'body' => "Awesome! I've also attached our latest pitch presentation with the revised customer acquisition cost figures.",
            'has_attachment' => true,
            'attachment_filename' => 'refero_pitch_deck_v3.pdf',
            'attachment_size' => 4528000,
            'created_at' => Carbon::now()->subMinutes(12),
        ]);

        $thread1->update([
            'last_message_at' => Carbon::now()->subMinutes(12),
            'admin_unread_count' => 1,
        ]);

        // Create Thread 2 (Connie Perry)
        $thread2 = MessageThread::firstOrCreate(
            ['founder_id' => $founder2->id],
            [
                'last_message_at' => Carbon::now()->subHours(4),
                'founder_unread_count' => 0,
                'admin_unread_count' => 0,
            ]
        );

        Message::where('thread_id', $thread2->id)->delete();

        Message::create([
            'thread_id' => $thread2->id,
            'sender_type' => 'founder',
            'sender_id' => $founder2->id,
            'body' => "Hello, our cap table has been updated with the latest seed angel notes. Is there anything else required before investor syndication?",
            'has_attachment' => false,
            'created_at' => Carbon::now()->subHours(5),
        ]);

        Message::create([
            'thread_id' => $thread2->id,
            'sender_type' => 'admin',
            'sender_id' => $adminId,
            'body' => "Hi Connie, everything looks in order. Your profile is now live in the investor spotlight section.",
            'has_attachment' => false,
            'created_at' => Carbon::now()->subHours(4),
        ]);

        $thread2->update([
            'last_message_at' => Carbon::now()->subHours(4),
            'admin_unread_count' => 0,
        ]);

        // Create Thread 3 (Marcus Vance)
        $thread3 = MessageThread::firstOrCreate(
            ['founder_id' => $founder3->id],
            [
                'last_message_at' => Carbon::now()->subDays(1),
                'founder_unread_count' => 0,
                'admin_unread_count' => 0,
            ]
        );

        Message::where('thread_id', $thread3->id)->delete();

        Message::create([
            'thread_id' => $thread3->id,
            'sender_type' => 'founder',
            'sender_id' => $founder3->id,
            'body' => "We have surpassed \$50k MRR this month. Can we update our company spotlight profile highlights?",
            'has_attachment' => false,
            'created_at' => Carbon::now()->subDays(1),
        ]);

        $thread3->update([
            'last_message_at' => Carbon::now()->subDays(1),
            'admin_unread_count' => 0,
        ]);
    }
}
