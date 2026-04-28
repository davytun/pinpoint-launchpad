<x-mail::message>
# New Document Uploaded

**{{ $company_name }}** has uploaded a new document for analyst review.

<x-mail::panel>
**Document:** {{ $filename }}
**Category:** {{ $category_label }}
**Uploaded:** {{ $uploaded_at }}
**Founder:** {{ $founder_name }} ({{ $founder_email }})
</x-mail::panel>

<x-mail::button :url="$review_url">
Review Document
</x-mail::button>

Please review and mark as reviewed once done.

— Pinpoint System
</x-mail::message>
