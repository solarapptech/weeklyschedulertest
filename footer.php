<?php
/**
 * The template for displaying the footer
 */
?>

    <footer id="colophon" class="site-footer">
        <div class="site-info">
            <a href="<?php echo esc_url(__('https://wordpress.org/', 'weekly-offer-scheduler')); ?>">
                <?php
                /* translators: %s: CMS name, i.e. WordPress. */
                printf(esc_html__('Proudly powered by %s', 'weekly-offer-scheduler'), 'WordPress');
                ?>
            </a>
            <span class="sep"> | </span>
                <?php
                /* translators: 1: Theme name, 2: Theme author. */
                printf(esc_html__('Theme: %1$s by %2$s.', 'weekly-offer-scheduler'), 'Weekly Offer Scheduler', '<a href="https://yourwebsite.com">Your Name</a>');
                ?>
        </div><!-- .site-info -->
    </footer><!-- #colophon -->
</div><!-- #page -->

<?php wp_footer(); ?>

</body>
</html>
