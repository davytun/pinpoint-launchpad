<?php

use App\Http\Middleware\HandleInertiaRequests;
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
            'role'               => \App\Http\Middleware\EnsureUserHasRole::class,
            'payment.complete'   => \App\Http\Middleware\EnsurePaymentComplete::class,
            'signature.complete' => \App\Http\Middleware\EnsureSignatureComplete::class,
        ]);

        $middleware->validateCsrfTokens(except: [
            'webhooks/paystack',
            'webhooks/pandadoc',
            'webhooks/boldsign',
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions) {
        //
    })->create();
