<?php

use App\Models\Investor;
use App\Notifications\InvestorKycReviewedNotification;

test('KYC review notifications are delivered by mail and stored in-app', function () {
    $approved = new InvestorKycReviewedNotification('approved');
    $rejected = new InvestorKycReviewedNotification('rejected', 'Please upload a clearer identity card.');

    expect($approved->via(new Investor))->toBe(['mail', 'database'])
        ->and($rejected->reviewNotes)->toBe('Please upload a clearer identity card.');
});
