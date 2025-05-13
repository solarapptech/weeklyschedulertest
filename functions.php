<?php
/**
 * Weekly Offer Scheduler functions and definitions
 */

if (!defined('_S_VERSION')) {
    // Replace the version number of the theme on each release.
    define('_S_VERSION', '1.0.0');
}

/**
 * Sets up theme defaults and registers support for various WordPress features.
 */
function weekly_offer_scheduler_setup() {
    // Add default posts and comments RSS feed links to head.
    add_theme_support('automatic-feed-links');

    // Let WordPress manage the document title.
    add_theme_support('title-tag');

    // Enable support for Post Thumbnails on posts and pages.
    add_theme_support('post-thumbnails');

    // This theme uses wp_nav_menu() in one location.
    register_nav_menus(
        array(
            'menu-1' => esc_html__('Primary', 'weekly-offer-scheduler'),
        )
    );

    // Add theme support for selective refresh for widgets.
    add_theme_support('customize-selective-refresh-widgets');

    // Add support for core custom logo.
    add_theme_support(
        'custom-logo',
        array(
            'height'      => 250,
            'width'       => 250,
            'flex-width'  => true,
            'flex-height' => true,
        )
    );

    // Add REST API support
    add_theme_support('rest-api');
}
add_action('after_setup_theme', 'weekly_offer_scheduler_setup');

/**
 * Enqueue scripts and styles.
 */
function weekly_offer_scheduler_scripts() {
    // Enqueue main stylesheet (style.css in theme root)
    wp_enqueue_style('weekly-offer-scheduler-style', get_stylesheet_uri(), array(), _S_VERSION);
    
    // Enqueue main CSS file
    wp_enqueue_style('weekly-offer-scheduler-main', get_template_directory_uri() . '/css/main.css', array(), _S_VERSION . '.' . time());
    
    // Enqueue calendar CSS
    wp_enqueue_style('weekly-offer-scheduler-calendar', get_template_directory_uri() . '/css/calendar.css', array(), _S_VERSION . '.' . time());
    
    // Enqueue modal CSS
    wp_enqueue_style('weekly-offer-scheduler-modal', get_template_directory_uri() . '/css/modal.css', array(), _S_VERSION . '.' . time());
    
    // Enqueue JavaScript dependencies
    wp_enqueue_script('weekly-offer-scheduler-script', get_template_directory_uri() . '/js/script.js', array('jquery'), _S_VERSION . '.' . time(), true);
    
    // Localize the script with WordPress data
    wp_localize_script('weekly-offer-scheduler-script', 'wpApiSettings', array(
        'root' => esc_url_raw(rest_url()),
        'nonce' => wp_create_nonce('wp_rest')
    ));
}
add_action('wp_enqueue_scripts', 'weekly_offer_scheduler_scripts');

/**
 * Register REST API endpoints for Weekly Offers
 */
function weekly_offer_scheduler_register_rest_routes() {
    // Register route for all offers
    register_rest_route('weekly-offers/v1', '/offers', array(
        'methods' => 'GET',
        'callback' => 'get_all_offers',
        'permission_callback' => '__return_true' // Allow public access
    ));
    
    // Register route for saving an offer
    register_rest_route('weekly-offers/v1', '/offers', array(
        'methods' => 'POST',
        'callback' => 'save_offer',
        'permission_callback' => function() {
            // Check nonce for authenticated requests
            if (current_user_can('edit_posts')) {
                return true;
            }
            
            // For non-authenticated requests, verify the nonce
            $nonce = isset($_SERVER['HTTP_X_WP_NONCE']) ? $_SERVER['HTTP_X_WP_NONCE'] : '';
            return wp_verify_nonce($nonce, 'wp_rest');
        }
    ));
    
    // Register route for getting offers by date
    register_rest_route('weekly-offers/v1', '/offers/date/(?P<date>[0-9-]+)', array(
        'methods' => 'GET',
        'callback' => 'get_offers_by_date',
        'permission_callback' => '__return_true' // Allow public access
    ));
    
    // Register route for deleting an offer
    register_rest_route('weekly-offers/v1', '/offers/(?P<id>[a-zA-Z0-9-]+)', array(
        'methods' => 'DELETE',
        'callback' => 'delete_offer',
        'permission_callback' => function() {
            // Check nonce for authenticated requests
            if (current_user_can('edit_posts')) {
                return true;
            }
            
            // For non-authenticated requests, verify the nonce
            $nonce = isset($_SERVER['HTTP_X_WP_NONCE']) ? $_SERVER['HTTP_X_WP_NONCE'] : '';
            return wp_verify_nonce($nonce, 'wp_rest');
        }
    ));
    
    // Register route for getting online offers
    register_rest_route('weekly-offers/v1', '/offers/online', array(
        'methods' => 'GET',
        'callback' => 'get_online_offers',
        'permission_callback' => '__return_true' // Allow public access
    ));

    // Register route for getting offers by dates
    register_rest_route('weekly-offers/v1', '/offers/dates', array(
        'methods' => 'POST',
        'callback' => 'get_offers_by_dates',
        'permission_callback' => '__return_true'
    ));
}
add_action('rest_api_init', 'weekly_offer_scheduler_register_rest_routes');

/**
 * REST API callback functions
 */
function get_all_offers() {
    $offers = get_option('weekly_offers', array());
    return rest_ensure_response($offers);
}

