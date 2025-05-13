<?php
/**
 * The header for our theme
 */
?>
<!doctype html>
<html <?php language_attributes(); ?>>
<head>
    <meta charset="<?php bloginfo('charset'); ?>">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <link rel="profile" href="https://gmpg.org/xfn/11">

    <?php wp_head(); ?>
    
    <!-- Inline critical CSS to ensure basic styling is visible immediately -->
    <style>
        :root {
          --primary: #3466f6;
          --primary-light: #5a84f8;
          --primary-dark: #2855d9;
          --accent: #ff9500;
          --success: #34c759;
          --warning: #ffcc00;
          --error: #ff3b30;
          --gray-50: #f8f9fa;
          --gray-100: #f1f3f5;
          --gray-200: #e9ecef;
          --gray-300: #dee2e6;
          --gray-400: #ced4da;
          --gray-500: #adb5bd;
          --gray-600: #6c757d;
          --gray-700: #495057;
          --gray-800: #343a40;
          --gray-900: #212529;
          --font-family: -apple-system, BlinkMacSystemFont, "SF Pro", "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji";
          --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
          --shadow-md: 0 4px 6px rgba(0, 0, 0, 0.05), 0 1px 3px rgba(0, 0, 0, 0.1);
          --shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.05), 0 4px 6px rgba(0, 0, 0, 0.05);
          --border-radius-sm: 6px;
          --border-radius-md: 8px;
          --border-radius-lg: 12px;
          --transition: all 0.2s ease;
          --space-1: 4px;
          --space-2: 8px;
          --space-3: 16px;
          --space-4: 24px;
          --space-5: 32px;
          --space-6: 48px;
        }

        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        body {
          font-family: var(--font-family);
          color: var(--gray-900);
          background-color: var(--gray-50);
          line-height: 1.5;
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
        }

        .container {
          max-width: 1200px;
          margin: 0 auto;
          padding: var(--space-4);
        }

        header {
          margin-bottom: var(--space-4);
        }

        h1 {
          font-size: 2.5rem;
          font-weight: 700;
          margin-bottom: var(--space-2);
          color: var(--gray-900);
        }

        .site-header {
          background-color: white;
          box-shadow: var(--shadow-md);
          padding: var(--space-3) 0;
          margin-bottom: var(--space-4);
        }

        .site-branding {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 var(--space-4);
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .site-title {
          font-size: 1.5rem;
          margin: 0;
        }

        .site-title a {
          color: var(--gray-900);
          text-decoration: none;
        }
    </style>
</head>

<body <?php body_class(); ?>>
<?php wp_body_open(); ?>
<div id="page" class="site">
    <header id="masthead" class="site-header">
        <div class="site-branding">
            <?php
            the_custom_logo();
            if (is_front_page() && is_home()) :
                ?>
                <h1 class="site-title"><a href="<?php echo esc_url(home_url('/')); ?>" rel="home"><?php bloginfo('name'); ?></a></h1>
                <?php
            else :
                ?>
                <p class="site-title"><a href="<?php echo esc_url(home_url('/')); ?>" rel="home"><?php bloginfo('name'); ?></a></p>
                <?php
            endif;
            $weekly_offer_scheduler_description = get_bloginfo('description', 'display');
            if ($weekly_offer_scheduler_description || is_customize_preview()) :
                ?>
                <p class="site-description"><?php echo $weekly_offer_scheduler_description; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?></p>
            <?php endif; ?>
        </div><!-- .site-branding -->

        <nav id="site-navigation" class="main-navigation">
            <button class="menu-toggle" aria-controls="primary-menu" aria-expanded="false"><?php esc_html_e('Primary Menu', 'weekly-offer-scheduler'); ?></button>
            <?php
            wp_nav_menu(
                array(
                    'theme_location' => 'menu-1',
                    'menu_id'        => 'primary-menu',
                )
            );
            ?>
        </nav><!-- #site-navigation -->
    </header><!-- #masthead -->
