<?php

use App\Http\Controllers\Admin\AdminBlogController;
use App\Http\Controllers\Admin\AdminDashboardController;
use App\Http\Controllers\Admin\AdminDocumentController;
use App\Http\Controllers\Admin\AdminFounderController;
use App\Http\Controllers\Admin\AdminMessageController;
use App\Http\Controllers\Admin\AdminProfileController;
use App\Http\Controllers\Admin\AdminUserController;
use App\Http\Controllers\Admin\AssessmentApplicationController;
use App\Http\Controllers\Admin\BlogImageController;
use App\Http\Controllers\Admin\DiligenceRequestController;
use App\Http\Controllers\Admin\InvestorAccountController;
use App\Http\Controllers\Admin\InvestorKycController as AdminInvestorKycController;
use App\Http\Controllers\Admin\NotificationController;
use App\Http\Controllers\Admin\PiaApplicationController;
use App\Http\Controllers\Admin\PlatformAnnouncementController;
use App\Http\Controllers\Admin\QuestionController as AdminQuestionController;
use App\Http\Controllers\Admin\SettingsController as AdminSettingsController;
use App\Http\Controllers\Admin\SpotlightController as AdminSpotlightController;
use App\Http\Controllers\Auth\AuthenticatedSessionController;
use App\Http\Controllers\BlogController;
use App\Http\Controllers\CheckoutController;
use App\Http\Controllers\ContactController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\DiagnosticController;
use App\Http\Controllers\Founder\FounderAuthController;
use App\Http\Controllers\Founder\FounderDashboardController;
use App\Http\Controllers\Founder\FounderDiligenceController;
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
use App\Http\Controllers\Seo\LlmsTxtController;
use App\Http\Controllers\Seo\RobotsController;
use App\Http\Controllers\Seo\SitemapController;
use App\Http\Controllers\VerificationController;
use App\Models\BlogPost;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

Route::get('/robots.txt', RobotsController::class)->name('robots');
Route::get('/sitemap.xml', SitemapController::class)->name('sitemap');
Route::get('/llms.txt', LlmsTxtController::class)->name('llms');

// ── Admin routes ───────────────────────────────────────────────────────────────
Route::prefix('admin')->name('admin.')->group(function () {
    Route::get('/login', function () {
        if (Auth::guard('founder')->check()) {
            Auth::guard('founder')->logout();
            session()->invalidate();
            session()->regenerateToken();

            return redirect()->route('admin.login');
        }
        if (Auth::guard('web')->check() && Auth::guard('web')->user()->canOperateAdmin()) {
            return redirect()->to(Auth::guard('web')->user()->defaultAdminHomeRoute());
        }

        return Inertia::render('Admin/Login', [
            'status' => session('status'),
        ]);
    })->name('login');

    Route::post('/login', [AuthenticatedSessionController::class, 'store'])
        ->name('login.store');
});

