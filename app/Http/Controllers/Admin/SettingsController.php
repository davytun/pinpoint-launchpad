<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Setting;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class SettingsController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('Admin/Settings/Index', [
            'cooldown_days' => (int) Setting::get('diagnostic_cooldown_days', 30),
        ]);
    }

    public function update(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'diagnostic_cooldown_days' => ['required', 'integer', 'min:1', 'max:365'],
        ]);

        Setting::set('diagnostic_cooldown_days', (string) $validated['diagnostic_cooldown_days']);

        return redirect()
            ->route('admin.settings.index')
            ->with('success', 'Settings saved.');
    }
}
