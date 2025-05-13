<?php
/**
 * Weekly Offers CORS Handler
 * Handles CORS headers for the Weekly Offers API
 */

// Prevent direct access
if (!defined('ABSPATH')) {
    exit;
}

// Function to get allowed origins
function weekly_theme_get_allowed_origins() {
    return array(
        'http://localhost:8080',
        'http://localhost',
        'http://localhost:80',
        get_site_url(),
    );
}

// Function to check if origin is allowed
function weekly_theme_is_allowed_origin($origin) {
    $allowed_origins = weekly_theme_get_allowed_origins();
    return in_array($origin, $allowed_origins);
}

// Function to set CORS headers
function weekly_theme_set_cors_headers() {
    $origin = get_http_origin();
    
    if ($origin && weekly_theme_is_allowed_origin($origin)) {
        header('Access-Control-Allow-Origin: ' . esc_url_raw($origin));
        header('Access-Control-Allow-Credentials: true');
        header('Access-Control-Allow-Headers: X-WP-Nonce, Content-Type, Authorization, X-Requested-With');
        header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
        
        // Handle preflight requests
        if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
            status_header(200);
            exit();
        }
    }
}

// Add CORS headers for REST API
add_action('rest_api_init', function() {
    remove_filter('rest_pre_serve_request', 'rest_send_cors_headers');
    add_filter('rest_pre_serve_request', function($served, $result, $request, $server) {
        weekly_theme_set_cors_headers();
        return $served;
    }, 10, 4);
});

// Add CORS headers for WooCommerce endpoints
add_filter('woocommerce_rest_is_request_to_rest_api', function($is_rest_api_request) {
    if ($is_rest_api_request) {
        add_action('init', 'weekly_theme_set_cors_headers', 0);
    }
    return $is_rest_api_request;
});

// Add CORS headers for all REST API requests
add_action('init', function() {
    if (defined('REST_REQUEST') && REST_REQUEST) {
        weekly_theme_set_cors_headers();
    }
}, 0);
