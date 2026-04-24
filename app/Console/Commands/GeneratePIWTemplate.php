<?php

namespace App\Console\Commands;

use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Console\Command;

class GeneratePIWTemplate extends Command
{
    protected $signature = 'piw:generate-template';

    protected $description = 'Generate the PIW PDF template for BoldSign upload';

    public function handle(): void
    {
        $pdf = Pdf::loadView('documents.piw', [
            'founder_name'  => '{{FOUNDER_NAME}}',
            'company_name'  => '{{COMPANY_NAME}}',
            'tier_selected' => '{{TIER_SELECTED}}',
            'amount_paid'   => '{{AMOUNT_PAID}}',
            'date'          => '{{DATE}}',
        ]);

        $pdf->setPaper('A4', 'portrait');

        $path = storage_path('app/piw-template.pdf');
        $pdf->save($path);

        $this->info('PIW template generated at: ' . $path);
        $this->info('Upload this PDF to BoldSign as your template document.');
    }
}