Route::prefix('admin')->name('admin.')->group(function () {

    // Platform dashboard — superadmin only (wrong-desk staff redirected by admin.side)
    Route::get('/', [AdminDashboardController::class, 'index'])
        ->middleware(['admin.side:central', 'require.role:superadmin'])
        ->name('dashboard');

    Route::middleware('require.role:superadmin,analyst,compliance,investor_relations')->group(function () {
        Route::get('/notifications', [NotificationController::class, 'index'])->name('notifications.index');
        Route::patch('/notifications/read-all', [NotificationController::class, 'readAll'])->name('notifications.read-all');
        Route::patch('/notifications/{notification}/read', [NotificationController::class, 'read'])->name('notifications.read');
    });

    // Platform — PIA, settings, revenue, blog, team
    Route::middleware(['require.role:superadmin', 'admin.side:central'])->group(function () {
        Route::get('/pia-requests', [PiaApplicationController::class, 'index'])->name('pia-requests.index');
        Route::patch('/pia-requests/{application}/contacted', [PiaApplicationController::class, 'markContacted'])->name('pia-requests.contacted');
        Route::patch('/pia-requests/{application}/tier', [PiaApplicationController::class, 'updateTier'])->name('pia-requests.tier');
        Route::post('/pia-requests/{application}/payment-received', [PiaApplicationController::class, 'confirmPaymentReceived'])->name('pia-requests.payment-received');
        Route::post('/pia-requests/{application}/resend-agreement', [PiaApplicationController::class, 'resendAgreement'])->name('pia-requests.resend-agreement');

        Route::get('/assessments', [AssessmentApplicationController::class, 'index'])->name('assessments.index');
        Route::patch('/assessments/{application}/review', [AssessmentApplicationController::class, 'markInReview'])->name('assessments.review');
        Route::patch('/assessments/{application}/scope-sent', [AssessmentApplicationController::class, 'markScopeSent'])->name('assessments.scope-sent');

        Route::get('/settings', [AdminSettingsController::class, 'index'])->name('settings.index');
        Route::patch('/settings', [AdminSettingsController::class, 'update'])->name('settings.update');
        Route::get('/revenue', [AdminDashboardController::class, 'revenue'])->name('revenue');

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

        Route::prefix('users')->name('users.')->group(function () {
            Route::get('/', [AdminUserController::class, 'index'])->name('index');
            Route::get('/create', [AdminUserController::class, 'create'])->name('create');
            Route::post('/', [AdminUserController::class, 'store'])->name('store');
            Route::get('/{user}/edit', [AdminUserController::class, 'edit'])->name('edit');
            Route::patch('/{user}', [AdminUserController::class, 'update'])->name('update');
            Route::delete('/{user}', [AdminUserController::class, 'destroy'])->name('destroy');
        });
    });

    // Founder desk
    Route::prefix('founder')->middleware('admin.side:founder')->group(function () {
        Route::get('/', [AdminDashboardController::class, 'founder'])
            ->middleware('require.role:superadmin,analyst')
            ->name('founder.dashboard');

        Route::prefix('messages')->name('messages.')->middleware('require.role:superadmin,analyst')->group(function () {
            Route::get('/', [AdminMessageController::class, 'inbox'])->name('inbox');
            Route::get('/attachment/{message}', [AdminMessageController::class, 'downloadAttachment'])->name('attachment.download');
            Route::get('/{thread}', [AdminMessageController::class, 'show'])->name('show');
            Route::post('/{thread}/reply', [AdminMessageController::class, 'reply'])->name('reply')->middleware('throttle:30,1');
        });

        Route::middleware('require.role:superadmin,analyst')->group(function () {
            // Offline PIA payment requests — founder money path lives on this desk
            Route::get('/pia-requests', [PiaApplicationController::class, 'index'])->name('founder.pia-requests.index');
            Route::patch('/pia-requests/{application}/contacted', [PiaApplicationController::class, 'markContacted'])->name('founder.pia-requests.contacted');
            Route::patch('/pia-requests/{application}/tier', [PiaApplicationController::class, 'updateTier'])->name('founder.pia-requests.tier');
            Route::post('/pia-requests/{application}/payment-received', [PiaApplicationController::class, 'confirmPaymentReceived'])
                ->name('founder.pia-requests.payment-received');
            Route::post('/pia-requests/{application}/resend-agreement', [PiaApplicationController::class, 'resendAgreement'])
                ->name('founder.pia-requests.resend-agreement');

            Route::get('/assessments', [AssessmentApplicationController::class, 'index'])->name('founder.assessments.index');
            Route::patch('/assessments/{application}/review', [AssessmentApplicationController::class, 'markInReview'])->name('founder.assessments.review');
            Route::patch('/assessments/{application}/scope-sent', [AssessmentApplicationController::class, 'markScopeSent'])->name('founder.assessments.scope-sent');

            Route::get('/founders', [AdminFounderController::class, 'index'])->name('founders.index');
            Route::get('/founders/{founder}', [AdminFounderController::class, 'show'])->name('founders.show');
            Route::post('/founders/{founder}/assign', [AdminFounderController::class, 'assign'])->middleware('require.role:superadmin')->name('founders.assign');
            Route::patch('/founders/{founder}/audit-status', [AdminFounderController::class, 'updateAuditStatus'])->name('founders.audit-status');

            Route::prefix('founders/{founder}/documents')->name('documents.')->group(function () {
                Route::get('/', [AdminDocumentController::class, 'index'])->name('index');
                Route::get('/{document}/download', [AdminDocumentController::class, 'download'])->name('download');
                Route::get('/{document}/preview', [AdminDocumentController::class, 'preview'])->name('preview');
                Route::patch('/{document}/reviewed', [AdminDocumentController::class, 'markReviewed'])->name('reviewed');
                Route::patch('/{document}/note', [AdminDocumentController::class, 'addNote'])->name('note');
            });

            Route::prefix('profiles')->name('profiles.')->group(function () {
                Route::get('/', [AdminProfileController::class, 'index'])->name('index');
                Route::get('/{profile}', [AdminProfileController::class, 'show'])->name('show');
                Route::patch('/{profile}', [AdminProfileController::class, 'update'])->name('update');
                Route::patch('/badges/{badge}', [AdminProfileController::class, 'updateBadge'])->name('badge.update');
            });
        });

        Route::prefix('questions')->name('questions.')->middleware('require.role:superadmin,analyst')->group(function () {
            Route::get('/', [AdminQuestionController::class, 'index'])->name('index');
            Route::get('/{question}/edit', [AdminQuestionController::class, 'edit'])->name('edit');
            Route::patch('/{question}', [AdminQuestionController::class, 'update'])->name('update');
        });
    });

    // Investor desk
    Route::prefix('investors')->middleware('admin.side:investors')->group(function () {
        Route::get('/', [AdminDashboardController::class, 'investors'])
            ->middleware('require.role:superadmin,compliance,investor_relations')
            ->name('investors.dashboard');

        Route::middleware('require.role:superadmin,compliance,investor_relations')->group(function () {
            Route::get('/accounts', [InvestorAccountController::class, 'index'])->name('investor-accounts.index');
            Route::get('/accounts/{investor}', [InvestorAccountController::class, 'show'])->name('investor-accounts.show');
            Route::patch('/accounts/{investor}', [InvestorAccountController::class, 'update'])->name('investor-accounts.update');
        });

        Route::middleware('require.role:superadmin,compliance')->group(function () {
            Route::get('/kyc', fn () => redirect()->route('admin.investor-accounts.index', ['kyc_status' => 'pending']))->name('investor-kyc.index');
            Route::get('/kyc/{submission}/preview', [AdminInvestorKycController::class, 'preview'])->name('investor-kyc.preview');
            Route::get('/kyc/{submission}/download', [AdminInvestorKycController::class, 'download'])->name('investor-kyc.download');
            Route::patch('/kyc/{submission}', [AdminInvestorKycController::class, 'review'])->name('investor-kyc.review');
        });

        Route::middleware('require.role:superadmin,investor_relations')->group(function () {
            Route::get('/announcements', [PlatformAnnouncementController::class, 'index'])->name('announcements.index');
            Route::post('/announcements', [PlatformAnnouncementController::class, 'store'])->name('announcements.store');
            Route::get('/spotlight', [AdminSpotlightController::class, 'index'])->name('spotlight.index');
            Route::patch('/spotlight/{profile}', [AdminSpotlightController::class, 'update'])->name('spotlight.update');
            Route::get('/dealflow/interests', [App\Http\Controllers\Admin\InvestorInterestController::class, 'index'])->name('dealflow.interests.index');
            Route::patch('/dealflow/interests/{interest}', [App\Http\Controllers\Admin\InvestorInterestController::class, 'update'])->name('dealflow.interests.update');
            Route::patch('/dealflow/interests/{interest}/schedule', [App\Http\Controllers\Admin\InvestorInterestController::class, 'schedule'])->name('dealflow.interests.schedule');
            Route::patch('/dealflow/interests/{interest}/complete', [App\Http\Controllers\Admin\InvestorInterestController::class, 'complete'])->name('dealflow.interests.complete');
            Route::patch('/dealflow/interests/{interest}/deal-stage', [DiligenceRequestController::class, 'updateDealStage'])->name('dealflow.interests.deal-stage');
            Route::get('/dealflow/data-rooms', [App\Http\Controllers\Admin\InvestorDataRoomController::class, 'index'])->name('dealflow.data-rooms.index');
            Route::patch('/dealflow/data-rooms/{grant}/revoke', [App\Http\Controllers\Admin\InvestorDataRoomController::class, 'revoke'])->name('dealflow.data-rooms.revoke');
            Route::patch('/dealflow/data-rooms/{grant}/reinstate', [App\Http\Controllers\Admin\InvestorDataRoomController::class, 'reinstate'])->name('dealflow.data-rooms.reinstate');
            Route::get('/dealflow/diligence', [DiligenceRequestController::class, 'index'])->name('dealflow.diligence.index');
            Route::patch('/dealflow/diligence/{diligenceRequest}/request-founder', [DiligenceRequestController::class, 'requestFounder'])->name('dealflow.diligence.request-founder');
            Route::patch('/dealflow/diligence/{diligenceRequest}/release', [DiligenceRequestController::class, 'releaseResponse'])->name('dealflow.diligence.release');
            Route::patch('/dealflow/diligence/{diligenceRequest}/decline', [DiligenceRequestController::class, 'decline'])->name('dealflow.diligence.decline');
        });
    });

    // Legacy path redirects (pre–desk-split URLs)
    Route::redirect('/messages', '/admin/founder/messages');
    Route::redirect('/founders', '/admin/founder/founders');
    Route::get('/founders/{founder}', fn (string $founder) => redirect("/admin/founder/founders/{$founder}"));
    Route::redirect('/profiles', '/admin/founder/profiles');
    Route::redirect('/questions', '/admin/founder/questions');
    Route::redirect('/investor-accounts', '/admin/investors/accounts');
    Route::get('/investor-accounts/{investor}', fn (string $investor) => redirect("/admin/investors/accounts/{$investor}"));
    Route::redirect('/investor-kyc', '/admin/investors/kyc');
    Route::redirect('/spotlight', '/admin/investors/spotlight');
    Route::redirect('/announcements', '/admin/investors/announcements');
    Route::redirect('/dealflow/interests', '/admin/investors/dealflow/interests');
    Route::redirect('/dealflow/data-rooms', '/admin/investors/dealflow/data-rooms');
    Route::redirect('/dealflow/diligence', '/admin/investors/dealflow/diligence');
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
})->name('home');
Route::get('/orbit-demo', function () {
    return Inertia::render('OrbitDemo');
})->name('orbit.demo');
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
    Route::get('/result/{id}', [DiagnosticController::class, 'viewById'])
        ->middleware('signed')
        ->name('view');
    Route::post('/send-checklist', [DiagnosticController::class, 'sendChecklist'])->name('send-checklist')->middleware('throttle:3,5');
    Route::get('/blocked', [DiagnosticController::class, 'blocked'])->name('blocked');
});

