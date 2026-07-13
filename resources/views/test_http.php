<?php

$url = 'http://127.0.0.1:8000/verify/acme-technologies-ltd?token=6LXNKQ8Asq154tRwMwAYXG9y26nqN7Wr';
$options = [
    'http' => [
        'header' => "X-Inertia: true\r\n" .
                    "X-Requested-With: XMLHttpRequest\r\n" .
                    "Accept: application/json\r\n"
    ]
];

$context = stream_context_create($options);
$response = @file_get_contents($url, false, $context);

if ($response === false) {
    echo "HTTP request failed! (Is the server running on port 8000?)\n";
} else {
    $data = json_decode($response, true);
    echo "HTTP STATUS: OK\n";
    echo "PROPS: " . json_encode($data['props'] ?? null, JSON_PRETTY_PRINT) . "\n";
}
