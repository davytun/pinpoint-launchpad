<?php

use App\Http\Middleware\EnsureAdminSide;
use App\Http\Middleware\EnsureFounderAuthenticated;
use App\Http\Middleware\EnsureInvestorAuthenticated;
use App\Http\Middleware\EnsureInvestorKycApproved;
use App\Http\Middleware\EnsurePaymentComplete;
use App\Http\Middleware\EnsureSignatureComplete;
use App\Http\Middleware\EnsureUserHasRole;
use App\Http\Middleware\FounderSessionTimeout;
use App\Http\Middleware\HandleInertiaRequests;
use App\Http\Middleware\RequireRole;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Exceptions\ThrottleRequestsException;
use Illuminate\Http\Middleware\AddLinkHeadersForPreloadedAssets;
use Illuminate\Session\TokenMismatchException;
use Inertia\Inertia;
use Symfony\Component\HttpKernel\Exception\HttpException;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware) {
        $middleware->trustProxies(at: '*');

        $middleware->web(append: [
            HandleInertiaRequests::class,
            AddLinkHeadersForPreloadedAssets::class,
        ]);

        $middleware->alias([
            'role' => EnsureUserHasRole::class,
            'require.role' => RequireRole::class,
            'admin.side' => EnsureAdminSide::class,
            'payment.complete' => EnsurePaymentComplete::class,
            'signature.complete' => EnsureSignatureComplete::class,
            'auth.founder' => EnsureFounderAuthenticated::class,
            'auth.investor' => EnsureInvestorAuthenticated::class,
            'kyc.approved' => EnsureInvestorKycApproved::class,
            'founder.session' => FounderSessionTimeout::class,
        ]);

        $middleware->validateCsrfTokens(except: [
            'webhooks/paystack', // legacy Paystack callbacks (offline PIA is the happy path)
            'webhooks/boldsign',
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions) {
        $render = function (int $status, array $data, $request) {
            if ($request->expectsJson()) {
                return response()->json($data, $status);
            }

            return Inertia::render('Error', $data)
                ->toResponse($request)
                ->setStatusCode($status);
        };

        $exceptions->render(function (ThrottleRequestsException $e, $request) use ($render) {
            return $render(429, [
                'status' => 429,
                'title' => "You're going a little too fast",
                'message' => 'Please wait about a minute before trying again. Nothing has been lost just pick up where you left off.',
            ], $request);
        });

        $exceptions->render(function (TokenMismatchException $e, $request) use ($render) {
            return $render(419, [
                'status' => 419,
                'title' => 'Your session has expired',
                'message' => 'For your security we signed you out after a period of inactivity. Refresh and try again — your details are safe.',
                'primaryLabel' => 'Refresh and continue',
                'primaryHref' => url()->previous() ?: '/',
            ], $request);
        });

        $exceptions->render(function (NotFoundHttpException $e, $request) use ($render) {
            return $render(404, [
                'status' => 404,
                'title' => "We couldn't find that page",
                'message' => 'The link may be broken, or the page may have moved. Head back to keep going.',
            ], $request);
        });

        $exceptions->render(function (AuthorizationException $e, $request) use ($render) {
            return $render(403, [
                'status' => 403,
                'title' => "You don't have access to this",
                'message' => 'This area is restricted. If you believe you should have access, reach out to the Pinpoint team.',
            ], $request);
        });

        // Catch-all for other HTTP errors. In local/ debug mode, leave 5xx to
        // Laravel so developers still get the stack trace.
        $exceptions->render(function (HttpException $e, $request) use ($render) {
            $status = $e->getStatusCode();

            if ($status >= 500 && config('app.debug')) {
                return null;
            }

            return $render($status, [
                'status' => $status,
                'title' => $status >= 500 ? 'Something went wrong on our end' : 'Access unavailable',
                'message' => $status >= 500
                    ? "We've been notified and are looking into it. Please try again in a moment."
                    : 'This page is temporarily unavailable. Please try again shortly.',
            ], $request);
        });
    })->create();
