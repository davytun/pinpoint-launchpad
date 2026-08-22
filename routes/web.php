<?php

use App\Http\Controllers\Admin\AdminBlogController;
use App\Http\Controllers\Admin\AdminDashboardController;
use App\Http\Controllers\Admin\AdminDocumentController;
use App\Http\Controllers\Admin\AdminFounderController;
use App\Http\Controllers\Admin\AdminInvestorApplicationController;
use App\Http\Controllers\Admin\AdminMessageController;
use App\Http\Controllers\Admin\AdminProfileController;
use App\Http\Controllers\Admin\AdminUserController;
use App\Http\Controllers\Admin\BlogImageController;
use App\Http\Controllers\Admin\InvestorAccountController;
use App\Http\Controllers\Admin\InvestorKycController as AdminInvestorKycController;
use App\Http\Controllers\Admin\QuestionController as AdminQuestionController;
use App\Http\Controllers\Admin\SettingsController as AdminSettingsController;
use App\Http\Controllers\Admin\SpotlightController as AdminSpotlightController;
use App\Http\Controllers\Admin\WaitlistController as AdminWaitlistController;
use App\Http\Controllers\Auth\AuthenticatedSessionController;
use App\Http\Controllers\BlogController;
use App\Http\Controllers\CheckoutController;
use App\Http\Controllers\ContactController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\DiagnosticController;
use App\Http\Controllers\Founder\FounderAuthController;
use App\Http\Controllers\Founder\FounderDashboardController;
use App\Http\Controllers\Founder\FounderDocumentController;
use App\Http\Controllers\Founder\FounderMessageController;
use App\Http\Controllers\Founder\FounderSpotlightController;
use App\Http\Controllers\Investor\InvestorAuthController;
use App\Http\Controllers\Investor\InvestorDataRoomController;
use App\Http\Controllers\Investor\InvestorInterestController;
use App\Http\Controllers\Investor\InvestorKycController;
use App\Http\Controllers\Investor\InvestorOnboardingController;
use App\Http\Controllers\Investor\InvestorSpotlightController;
use App\Http\Controllers\InvestorController;
use App\Http\Controllers\OnboardingController;
use App\Http\Controllers\VerificationController;
use App\Http\Controllers\WaitlistController;
use App\Models\BlogPost;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

Route::redirect('/waitlist', '/');

// ── Admin routes ───────────────────────────────────────────────────────────────
Route::prefix('admin')->name('admin.')->group(function () {
    Route::get('/login', function () {
        if (Auth::guard('founder')->check()) {
            Auth::guard('founder')->logout();
            session()->invalidate();
            session()->regenerateToken();

            return redirect()->route('admin.login');
        }
        if (Auth::guard('web')->check() && Auth::guard('web')->user()->isAdmin()) {
            return redirect()->route('admin.dashboard');
        }

        return Inertia::render('Admin/Login', [
            'status' => session('status'),
        ]);
    })->name('login');

    Route::post('/login', [AuthenticatedSessionController::class, 'store'])
        ->name('login.store');
});

