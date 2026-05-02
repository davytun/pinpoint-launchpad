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
            'founder_name'  => '{{t:founder_name;r:y;ro:y;}}',
            'company_name'  => '{{t:company_name;r:y;ro:y;}}',
            'tier_selected' => '{{t:tier_selected;r:y;ro:y;}}',
            'amount_paid'   => '{{t:amount_paid;r:y;ro:y;}}',
            'date'          => '{{t:date;r:y;ro:y;}}',
        ]);

        $pdf->setPaper('A4', 'portrait');

        $path = storage_path('app/piw-template.pdf');
        $pdf->save($path);

        $this->info('PIW template generated at: ' . $path);
        $this->info('Upload this PDF to BoldSign as your template document.');
    }
}
