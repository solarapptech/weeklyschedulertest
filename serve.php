<?php
// Set the content type to HTML
header('Content-Type: text/html');

// Get the requested file
$request_uri = $_SERVER['REQUEST_URI'];
$file_path = __DIR__ . parse_url($request_uri, PHP_URL_PATH);

// If no specific file is requested, serve index.html
if ($file_path === __DIR__ . '/' || $file_path === __DIR__) {
    $file_path = __DIR__ . '/index.html';
}

// Check if the file exists
if (file_exists($file_path)) {
    // Get the file extension
    $extension = pathinfo($file_path, PATHINFO_EXTENSION);
    
    // Set appropriate content type based on file extension
    switch ($extension) {
        case 'js':
            header('Content-Type: application/javascript');
            break;
        case 'css':
            header('Content-Type: text/css');
            break;
        case 'json':
            header('Content-Type: application/json');
            break;
    }
    
    // Serve the file
    readfile($file_path);
} else {
    // If file doesn't exist, serve index.html
    readfile(__DIR__ . '/index.html');
}
