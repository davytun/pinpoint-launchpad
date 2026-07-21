<?php

namespace Tests\Feature;

use App\Http\Controllers\CheckoutController;
use PHPUnit\Framework\Attributes\Test;
use Tests\TestCase;

class CheckoutPricingTest extends TestCase
{
    #[Test]
    public function it_uses_local_and_international_pricing_for_the_foundation_tier(): void
    {
        $controller = new CheckoutController;
        $method = new \ReflectionMethod($controller, 'getTiers');
        $method->setAccessible(true);

        $localTiers = $method->invoke($controller, true);
        $this->assertSame('Domestic & Local Founders', $localTiers[0]['label']);
        $this->assertSame(350000, $localTiers[0]['base_price']);
        $this->assertSame(350000, $localTiers[0]['total']);
        $this->assertSame(350000, $localTiers[0]['naira_equivalent']);

        $internationalTiers = $method->invoke($controller, false);
        $this->assertSame('Diaspora & International', $internationalTiers[0]['label']);
        $this->assertSame(500, $internationalTiers[0]['base_price']);
        $this->assertSame(500, $internationalTiers[0]['total']);
        $this->assertSame(350000, $internationalTiers[0]['naira_equivalent']);
    }
}
