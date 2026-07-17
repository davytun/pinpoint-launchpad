<?php

it('homepage loads successfully', function () {
    $this->get('/')->assertStatus(200);
});

it('waitlist redirects to homepage', function () {
    $this->get('/waitlist')->assertRedirect('/');
});

it('diagnostic page loads successfully', function () {
    $this->get('/diagnostic')->assertStatus(200);
});
