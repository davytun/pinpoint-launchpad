<?php

it('homepage loads successfully', function () {
    $this->get('/')->assertOk();
});