Route::prefix('admin')->name('admin.')->group(function () {

    // Dashboard — all admin roles
    Route::get('/', [AdminDashboardController::class, 'index'])
        ->middleware('require.role:superadmin,analyst,support')
        ->name('dashboard');

    // Messages — all admin roles
    Route::prefix('messages')->name('messages.')->middleware('require.role:superadmin,analyst,support')->group(function () {
        Route::get('/', [AdminMessageController::class, 'inbox'])->name('inbox');
        Route::get('/attachment/{message}', [AdminMessageController::class, 'downloadAttachment'])->name('attachment.download');
        Route::get('/{thread}', [AdminMessageController::class, 'show'])->name('show');
        Route::post('/{thread}/reply', [AdminMessageController::class, 'reply'])->name('reply')->middleware('throttle:30,1');
    });

    // Waitlist — superadmin + support
    Route::middleware('require.role:superadmin,support')->group(function () {
        Route::get('/waitlist', [AdminWaitlistController::class, 'index'])->name('waitlist.index');
        Route::get('/waitlist/export', [AdminWaitlistController::class, 'export'])->name('waitlist.export');
        Route::patch('/waitlist/{entry}/convert', [AdminWaitlistController::class, 'toggleConverted'])->name('waitlist.convert');
        Route::post('/waitlist/{entry}/resend', [AdminWaitlistController::class, 'resend'])->name('waitlist.resend');
        Route::delete('/waitlist/{entry}', [AdminWaitlistController::class, 'destroy'])->name('waitlist.destroy');

        // Investors
        Route::get('/investors', [AdminInvestorApplicationController::class, 'index'])->name('investors.index');
        Route::get('/investors/{application}', [AdminInvestorApplicationController::class, 'show'])->name('investors.show');
        Route::patch('/investors/{application}/status', [AdminInvestorApplicationController::class, 'updateStatus'])->name('investors.status');
    });

    Route::middleware('require.role:superadmin,compliance,investor_relations')->group(function () {
        Route::get('/investor-accounts', [InvestorAccountController::class, 'index'])->name('investor-accounts.index');
        Route::get('/investor-accounts/{investor}', [InvestorAccountController::class, 'show'])->name('investor-accounts.show');
        Route::patch('/investor-accounts/{investor}', [InvestorAccountController::class, 'update'])->name('investor-accounts.update');
    });

    Route::middleware('require.role:superadmin,investor_relations')->group(function () {
        Route::get('/spotlight', [AdminSpotlightController::class, 'index'])->name('spotlight.index');
        Route::patch('/spotlight/{profile}', [AdminSpotlightController::class, 'update'])->name('spotlight.update');
        Route::get('/dealflow/interests', [App\Http\Controllers\Admin\InvestorInterestController::class, 'index'])->name('dealflow.interests.index');
        Route::get('/dealflow/data-rooms', [App\Http\Controllers\Admin\InvestorDataRoomController::class, 'index'])->name('dealflow.data-rooms.index');
        Route::patch('/dealflow/data-rooms/{grant}/revoke', [App\Http\Controllers\Admin\InvestorDataRoomController::class, 'revoke'])->name('dealflow.data-rooms.revoke');
    });

    // Founders — superadmin + analyst
    Route::middleware('require.role:superadmin,analyst')->group(function () {
        Route::get('/founders', [AdminFounderController::class, 'index'])->name('founders.index');
        Route::get('/founders/{founder}', [AdminFounderController::class, 'show'])->name('founders.show');
        Route::post('/founders/{founder}/assign', [AdminFounderController::class, 'assign'])->middleware('require.role:superadmin')->name('founders.assign');
        Route::patch('/founders/{founder}/audit-status', [AdminFounderController::class, 'updateAuditStatus'])->name('founders.audit-status');

        Route::prefix('founders/{founder}/documents')->name('documents.')->group(function () {
            Route::get('/', [AdminDocumentController::class, 'index'])->name('index');
            Route::get('/{document}/download', [AdminDocumentController::class, 'download'])->name('download');
            Route::patch('/{document}/reviewed', [AdminDocumentController::class, 'markReviewed'])->name('reviewed');
            Route::patch('/{document}/note', [AdminDocumentController::class, 'addNote'])->name('note');
        });

        Route::prefix('profiles')->name('profiles.')->group(function () {
            Route::get('/', [AdminProfileController::class, 'index'])->name('index');
            Route::get('/{profile}', [AdminProfileController::class, 'show'])->name('show');
            Route::patch('/{profile}', [AdminProfileController::class, 'update'])->name('update');
            Route::patch('/badges/{badge}', [AdminProfileController::class, 'updateBadge'])->name('badge.update');
            Route::get('/{profile}/access-requests', [AdminProfileController::class, 'accessRequests'])->name('access-requests');
        });
    });

    // Questions — superadmin + analyst
    Route::prefix('questions')->name('questions.')->middleware('require.role:superadmin,analyst')->group(function () {
        Route::get('/', [AdminQuestionController::class, 'index'])->name('index');
        Route::get('/{question}/edit', [AdminQuestionController::class, 'edit'])->name('edit');
        Route::patch('/{question}', [AdminQuestionController::class, 'update'])->name('update');
    });

    // Settings + Revenue — superadmin only
    Route::middleware('require.role:superadmin')->group(function () {
        Route::get('/settings', [AdminSettingsController::class, 'index'])->name('settings.index');
        Route::patch('/settings', [AdminSettingsController::class, 'update'])->name('settings.update');
        Route::get('/revenue', [AdminDashboardController::class, 'revenue'])->name('revenue');

        // Admin Blog
        Route::prefix('blog')->name('blog.')->group(function () {
            Route::get('/', [AdminBlogController::class, 'index'])->name('index');
            Route::get('/create', [AdminBlogController::class, 'create'])->name('create');
            Route::post('/', [AdminBlogController::class, 'store'])->name('store');
            Route::get('/{post}/edit', [AdminBlogController::class, 'edit'])->name('edit');
            Route::patch('/{post}', [AdminBlogController::class, 'update'])->name('update');
            Route::delete('/{post}', [AdminBlogController::class, 'destroy'])->name('destroy');
            Route::patch('/{post}/toggle', [AdminBlogController::class, 'toggle'])->name('toggle');
            Route::post('/images', [BlogImageController::class, 'store'])->name('images.store');
        });
    });

    // User management — superadmin only
    Route::prefix('users')->name('users.')->middleware('require.role:superadmin')->group(function () {
        Route::get('/', [AdminUserController::class, 'index'])->name('index');
        Route::get('/create', [AdminUserController::class, 'create'])->name('create');
        Route::post('/', [AdminUserController::class, 'store'])->name('store');
        Route::get('/{user}/edit', [AdminUserController::class, 'edit'])->name('edit');
        Route::patch('/{user}', [AdminUserController::class, 'update'])->name('update');
        Route::delete('/{user}', [AdminUserController::class, 'destroy'])->name('destroy');
    });
});

