<?php
/**
 * Plugin Name: Weekly Offers CORS Handler
 * Description: Handles CORS headers for the Weekly Offers API
 * Version: 1.0
 * Author: Your Name
 */

// Prevent direct access
if (!defined('ABSPATH')) {
    exit;
}

// Function to get allowed origins
function get_allowed_origins() {
    return array(
        'http://localhost:8080',
        'http://localhost',
        'http://localhost:80',
        'http://localhost/lamac.com',
        'http://localhost:80/lamac.com',
        'http://lamac.com',
        'http://www.lamac.com',
        get_site_url(),
    );
}

// Function to check if origin is allowed
function is_allowed_origin($origin) {
    $allowed_origins = get_allowed_origins();
    return in_array($origin, $allowed_origins);
}

// Function to set CORS headers
function set_cors_headers() {
    $origin = get_http_origin();
    
    if ($origin && is_allowed_origin($origin)) {
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
        set_cors_headers();
        return $served;
    }, 10, 4);
});

// Add CORS headers for WooCommerce endpoints
add_filter('woocommerce_rest_is_request_to_rest_api', function($is_rest_api_request) {
    if ($is_rest_api_request) {
        add_action('init', 'set_cors_headers', 0);
    }
    return $is_rest_api_request;
});

// Add CORS headers for all REST API requests
add_action('init', function() {
    if (defined('REST_REQUEST') && REST_REQUEST) {
        set_cors_headers();
    }
}, 0);

// Remove default WordPress CORS headers
remove_action('init', 'rest_api_init');
add_action('init', 'rest_api_init', 0);
