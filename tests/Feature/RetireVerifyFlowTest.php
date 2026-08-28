<?php

test('sample unicorn profile is accessible for marketing', function () {
    $this->get('/verify/sample-unicorn')->assertOk();
});

test('any other verify slug redirects to investor portal', function () {
    $this->get('/verify/some-real-startup')->assertRedirect('/investor');
});

test('old request access endpoint is removed and returns 404', function () {
    $this->post('/verify/some-real-startup/request-access', [
        'investor_name' => 'John Doe',
        'investor_email' => 'john@example.com',
    ])->assertNotFound();
});

test('old document download endpoint is removed and returns 404', function () {
    $this->get('/verify/some-real-startup/document/1/download?token=abc')->assertNotFound();
});