Route::get('/', function () {
    $latestPosts = BlogPost::published()
        ->orderByDesc('published_at')
        ->limit(3)
        ->get()
        ->map(fn ($p) => [
            'title' => $p->title,
            'slug' => $p->slug,
            'excerpt' => $p->excerpt,
            'cover_image' => $p->cover_image,
            'author_name' => $p->author_name,
            'category' => $p->category,
            'reading_time_mins' => $p->reading_time_mins,
            'published_at' => $p->published_at?->format('M j, Y'),
        ]);

    return Inertia::render('Welcome', [
        'latest_posts' => $latestPosts,
    ]);
})->name('waitlist.index');
Route::get('/orbit-demo', function () {
    return Inertia::render('OrbitDemo');
})->name('orbit.demo');
Route::post('/waitlist/founders', [WaitlistController::class, 'storeFounder'])->name('waitlist.founders.store');
Route::post('/waitlist/investors', [WaitlistController::class, 'storeInvestor'])->name('waitlist.investors.store');
Route::post('/contact', [ContactController::class, 'storeContact'])->name('contact.store');
Route::post('/newsletter', [ContactController::class, 'storeNewsletter'])->name('newsletter.store');

// Public Blog
Route::get('/blog', [BlogController::class, 'index'])->name('blog.index');
Route::get('/blog/{post}', [BlogController::class, 'show'])->name('blog.show');

Route::prefix('diagnostic')->name('diagnostic.')->group(function () {
    Route::get('/', [DiagnosticController::class, 'index'])->name('index');
    Route::post('/submit', [DiagnosticController::class, 'submit'])->name('submit')->middleware('throttle:10,1');
    Route::get('/email-gate', [DiagnosticController::class, 'emailGate'])->name('email-gate');
    Route::post('/capture-email', [DiagnosticController::class, 'captureEmail'])->name('capture-email')->middleware('throttle:5,1');
    Route::get('/result', [DiagnosticController::class, 'result'])->name('result');
    Route::get('/result/{id}', [DiagnosticController::class, 'viewById'])->name('view');
    Route::post('/send-checklist', [DiagnosticController::class, 'sendChecklist'])->name('send-checklist')->middleware('throttle:3,5');
    Route::get('/blocked', [DiagnosticController::class, 'blocked'])->name('blocked');
});

Route::get('/assessment', [CheckoutController::class, 'assessment'])->name('assessment');
Route::post('/assessment/apply', [CheckoutController::class, 'applyAssessment'])->name('assessment.apply')->middleware('throttle:5,1');

// Investor onboarding
Route::get('/investor', [InvestorController::class, 'index'])->name('investor.index');
Route::post('/investor/apply', [InvestorController::class, 'store'])->name('investor.apply')->middleware('throttle:5,1');

