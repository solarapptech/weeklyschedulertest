<?php
/**
 * Template part for displaying posts
 */
?>

<article id="post-<?php the_ID(); ?>" <?php post_class(); ?>>
    <header class="entry-header">
        <?php
        if (is_singular()) :
            the_title('<h1 class="entry-title">', '</h1>');
        else :
            the_title('<h2 class="entry-title"><a href="' . esc_url(get_permalink()) . '" rel="bookmark">', '</a></h2>');
        endif;

        if ('post' === get_post_type()) :
            ?>
            <div class="entry-meta">
                <?php
                echo '<span class="posted-on">' . esc_html(get_the_date()) . '</span>';
                ?>
            </div><!-- .entry-meta -->
        <?php endif; ?>
    </header><!-- .entry-header -->

    <?php if (has_post_thumbnail()) : ?>
        <div class="post-thumbnail">
            <?php the_post_thumbnail('large'); ?>
        </div>
    <?php endif; ?>

    <div class="entry-content">
        <?php
        if (is_singular()) :
            the_content();
        else :
            the_excerpt();
            ?>
            <a href="<?php echo esc_url(get_permalink()); ?>" class="read-more">
                <?php esc_html_e('Read More', 'weekly-offer-scheduler'); ?>
            </a>
        <?php endif; ?>
    </div><!-- .entry-content -->

    <footer class="entry-footer">
        <?php
        if ('post' === get_post_type()) {
            // Hide category and tag text for pages.
            $categories_list = get_the_category_list(', ');
            if ($categories_list) {
                echo '<span class="cat-links">' . $categories_list . '</span>';
            }

            $tags_list = get_the_tag_list('', ', ');
            if ($tags_list) {
                echo '<span class="tags-links">' . $tags_list . '</span>';
            }
        }
        ?>
    </footer><!-- .entry-footer -->
</article><!-- #post-<?php the_ID(); ?> -->
