<?php

it('homepage redirects to the waitlist', function () {
    $this->get('/')->assertRedirect('/waitlist');
});

it('diagnostic page loads successfully', function () {
    $this->get('/diagnostic')->assertStatus(200);
});
