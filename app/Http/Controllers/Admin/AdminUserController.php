<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AuditAssignment;
use App\Models\AuditLog;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;
use Inertia\Response;
use Laravel\Fortify\Actions\DisableTwoFactorAuthentication;

class AdminUserController extends Controller
{
    public function index(): Response
    {
        $users = User::withCount(['auditAssignments as assigned_founders_count'])
            ->latest()
            ->get()
            ->map(fn ($u) => [
                'id' => $u->id,
                'name' => $u->name,
                'email' => $u->email,
                'role' => $u->role,
                'assigned_founders_count' => $u->assigned_founders_count,
                'created_at' => $u->created_at->format('d M Y'),
                'is_self' => $u->id === Auth::id(),
            ]);

        return Inertia::render('Admin/Users/Index', [
            'users' => $users,
            'user_role' => Auth::user()->role,
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('Admin/Users/Create', [
            'user_role' => Auth::user()->role,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'name' => ['required', 'string', 'max:100'],
            'email' => ['required', 'email', 'unique:users,email'],
            'role' => ['required', 'in:superadmin,analyst,compliance,investor_relations'],
            'password' => ['required', 'min:8', 'confirmed'],
        ]);

        User::create([
            'name' => $request->name,
            'email' => $request->email,
            'role' => $request->role,
            'password' => Hash::make($request->password),
        ]);

        return redirect()->route('admin.users.index')->with('success', 'Team member created successfully.');
    }

    public function edit(User $user): Response
    {
        return Inertia::render('Admin/Users/Edit', [
            'member' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role,
                'two_factor_enabled' => $user->hasEnabledTwoFactorAuthentication(),
            ],
            'user_role' => Auth::user()->role,
            'is_self' => $user->id === Auth::id(),
        ]);
    }

    public function update(Request $request, User $user): RedirectResponse
    {
        $request->validate([
            'name' => ['required', 'string', 'max:100'],
            'role' => ['required', 'in:superadmin,analyst,compliance,investor_relations'],
        ]);

        if ($user->id === Auth::id() && $request->role !== $user->role) {
            return back()->withErrors(['role' => 'You cannot change your own role.']);
        }

        $user->update([
            'name' => $request->name,
            'role' => $request->role,
        ]);

        return redirect()->route('admin.users.index')->with('success', 'Team member updated.');
    }

    public function destroy(User $user): RedirectResponse
    {
        if ($user->id === Auth::id()) {
            return back()->withErrors(['general' => 'You cannot delete your own account.']);
        }

        // Reassign any open audit assignments to null before deletion
        AuditAssignment::where('analyst_id', $user->id)->update(['analyst_id' => null]);

        $user->delete();

        return redirect()->route('admin.users.index')->with('success', 'Team member removed.');
    }

    public function resetTwoFactor(Request $request, User $user, DisableTwoFactorAuthentication $disableTwoFactor): RedirectResponse
    {
        abort_unless($user->canOperateAdmin(), 404);

        if ($user->is(Auth::user())) {
            return back()->withErrors(['two_factor' => 'Another superadmin must reset your two-factor authentication.']);
        }

        if (! $user->hasEnabledTwoFactorAuthentication()) {
            return back()->with('info', 'Two-factor authentication is not configured for this team member.');
        }

        $disableTwoFactor($user);

        AuditLog::create([
            'event' => 'admin.two_factor.reset',
            'actor_type' => User::class,
            'actor_id' => (string) Auth::id(),
            'auditable_type' => User::class,
            'auditable_id' => (string) $user->getKey(),
            'metadata' => [
                'target_email' => $user->email,
                'target_role' => $user->role,
            ],
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);

        return back()->with('success', "Two-factor authentication was reset for {$user->name}.");
    }
}
