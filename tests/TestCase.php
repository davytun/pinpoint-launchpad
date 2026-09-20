<?php

namespace Tests;

use App\Models\Founder;
use App\Models\Investor;
use App\Models\User;
use Illuminate\Contracts\Auth\Authenticatable as UserContract;
use Illuminate\Foundation\Http\Middleware\ValidateCsrfToken;
use Illuminate\Foundation\Testing\TestCase as BaseTestCase;

abstract class TestCase extends BaseTestCase
{
    protected function setUp(): void
    {
        parent::setUp();

        // Disable CSRF token validation for all HTTP tests
        $this->withoutMiddleware(ValidateCsrfToken::class);

        // Avoid requiring a fresh Vite build for every newly added Inertia page
        $this->withoutVite();
    }

    /**
     * Bind each actor to their real guard so multi-guard suites do not
     * accidentally authenticate staff on founder/investor after shouldUse().
     */
    public function actingAs(UserContract $user, $guard = null)
    {
        if ($guard === null) {
            $guard = match (true) {
                $user instanceof User => 'web',
                $user instanceof Investor => 'investor',
                $user instanceof Founder => 'founder',
                default => null,
            };
        }

        return parent::actingAs($user, $guard);
    }
}
