function search_by_set_id() {
	global $wpdb;
	$set_id = $_POST['set_id'];
	$response = $wpdb->get_results(<<<EOD
		SELECT unit_id, set_id, name, collector_number, point_values, rarity
		FROM {$wpdb->prefix}units
		WHERE set_id = '$set_id'
	EOD);

  foreach($unit as $response) {
  	$unit->point_values = json_decode($unit->point_values);
  }
	echo json_encode($response);
	wp_die();
}

add_action('wp_ajax_search_by_set_id', 'search_by_set_id');
add_action('wp_ajax_nopriv_search_by_set_id', 'search_by_set_id');

function search_by_unit_id() {
	global $wpdb;
	$unit_id = $_POST['unit_id'];
	$response = $wpdb->get_row(<<<EOD
		SELECT *
		FROM {$wpdb->prefix}units
		WHERE unit_id = '$unit_id'
	EOD);
	// Deserialize JSON fields, in place.
	$response->point_values = json_decode($response->point_values);
	$response->team_abilities = json_decode($response->team_abilities);
	$response->keywords = json_decode($response->keywords);
	$response->special_powers = json_decode($response->special_powers);
	$response->improved_movement = json_decode($response->improved_movement);
	$response->improved_targeting = json_decode($response->improved_targeting);
	$response->object_keyphrases = json_decode($response->object_keyphrases);
	$response->dial = json_decode($response->dial);
	echo json_encode($response);
	wp_die();
}

add_action('wp_ajax_search_by_unit_id', 'search_by_unit_id');
add_action('wp_ajax_nopriv_search_by_unit_id', 'search_by_unit_id');