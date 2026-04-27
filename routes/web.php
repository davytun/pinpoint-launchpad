<?php

use App\Http\Controllers\Admin\QuestionController as AdminQuestionController;
use App\Http\Controllers\Admin\SettingsController as AdminSettingsController;
use App\Http\Controllers\Admin\WaitlistController as AdminWaitlistController;
use App\Http\Controllers\CheckoutController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\DiagnosticController;
use App\Http\Controllers\Founder\FounderAuthController;
use App\Http\Controllers\Founder\FounderDashboardController;
use App\Http\Controllers\OnboardingController;
use App\Http\Controllers\WaitlistController;

Route::redirect('/', '/waitlist');

Route::middleware(['auth', 'role:admin'])->prefix('admin')->name('admin.')->group(function () {
    Route::get('/waitlist',                        [AdminWaitlistController::class, 'index'])->name('waitlist.index');
    Route::get('/waitlist/export',                 [AdminWaitlistController::class, 'export'])->name('waitlist.export');
    Route::patch('/waitlist/{entry}/convert',      [AdminWaitlistController::class, 'toggleConverted'])->name('waitlist.convert');
    Route::post('/waitlist/{entry}/resend',        [AdminWaitlistController::class, 'resend'])->name('waitlist.resend');
    Route::delete('/waitlist/{entry}',             [AdminWaitlistController::class, 'destroy'])->name('waitlist.destroy');

    Route::prefix('questions')->name('questions.')->group(function () {
        Route::get('/',              [AdminQuestionController::class, 'index'])->name('index');
        Route::get('/{question}/edit', [AdminQuestionController::class, 'edit'])->name('edit');
        Route::patch('/{question}',  [AdminQuestionController::class, 'update'])->name('update');
    });

    Route::get('/settings',   [AdminSettingsController::class, 'index'])->name('settings.index');
    Route::patch('/settings', [AdminSettingsController::class, 'update'])->name('settings.update');
});

Route::get('/waitlist', [WaitlistController::class, 'index'])->name('waitlist.index');
Route::post('/waitlist/founders',  [WaitlistController::class, 'storeFounder'])->name('waitlist.founders.store');
Route::post('/waitlist/investors', [WaitlistController::class, 'storeInvestor'])->name('waitlist.investors.store');

Route::prefix('diagnostic')->name('diagnostic.')->group(function () {
    Route::get('/',              [DiagnosticController::class, 'index'])->name('index');
    Route::post('/submit',       [DiagnosticController::class, 'submit'])->name('submit')->middleware('throttle:10,1');
    Route::get('/email-gate',    [DiagnosticController::class, 'emailGate'])->name('email-gate');
    Route::post('/capture-email', [DiagnosticController::class, 'captureEmail'])->name('capture-email')->middleware('throttle:5,1');
    Route::get('/result',        [DiagnosticController::class, 'result'])->name('result');
    Route::get('/blocked',       [DiagnosticController::class, 'blocked'])->name('blocked');
});

Route::prefix('checkout')->name('checkout.')->group(function () {
    Route::get('/',         [CheckoutController::class, 'index'])->name('index');
    Route::post('/initiate',[CheckoutController::class, 'initiate'])->name('initiate')->middleware('throttle:5,1');
    Route::get('/success',  [CheckoutController::class, 'success'])->name('success');
    Route::get('/cancel',   [CheckoutController::class, 'cancel'])->name('cancel');
});

// Paystack webhook — CSRF excluded in bootstrap/app.php
Route::post('/webhooks/paystack', [CheckoutController::class, 'webhook'])->name('webhooks.paystack');

Route::prefix('onboarding')->name('onboarding.')->group(function () {
    Route::get('/sign',            [OnboardingController::class, 'sign'])           ->name('sign')           ->middleware(['payment.complete', 'throttle:20,1']);
    Route::post('/confirm-details',[OnboardingController::class, 'confirmDetails']) ->name('confirm-details')->middleware(['payment.complete', 'throttle:10,1']);
    Route::get('/complete',        [OnboardingController::class, 'complete'])       ->name('complete')       ->middleware('throttle:30,1');
});

Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard.index')->middleware('signature.complete');

// BoldSign webhook — CSRF excluded in bootstrap/app.php
Route::post('/webhooks/boldsign', [OnboardingController::class, 'webhook'])->name('webhooks.boldsign');

// Founder routes — all under /founder/
Route::prefix('founder')->name('founder.')->group(function () {

    // Public auth routes
    Route::get('/setup',         [FounderAuthController::class, 'showSetup'])->name('setup');
    Route::post('/setup',        [FounderAuthController::class, 'setup'])->name('setup.store')->middleware('throttle:5,1');
    Route::get('/login',         [FounderAuthController::class, 'showLogin'])->name('login');
    Route::post('/login',        [FounderAuthController::class, 'login'])->name('login.store')->middleware('throttle:10,1');
    Route::post('/logout',       [FounderAuthController::class, 'logout'])->name('logout');

    // Password reset
    Route::get('/forgot-password',       [FounderAuthController::class, 'showForgotPassword'])->name('password.request');
    Route::post('/forgot-password',      [FounderAuthController::class, 'sendResetLink'])->name('password.email')->middleware('throttle:3,1');
    Route::get('/reset-password/{token}',[FounderAuthController::class, 'showResetPassword'])->name('password.reset');
    Route::post('/reset-password',       [FounderAuthController::class, 'resetPassword'])->name('password.update')->middleware('throttle:3,1');

    // Protected dashboard routes
    Route::middleware(['auth.founder', 'founder.session'])->group(function () {
        Route::get('/dashboard', [FounderDashboardController::class, 'index'])->name('dashboard');

        Route::get('/documents', function () {
            return inertia('Founder/Documents/Index');
        })->name('documents');

        Route::get('/messages', function () {
            return inertia('Founder/Messages/Index');
        })->name('messages');
    });
});

require __DIR__.'/auth.php';
