<x-mail::message>
# Welcome to Pinpoint, {{ $founder->full_name }}.

Your account has been created and your **{{ $tierLabel }} Audit** is now in the queue.

<x-mail::panel>
**WHAT HAPPENS NEXT:**

→ An analyst will be assigned to your venture within 2 business days

→ You will be notified when your audit begins

→ Your investor verification page goes live upon completion
</x-mail::panel>

<x-mail::button :url="$dashboardUrl" color="primary">
Access Your Dashboard
</x-mail::button>

Keep an eye on your inbox — your analyst will reach out directly when they begin reviewing your profile.

— The Pinpoint Team
</x-mail::message>
