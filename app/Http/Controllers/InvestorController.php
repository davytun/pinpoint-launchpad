<?php

namespace App\Http\Controllers;

use App\Models\Setting;
use Inertia\Inertia;
use Inertia\Response;

class InvestorController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('Investor/Landing', [
            'cta' => [
                'label' => Setting::get('investor_cta_label', 'Join PIN'),
                'url' => Setting::get('investor_cta_url', '/investor/onboarding'),
                'enabled' => Setting::get('investor_cta_enabled', '1') === '1',
            ],
        ]);
    }
}
