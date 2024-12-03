<!DOCTYPE html>
<html>
<head>
    <title><?php wp_title(); ?></title>
    <?php wp_head(); ?>
</head>
<body>
    <header>
        <h1><?php bloginfo('name'); ?></h1>
    </header>

    <main>
        <?php
        if (have_posts()) {
            while (have_posts()) {
                the_post();
                echo '<h1>' . get_the_title() . '</h1>';
                echo '<div>' . get_the_content() . '</div>';
            }
        }
        ?>
    </main>

    <footer>
        <p>&copy; <?php echo date('Y'); ?> <?php bloginfo('name'); ?></p>
    </footer>

    <?php wp_footer(); ?>
</body>
</html>
