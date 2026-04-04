<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;

class AdminSeeder extends Seeder
{
    public function run(): void
    {
        User::firstOrCreate(
            ['email' => 'admin@app.pinpointlaunchpad.com'],
            [
                'name' => 'Pinpoint Admin',
                'password' => env('ADMIN_PASSWORD', 'changeme123'),
                'role' => 'admin',
            ]
        );
    }
}