Route::prefix('investor')->name('investor.')->group(function () {
    Route::get('/onboarding', [InvestorOnboardingController::class, 'create'])->name('onboarding');
    Route::post('/onboarding', [InvestorOnboardingController::class, 'store'])->name('onboarding.store')->middleware('throttle:5,1');
    Route::get('/login', [InvestorAuthController::class, 'showLogin'])->name('login');
    Route::post('/login', [InvestorAuthController::class, 'login'])->name('login.store')->middleware('throttle:10,1');
    Route::post('/logout', [InvestorAuthController::class, 'logout'])->name('logout');
    Route::get('/dashboard', [InvestorAuthController::class, 'dashboard'])->middleware('auth.investor')->name('dashboard');
    Route::get('/kyc', [InvestorKycController::class, 'create'])->middleware('auth.investor')->name('kyc.create');
    Route::post('/kyc', [InvestorKycController::class, 'store'])->middleware('auth.investor')->name('kyc.store');
    Route::get('/spotlight', [InvestorSpotlightController::class, 'index'])->middleware('auth.investor')->name('spotlight.index');
    Route::get('/spotlight/{slug}', [InvestorSpotlightController::class, 'show'])->middleware('auth.investor')->name('spotlight.show');
    Route::get('/spotlight/{slug}/pitch-deck/preview', [InvestorSpotlightController::class, 'previewPitchDeck'])->middleware(['auth.investor', 'kyc.approved', 'signed'])->name('spotlight.pitch-deck.preview');
    Route::get('/spotlight/{slug}/pitch-deck', [InvestorSpotlightController::class, 'downloadPitchDeck'])->middleware(['auth.investor', 'kyc.approved', 'signed'])->name('spotlight.pitch-deck');
    Route::post('/spotlight/{slug}/interest', [InvestorInterestController::class, 'store'])->middleware(['auth.investor', 'kyc.approved'])->name('interests.store');

    Route::get('/interests', [InvestorInterestController::class, 'index'])->middleware('auth.investor')->name('interests.index');

    Route::get('/data-rooms', [InvestorDataRoomController::class, 'index'])->middleware(['auth.investor', 'kyc.approved'])->name('data-rooms.index');
    Route::get('/data-rooms/{slug}', [InvestorDataRoomController::class, 'show'])->middleware(['auth.investor', 'kyc.approved'])->name('data-rooms.show');
    Route::get('/data-rooms/{slug}/document/{document}', [InvestorDataRoomController::class, 'download'])->middleware(['auth.investor', 'kyc.approved', 'signed'])->name('data-rooms.download');
});

Route::prefix('admin')->name('admin.')->middleware('require.role:superadmin,compliance')->group(function () {
    Route::get('/investor-kyc', fn () => redirect()->route('admin.investor-accounts.index', ['kyc_status' => 'pending']))->name('investor-kyc.index');
    Route::get('/investor-kyc/{submission}/preview', [AdminInvestorKycController::class, 'preview'])->name('investor-kyc.preview');
    Route::get('/investor-kyc/{submission}/download', [AdminInvestorKycController::class, 'download'])->name('investor-kyc.download');
    Route::patch('/investor-kyc/{submission}', [AdminInvestorKycController::class, 'review'])->name('investor-kyc.review');
});

Route::get('/terms', function () {
    return Inertia::render('Terms');
})->name('terms');

Route::get('/privacy', function () {
    return Inertia::render('Privacy');
})->name('privacy');

Route::get('/investor-terms', function () {
    return Inertia::render('InvestorTerms');
})->name('investor-terms');

Route::get('/cookies', function () {
    return Inertia::render('CookiesPolicy');
})->name('cookies');

Route::prefix('checkout')->name('checkout.')->group(function () {
    Route::get('/', [CheckoutController::class, 'index'])->name('index');
    Route::post('/initiate', [CheckoutController::class, 'initiate'])->name('initiate')->middleware('throttle:5,1');
    Route::get('/success', [CheckoutController::class, 'success'])->name('success');
    Route::get('/cancel', [CheckoutController::class, 'cancel'])->name('cancel');
});

// Paystack webhook — CSRF excluded in bootstrap/app.php
Route::post('/webhooks/paystack', [CheckoutController::class, 'webhook'])->name('webhooks.paystack');

