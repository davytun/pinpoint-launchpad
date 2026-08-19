<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\InvestorInterest;
use Inertia\Inertia;
use Inertia\Response;

class InvestorInterestController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('Admin/Dealflow/Interests', [
            'interests' => InvestorInterest::with(['investor.profile', 'profile.founder:id,company_name'])
                ->latest()
                ->paginate(20),
        ]);
    }
}
