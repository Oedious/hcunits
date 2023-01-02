function search_by_set() {
	global $wpdb;
	$set_id = $_POST['set_id'];
	$response = $wpdb->get_results(<<<EOD
		SELECT unit_id, name, collector_number, points, rarity
		FROM {$wpdb->prefix}units
		WHERE set_id = '$set_id'
	EOD);
	echo json_encode($response);
	wp_die();
}

add_action('wp_ajax_search_by_set', 'search_by_set');
add_action('wp_ajax_nopriv_search_by_set', 'search_by_set');