<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\DiagnosticQuestion;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class QuestionController extends Controller
{
    public function index(): Response
    {
        $questions = DiagnosticQuestion::orderBy('order')->paginate(20);

        return Inertia::render('Admin/Questions/Index', [
            'questions' => $questions,
        ]);
    }

    public function edit(DiagnosticQuestion $question): Response
    {
        return Inertia::render('Admin/Questions/Edit', [
            'question' => $question,
        ]);
    }

    public function update(Request $request, DiagnosticQuestion $question): RedirectResponse
    {
        $validated = $request->validate([
            'question_text' => ['required', 'string'],
            'sub_text'      => ['nullable', 'string'],
            'points'        => ['required', 'integer', 'min:1', 'max:20'],
            'is_active'     => ['required', 'boolean'],
        ]);

        $question->update($validated);

        return redirect()
            ->route('admin.questions.index')
            ->with('success', 'Question updated successfully.');
    }
}
