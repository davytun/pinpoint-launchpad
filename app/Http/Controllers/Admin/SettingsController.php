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
            'investor_cta' => [
                'label' => Setting::get('investor_cta_label', 'Join PIN'),
                'url' => Setting::get('investor_cta_url', '/investor/onboarding'),
                'enabled' => Setting::get('investor_cta_enabled', '1') === '1',
            ],
        ]);
    }

    public function update(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'diagnostic_cooldown_days' => ['required', 'integer', 'min:1', 'max:365'],
            'investor_cta_label' => ['sometimes', 'required', 'string', 'max:60'],
            'investor_cta_url' => ['sometimes', 'required', 'string', 'max:2048'],
            'investor_cta_enabled' => ['sometimes', 'required', 'boolean'],
        ]);

        Setting::set('diagnostic_cooldown_days', (string) $validated['diagnostic_cooldown_days']);
        if (array_key_exists('investor_cta_label', $validated)) {
            Setting::set('investor_cta_label', $validated['investor_cta_label']);
            Setting::set('investor_cta_url', $validated['investor_cta_url']);
            Setting::set('investor_cta_enabled', $validated['investor_cta_enabled'] ? '1' : '0');
        }

        return redirect()
            ->route('admin.settings.index')
            ->with('success', 'Settings saved.');
    }
}
