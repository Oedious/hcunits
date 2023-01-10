global $wpdb;
echo $wpdb->get_results("SELECT id, name, universe FROM {$wpdb->prefix}sets ORDER BY release_date DESC");
