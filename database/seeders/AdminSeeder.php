<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use RuntimeException;

class AdminSeeder extends Seeder
{
    public function run(): void
    {
        foreach ($this->accounts() as $account) {
            $this->seedStaff(
                email: $account['email'],
                name: $account['name'],
                password: $account['password'],
                role: $account['role'],
                label: $account['label'],
            );
        }
    }

    /**
     * @return list<array{email: string, name: string, password: mixed, role: string, label: string}>
     */
    private function accounts(): array
    {
        return [
            [
                'email' => (string) env('ADMIN_EMAIL', 'admin@app.pinpointlaunchpad.com'),
                'name' => (string) env('ADMIN_NAME', 'Pinpoint Admin'),
                'password' => env('ADMIN_PASSWORD'),
                'role' => 'superadmin',
                'label' => 'ADMIN_PASSWORD',
            ],
            [
                'email' => (string) env('FOUNDER_ADMIN_EMAIL', 'founder-admin@app.pinpointlaunchpad.com'),
                'name' => (string) env('FOUNDER_ADMIN_NAME', 'Founder Desk Admin'),
                'password' => env('FOUNDER_ADMIN_PASSWORD'),
                'role' => 'analyst',
                'label' => 'FOUNDER_ADMIN_PASSWORD',
            ],
            [
                'email' => (string) env('INVESTOR_ADMIN_EMAIL', 'investor-admin@app.pinpointlaunchpad.com'),
                'name' => (string) env('INVESTOR_ADMIN_NAME', 'Investor Desk Admin'),
                'password' => env('INVESTOR_ADMIN_PASSWORD'),
                'role' => 'investor_relations',
                'label' => 'INVESTOR_ADMIN_PASSWORD',
            ],
            [
                'email' => (string) env('COMPLIANCE_ADMIN_EMAIL', 'compliance@app.pinpointlaunchpad.com'),
                'name' => (string) env('COMPLIANCE_ADMIN_NAME', 'Compliance Admin'),
                'password' => env('COMPLIANCE_ADMIN_PASSWORD'),
                'role' => 'compliance',
                'label' => 'COMPLIANCE_ADMIN_PASSWORD',
            ],
        ];
    }

    private function seedStaff(
        string $email,
        string $name,
        mixed $password,
        string $role,
        string $label,
    ): void {
        if (! filled($password)) {
            throw new RuntimeException("{$label} must be set in .env before running AdminSeeder.");
        }

        if (! in_array($role, ['superadmin', 'analyst', 'compliance', 'investor_relations'], true)) {
            throw new RuntimeException("Invalid role [{$role}] for {$email}.");
        }

        User::updateOrCreate(
            ['email' => $email],
            [
                'name' => $name,
                'password' => $password,
                'role' => $role,
            ]
        );

        $this->command?->info("Seeded {$role}: {$email}");
    }
}