Route::get('/assessment', [CheckoutController::class, 'assessment'])->name('assessment');
Route::post('/assessment/apply', [CheckoutController::class, 'applyAssessment'])->name('assessment.apply')->middleware('throttle:5,1');

// Investor onboarding
Route::get('/investor', [InvestorController::class, 'index'])->name('investor.index');

Route::prefix('investor')->name('investor.')->group(function () {
    Route::get('/onboarding', [InvestorOnboardingController::class, 'create'])->name('onboarding');
    Route::post('/onboarding', [InvestorOnboardingController::class, 'store'])->name('onboarding.store')->middleware('throttle:5,1');
    Route::get('/login', [InvestorAuthController::class, 'showLogin'])->name('login');
    Route::post('/login', [InvestorAuthController::class, 'login'])->name('login.store')->middleware('throttle:10,1');
    Route::post('/logout', [InvestorAuthController::class, 'logout'])->name('logout');

    Route::get('/forgot-password', [InvestorAuthController::class, 'showForgotPassword'])->name('password.request');
    Route::post('/forgot-password', [InvestorAuthController::class, 'sendResetLink'])->name('password.email')->middleware('throttle:3,1');
    Route::get('/reset-password/{token}', [InvestorAuthController::class, 'showResetPassword'])->name('password.reset');
    Route::post('/reset-password', [InvestorAuthController::class, 'resetPassword'])->name('password.update')->middleware('throttle:3,1');
    Route::get('/kyc', [InvestorKycController::class, 'create'])->middleware('auth.investor')->name('kyc.create');
    Route::post('/kyc', [InvestorKycController::class, 'store'])->middleware('auth.investor')->name('kyc.store');
    Route::get('/spotlight', [InvestorSpotlightController::class, 'index'])->middleware(['auth.investor'])->name('spotlight.index');
    Route::get('/spotlight/{slug}', [InvestorSpotlightController::class, 'show'])->middleware(['auth.investor'])->name('spotlight.show');
    Route::get('/spotlight/{slug}/pitch-deck/preview', [InvestorSpotlightController::class, 'previewPitchDeck'])->middleware(['auth.investor', 'kyc.approved', 'signed'])->name('spotlight.pitch-deck.preview');
    Route::get('/spotlight/{slug}/pitch-deck', [InvestorSpotlightController::class, 'downloadPitchDeck'])->middleware(['auth.investor', 'kyc.approved', 'signed'])->name('spotlight.pitch-deck');
    Route::post('/spotlight/{slug}/interest', [InvestorInterestController::class, 'store'])->middleware(['auth.investor', 'kyc.approved'])->name('interests.store');
    Route::get('/notifications', [App\Http\Controllers\Investor\NotificationController::class, 'index'])->middleware('auth.investor')->name('notifications.index');
    Route::patch('/notifications/read-all', [App\Http\Controllers\Investor\NotificationController::class, 'readAll'])->middleware('auth.investor')->name('notifications.read-all');
    Route::patch('/notifications/{notification}/read', [App\Http\Controllers\Investor\NotificationController::class, 'read'])->middleware('auth.investor')->name('notifications.read');

    Route::get('/interests', [InvestorInterestController::class, 'index'])->middleware('auth.investor')->name('interests.index');
    Route::get('/diligence', [App\Http\Controllers\Investor\DiligenceRequestController::class, 'index'])->middleware('auth.investor')->name('diligence.index');
    Route::post('/spotlight/{slug}/diligence', [App\Http\Controllers\Investor\DiligenceRequestController::class, 'store'])->middleware(['auth.investor', 'kyc.approved'])->name('diligence.store');

    Route::get('/data-rooms', [InvestorDataRoomController::class, 'index'])->middleware(['auth.investor', 'kyc.approved'])->name('data-rooms.index');
    Route::get('/data-rooms/{slug}', [InvestorDataRoomController::class, 'show'])->middleware(['auth.investor', 'kyc.approved'])->name('data-rooms.show');
    Route::get('/data-rooms/{slug}/document/{document}', [InvestorDataRoomController::class, 'download'])->middleware(['auth.investor', 'kyc.approved', 'signed'])->name('data-rooms.download');
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
    Route::post('/request', [CheckoutController::class, 'submitDiagnosticPiaRequest'])->name('request')->middleware('throttle:5,1');
    Route::get('/success', [CheckoutController::class, 'success'])->name('success');
    Route::get('/cancel', [CheckoutController::class, 'cancel'])->name('cancel');
});