function save_offer($request) {
    $offer = $request->get_json_params();
    
    if (!$offer) {
        return new WP_Error('invalid_offer', 'Invalid offer data', array('status' => 400));
    }
    
    $offers = get_option('weekly_offers', array());
    
    // Find if offer already exists by ID or by date+time combination
    $found = false;
    foreach ($offers as $key => $existing_offer) {
        // Check by ID
        if ($existing_offer['id'] === $offer['id']) {
            $offers[$key] = $offer;
            $found = true;
            break;
        }
        
        // Check by date+time combination to prevent duplicates
        if ($existing_offer['date'] === $offer['date'] && 
            $existing_offer['startTime'] === $offer['startTime'] && 
            $existing_offer['endTime'] === $offer['endTime'] &&
            $existing_offer['title'] === $offer['title']) {
            // Update the existing offer with new data
            $offers[$key] = array_merge($existing_offer, $offer);
            $found = true;
            break;
        }
    }
    
    // If not found, add it
    if (!$found) {
        $offers[] = $offer;
    }
    
    // Ensure array is reindexed
    $offers = array_values($offers);
    update_option('weekly_offers', $offers);
    
    return rest_ensure_response($offer);
}

function get_offers_by_date($request) {
    $date = $request['date'];
    $offers = get_option('weekly_offers', array());
    
    $filtered_offers = array_filter($offers, function($offer) use ($date) {
        return $offer['date'] === $date;
    });
    
    return rest_ensure_response(array_values($filtered_offers));
}

function delete_offer($request) {
    $id = $request['id'];
    $offers = get_option('weekly_offers', array());
    
    $filtered_offers = array_filter($offers, function($offer) use ($id) {
        return $offer['id'] !== $id;
    });
    
    update_option('weekly_offers', array_values($filtered_offers));
    
    return rest_ensure_response(array('success' => true));
}

function get_online_offers() {
    $offers = get_option('weekly_offers', array());
    
    // Filter to only online offers
    $online_offers = array_filter($offers, function($offer) {
        return is_offer_online($offer['startTime'], $offer['endTime']);
    });
    
    // Enhance the offers with product details
    $enhanced_offers = array_map(function($offer) {
        // Find the product details if available
        $product_details = null;
        if (!empty($offer['productId'])) {
            $product = wc_get_product($offer['productId']);
            
            if ($product) {
                $product_details = array(
                    'id' => $product->get_id(),
                    'name' => $product->get_name(),
                    'cardAttributes' => !empty($offer['cardAttributes']) ? $offer['cardAttributes'] : array(),
                    'image' => wp_get_attachment_url($product->get_image_id()),
                    'permalink' => get_permalink($product->get_id()),
                );
            }
        }
        
        return array(
            'id' => $offer['id'],
            'title' => $offer['title'],
            'date' => $offer['date'],
            'startTime' => $offer['startTime'],
            'endTime' => $offer['endTime'],
            'color' => $offer['color'],
            'product' => $product_details,
            'isOnline' => true, // By definition, all offers returned are online
        );
    }, $online_offers);
    
    return rest_ensure_response(array(
        'count' => count($enhanced_offers),
        'offers' => array_values($enhanced_offers),
    ));
}

function get_offers_by_dates($request) {
    $dates = $request->get_json_params();
    if (!is_array($dates)) {
        return new WP_Error('invalid_dates', 'Invalid dates array', array('status' => 400));
    }
    
    $offers = get_option('weekly_offers', array());
    
    $filtered_offers = array_filter($offers, function($offer) use ($dates) {
        return in_array($offer['date'], $dates);
    });
    
    // Group offers by date
    $grouped_offers = array();
    foreach ($filtered_offers as $offer) {
        if (!isset($grouped_offers[$offer['date']])) {
            $grouped_offers[$offer['date']] = array();
        }
        $grouped_offers[$offer['date']][] = $offer;
    }
    
    // Ensure all requested dates are in the response, even if empty
    $result = array();
    foreach ($dates as $date) {
        $result[$date] = isset($grouped_offers[$date]) ? $grouped_offers[$date] : array();
    }
    
    return rest_ensure_response($result);
}

// Helper function to check if an offer is currently online
function is_offer_online($startTime, $endTime) {
    // Get current UTC time
    $now = new DateTime('now', new DateTimeZone('UTC'));
    $current_hours = (int)$now->format('H');
    $current_minutes = (int)$now->format('i');
    
    // Parse start and end times
    list($start_hours, $start_minutes) = array_map('intval', explode(':', $startTime));
    list($end_hours, $end_minutes) = array_map('intval', explode(':', $endTime));
    
    // Convert to minutes for easier comparison
    $current_time_in_minutes = $current_hours * 60 + $current_minutes;
    $start_time_in_minutes = $start_hours * 60 + $start_minutes;
    $end_time_in_minutes = $end_hours * 60 + $end_minutes;
    
    // Check if current time is between start and end times
    return $current_time_in_minutes >= $start_time_in_minutes && $current_time_in_minutes <= $end_time_in_minutes;
}

/**
 * Include the CORS handler
 * Load this at the appropriate hook to avoid "loaded too early" warnings
 */
function weekly_offer_scheduler_load_cors_handler() {
    require get_template_directory() . '/inc/weekly-offers-cors.php';
}
add_action('init', 'weekly_offer_scheduler_load_cors_handler', 5);

/**
 * Debug function to check if CSS files exist
 */
function weekly_offer_scheduler_debug_css() {
    if (current_user_can('manage_options')) {
        $theme_dir = get_template_directory();
        $css_files = array(
            'main.css' => file_exists($theme_dir . '/css/main.css'),
            'calendar.css' => file_exists($theme_dir . '/css/calendar.css'),
            'modal.css' => file_exists($theme_dir . '/css/modal.css')
        );
        
        echo '<!-- CSS Debug: ';
        print_r($css_files);
        echo ' -->';
    }
}
add_action('wp_head', 'weekly_offer_scheduler_debug_css', 999);
