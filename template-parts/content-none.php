<?php
/**
 * Template part for displaying a message that posts cannot be found
 */
?>

<section class="no-results not-found">
    <header class="page-header">
        <h1 class="page-title"><?php esc_html_e('Nothing Found', 'weekly-offer-scheduler'); ?></h1>
    </header><!-- .page-header -->

    <div class="page-content">
        <?php
        if (is_search()) :
            ?>
            <p><?php esc_html_e('Sorry, but nothing matched your search terms. Please try again with some different keywords.', 'weekly-offer-scheduler'); ?></p>
            <?php
            get_search_form();
        else :
            ?>
            <p><?php esc_html_e('It seems we can&rsquo;t find what you&rsquo;re looking for. Perhaps searching can help.', 'weekly-offer-scheduler'); ?></p>
            <?php
            get_search_form();
        endif;
        ?>
    </div><!-- .page-content -->
</section><!-- .no-results -->
