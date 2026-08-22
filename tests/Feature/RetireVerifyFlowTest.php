<?php

namespace Tests\Feature;

use Tests\TestCase;

class RetireVerifyFlowTest extends TestCase
{
    /** @test */
    public function sample_unicorn_profile_is_accessible_for_marketing()
    {
        $response = $this->get('/verify/sample-unicorn');

        $response->assertStatus(200);
    }

    /** @test */
    public function any_other_verify_slug_redirects_to_investor_portal()
    {
        $response = $this->get('/verify/some-real-startup');

        $response->assertRedirect('/investor');
    }

    /** @test */
    public function old_request_access_endpoint_is_removed_and_returns_404()
    {
        $response = $this->post('/verify/some-real-startup/request-access', [
            'investor_name' => 'John Doe',
            'investor_email' => 'john@example.com',
        ]);

        $response->assertStatus(404);
    }

    /** @test */
    public function old_document_download_endpoint_is_removed_and_returns_404()
    {
        $response = $this->get('/verify/some-real-startup/document/1/download?token=abc');

        $response->assertStatus(404);
    }
}
