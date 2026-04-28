<?php

namespace App\Mail;

use App\Models\Founder;
use App\Models\FounderDocument;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class DocumentUploadedMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public readonly Founder $founder,
        public readonly FounderDocument $document,
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'New Document Uploaded — ' . $this->founder->company_name,
        );
    }

    public function content(): Content
    {
        return new Content(
            markdown: 'emails.documents.uploaded',
            with: [
                'founder_name'   => $this->founder->full_name,
                'founder_email'  => $this->founder->email,
                'company_name'   => $this->founder->company_name,
                'category_label' => $this->document->categoryLabel(),
                'filename'       => $this->document->original_filename,
                'uploaded_at'    => $this->document->created_at->format('d M Y, H:i') . ' UTC',
                'review_url'     => url('/admin/founders/' . $this->founder->id . '/documents'),
            ],
        );
    }

    public function attachments(): array
    {
        return [];
    }
}