Route::prefix('onboarding')->name('onboarding.')->group(function () {
    Route::get('/sign', [OnboardingController::class, 'sign'])->name('sign')->middleware(['payment.complete', 'throttle:20,1']);
    Route::get('/confirm-details', fn () => redirect()->route('onboarding.sign'));
    Route::post('/confirm-details', [OnboardingController::class, 'confirmDetails'])->name('confirm-details')->middleware(['payment.complete', 'throttle:10,1']);
    Route::get('/complete', [OnboardingController::class, 'complete'])->name('complete')->middleware('throttle:30,1');
    Route::post('/resend-invite', [OnboardingController::class, 'resendInvite'])->name('resend-invite')->middleware('throttle:3,60');
});

Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard.index')->middleware('signature.complete');

// BoldSign webhook — CSRF excluded in bootstrap/app.php
Route::post('/webhooks/boldsign', [OnboardingController::class, 'webhook'])->name('webhooks.boldsign');

// Founder routes — all under /founder/
Route::prefix('founder')->name('founder.')->group(function () {

    // Public auth routes
    Route::get('/setup', [FounderAuthController::class, 'showSetup'])->name('setup');
    Route::post('/setup', [FounderAuthController::class, 'setup'])->name('setup.store')->middleware('throttle:5,1');
    Route::get('/login', [FounderAuthController::class, 'showLogin'])->name('login');
    Route::post('/login', [FounderAuthController::class, 'login'])->name('login.store')->middleware('throttle:10,1');
    Route::post('/logout', [FounderAuthController::class, 'logout'])->name('logout');

    // Password reset
    Route::get('/forgot-password', [FounderAuthController::class, 'showForgotPassword'])->name('password.request');
    Route::post('/forgot-password', [FounderAuthController::class, 'sendResetLink'])->name('password.email')->middleware('throttle:3,1');
    Route::get('/reset-password/{token}', [FounderAuthController::class, 'showResetPassword'])->name('password.reset');
    Route::post('/reset-password', [FounderAuthController::class, 'resetPassword'])->name('password.update')->middleware('throttle:3,1');

    // Protected dashboard routes
    Route::middleware(['auth.founder', 'founder.session'])->group(function () {
        Route::get('/dashboard', [FounderDashboardController::class, 'index'])->name('dashboard');
        Route::get('/spotlight', [FounderSpotlightController::class, 'edit'])->name('spotlight.edit');
        Route::patch('/spotlight', [FounderSpotlightController::class, 'update'])->name('spotlight.update');

        Route::prefix('documents')->name('documents.')->group(function () {
            Route::get('/', [FounderDocumentController::class, 'index'])->name('index');
            Route::post('/', [FounderDocumentController::class, 'store'])->name('store')->middleware('throttle:10,1');
            Route::get('/{document}/download', [FounderDocumentController::class, 'download'])->name('download');
            Route::delete('/{document}', [FounderDocumentController::class, 'destroy'])->name('destroy');
        });

        Route::prefix('messages')->name('messages.')->group(function () {
            Route::get('/', [FounderMessageController::class, 'index'])->name('index');
            Route::post('/', [FounderMessageController::class, 'store'])->name('store')->middleware('throttle:20,1');
            Route::get('/attachment/{message}', [FounderMessageController::class, 'downloadAttachment'])->name('attachment.download');
        });

        Route::patch('/access-requests/{accessRequest}/status', [FounderDashboardController::class, 'updateRequestStatus'])
            ->name('access-requests.status');
    });
});

// Public verification routes — no auth required
Route::prefix('verify')->name('verify.')->group(function () {
    Route::get('/sample-unicorn', [VerificationController::class, 'sample'])->name('sample');
    Route::get('/{slug}', [VerificationController::class, 'show'])->name('show');
    Route::post('/{slug}/request-access', [VerificationController::class, 'requestAccess'])
        ->name('request-access')
        ->middleware('throttle:3,10');
    Route::get('/{slug}/document/{document}/download', [VerificationController::class, 'downloadDocument'])
        ->name('document.download');
});

// Tester guide PDF — token-protected, no auth required
Route::get('/tester-guide', function () {
    $token = request('token');
    if ($token !== env('TESTER_GUIDE_TOKEN', 'pinpoint-beta-2026')) {
        abort(403);
    }
    $pdf = Pdf::loadView('pdfs.tester-guide')
        ->setPaper('a4', 'portrait');

    return $pdf->download('Pinpoint-Tester-Guide.pdf');
})->name('tester-guide');

require __DIR__.'/auth.php';
