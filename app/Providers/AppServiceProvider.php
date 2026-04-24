<?php

namespace App\Providers;

use App\Services\BoldSignService;
use App\Services\PaystackService;
use App\Services\ScoringService;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\URL;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->app->singleton(ScoringService::class);
        $this->app->singleton(PaystackService::class);
        $this->app->singleton(BoldSignService::class);
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Schema::defaultStringLength(191);

        // Force HTTPS when APP_URL is https (e.g. behind ngrok or a load balancer)
        if (str_starts_with(config('app.url'), 'https://')) {
            URL::forceScheme('https');
        }
    }
}
