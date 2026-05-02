<?php

namespace App\Providers;

use App\Models\Payment;
use App\Observers\PaymentObserver;
use App\Services\BoldSignService;
use App\Services\DocumentService;
use App\Services\MessageService;
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
        $this->app->singleton(DocumentService::class);
        $this->app->singleton(MessageService::class);
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Payment::observe(PaymentObserver::class);

        Schema::defaultStringLength(191);

        if (str_starts_with(config('app.url'), 'https://')) {
            URL::forceScheme('https');
        }
    }
}