// Paystack webhook — CSRF excluded in bootstrap/app.php
Route::post('/webhooks/paystack', [CheckoutController::class, 'webhook'])->name('webhooks.paystack');

Route::prefix('onboarding')->name('onboarding.')->group(function () {
    Route::get('/continue', [OnboardingController::class, 'continueFromInvite'])->name('continue')->middleware('throttle:10,1');
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
        Route::get('/notifications', [App\Http\Controllers\Founder\NotificationController::class, 'index'])->name('notifications.index');
        Route::patch('/notifications/read-all', [App\Http\Controllers\Founder\NotificationController::class, 'readAll'])->name('notifications.read-all');
        Route::patch('/notifications/{notification}/read', [App\Http\Controllers\Founder\NotificationController::class, 'read'])->name('notifications.read');
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

        Route::patch('/interests/{interest}/authorization', [FounderDashboardController::class, 'updateInterestAuthorization'])
            ->name('interests.authorize');

        Route::get('/diligence', [FounderDiligenceController::class, 'index'])->name('diligence.index');
        Route::patch('/diligence/{diligenceRequest}/respond', [FounderDiligenceController::class, 'respond'])->name('diligence.respond');
    });
});

// Public verification routes — no auth required
Route::prefix('verify')->name('verify.')->group(function () {
    Route::get('/sample-unicorn', [VerificationController::class, 'sample'])->name('sample');
    Route::get('/{slug}', fn () => redirect()->route('investor.index'))->name('retired');
});

// Tester guide PDF — token-protected, no auth required
Route::get('/tester-guide', function () {
    $expected = (string) env('TESTER_GUIDE_TOKEN', '');
    $token = (string) request('token', '');

    if ($expected === '' || $token === '' || ! hash_equals($expected, $token)) {
        abort(403);
    }

    $pdf = Pdf::loadView('pdfs.tester-guide')
        ->setPaper('a4', 'portrait');

    return $pdf->download('Pinpoint-Tester-Guide.pdf');
})->name('tester-guide');

require __DIR__.'/auth.php';
