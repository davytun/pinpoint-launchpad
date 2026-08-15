<?php

use App\Http\Middleware\EnsureFounderAuthenticated;
use App\Http\Middleware\EnsureInvestorAuthenticated;
use App\Http\Middleware\EnsurePaymentComplete;
use App\Http\Middleware\EnsureSignatureComplete;
use App\Http\Middleware\EnsureUserHasRole;
use App\Http\Middleware\FounderSessionTimeout;
use App\Http\Middleware\HandleInertiaRequests;
use App\Http\Middleware\RequireRole;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Middleware\AddLinkHeadersForPreloadedAssets;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware) {
        $middleware->web(append: [
            HandleInertiaRequests::class,
            AddLinkHeadersForPreloadedAssets::class,
        ]);

        $middleware->alias([
            'role' => EnsureUserHasRole::class,
            'require.role' => RequireRole::class,
            'payment.complete' => EnsurePaymentComplete::class,
            'signature.complete' => EnsureSignatureComplete::class,
            'auth.founder' => EnsureFounderAuthenticated::class,
            'auth.investor' => EnsureInvestorAuthenticated::class,
            'founder.session' => FounderSessionTimeout::class,
        ]);

        $middleware->validateCsrfTokens(except: [
            'webhooks/paystack',
            'webhooks/pandadoc',
            'webhooks/boldsign',
            'diagnostic/submit',
            'diagnostic/capture-email',
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions) {
        //
    })->create();
