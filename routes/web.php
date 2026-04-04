<?php

use App\Http\Controllers\Admin\QuestionController as AdminQuestionController;
use App\Http\Controllers\Admin\SettingsController as AdminSettingsController;
use App\Http\Controllers\Admin\WaitlistController as AdminWaitlistController;
use App\Http\Controllers\DiagnosticController;
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
    Route::post('/submit',       [DiagnosticController::class, 'submit'])->name('submit');
    Route::get('/email-gate',    [DiagnosticController::class, 'emailGate'])->name('email-gate');
    Route::post('/capture-email', [DiagnosticController::class, 'captureEmail'])->name('capture-email');
    Route::get('/result',        [DiagnosticController::class, 'result'])->name('result');
    Route::get('/blocked',       [DiagnosticController::class, 'blocked'])->name('blocked');
});

require __DIR__.'/auth.php';
