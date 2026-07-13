<?php

namespace App\Http\Controllers;

use App\Models\ContactMessage;
use App\Models\NewsletterSubscriber;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class ContactController extends Controller
{
    public function storeContact(Request $request): RedirectResponse
    {
        $request->validate([
            'name'         => ['required', 'string', 'max:100'],
            'email'        => ['required', 'email', 'max:150'],
            'company_name' => ['nullable', 'string', 'max:150'],
            'message'      => ['required', 'string', 'max:2000'],
        ]);

        ContactMessage::create([
            'name'         => $request->name,
            'email'        => $request->email,
            'company_name' => $request->company_name,
            'message'      => $request->message,
        ]);

        return back()->with('contactStatus', [
            'variant' => 'success',
            'message' => 'Thank you for your message! Our support team will connect with you within 24 hours.',
        ]);
    }

    public function storeNewsletter(Request $request): RedirectResponse
    {
        $request->validate([
            'email' => ['required', 'email', 'max:150'],
        ]);

        try {
            NewsletterSubscriber::firstOrCreate([
                'email' => $request->email,
            ]);
        } catch (\Illuminate\Database\QueryException $e) {
            // Silence unique duplicate key violations since they are already subscribed
        }

        return back()->with('newsletterStatus', [
            'variant' => 'success',
            'message' => '✓ Thank you for subscribing to updates!',
        ]);
    }
}
