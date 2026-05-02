<?php

namespace App\Services;

use App\Models\Founder;
use App\Models\FounderDocument;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
use Symfony\Component\HttpFoundation\StreamedResponse;

class DocumentService
{
    private const ALLOWED_MIMES = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'text/csv',
        'application/vnd.ms-powerpoint',
        'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        'image/jpeg',
        'image/png',
    ];

    private const ALLOWED_EXTENSIONS = [
        'pdf', 'doc', 'docx', 'xls', 'xlsx', 'csv', 'ppt', 'pptx', 'jpg', 'jpeg', 'png',
    ];

    private const MAX_SIZE = 104857600; // 100MB

    public function validateFile(UploadedFile $file): void
    {
        if (!\in_array($file->getMimeType(), self::ALLOWED_MIMES)) {
            throw ValidationException::withMessages([
                'file' => 'This file type is not allowed.',
            ]);
        }

        $extension = strtolower($file->getClientOriginalExtension());
        if (!\in_array($extension, self::ALLOWED_EXTENSIONS)) {
            throw ValidationException::withMessages([
                'file' => 'This file extension is not permitted.',
            ]);
        }

        if ($file->getSize() > self::MAX_SIZE) {
            throw ValidationException::withMessages([
                'file' => 'File size must not exceed 10MB.',
            ]);
        }
    }

    public function store(UploadedFile $file, Founder $founder, string $category): FounderDocument
    {
        $storedFilename = Str::uuid() . '.' . $file->getClientOriginalExtension();
        $path = 'founder-documents/' . $founder->id . '/' . $storedFilename;

        Storage::disk('local')->putFileAs(
            'founder-documents/' . $founder->id,
            $file,
            $storedFilename
        );

        $originalName = pathinfo($file->getClientOriginalName(), PATHINFO_FILENAME);
        $originalName = Str::limit(
            preg_replace('/[^a-zA-Z0-9._\- ]/', '', $originalName),
            100
        );
        $originalFilename = $originalName . '.' . strtolower($file->getClientOriginalExtension());

        return FounderDocument::create([
            'founder_id'        => $founder->id,
            'payment_id'        => $founder->payment_id,
            'category'          => $category,
            'original_filename' => $originalFilename,
            'stored_filename'   => $storedFilename,
            'file_path'         => $path,
            'file_size'         => $file->getSize(),
            'mime_type'         => $file->getMimeType(),
            'extension'         => strtolower($file->getClientOriginalExtension()),
        ]);
    }

    public function delete(FounderDocument $document): bool
    {
        if (!$document->isDeletable()) {
            throw new \RuntimeException('This document cannot be deleted once the audit has begun.');
        }

        Storage::disk('local')->delete($document->file_path);
        $document->delete();

        return true;
    }

    public function download(FounderDocument $document): StreamedResponse
    {
        return Storage::disk('local')->download(
            $document->file_path,
            $document->original_filename
        );
    }
}
