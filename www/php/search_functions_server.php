function search_by_set_id() {
	global $wpdb;
	$set_id = $_POST['set_id'];
	$response = $wpdb->get_results(<<<EOD
		SELECT unit_id, name, collector_number, point_value, rarity
		FROM {$wpdb->prefix}units
		WHERE set_id = '$set_id'
	EOD);
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
	$response->team_abilities = json_decode($response->team_abilities);
	$response->keywords = json_decode($response->keywords);
	$response->trait_0 = json_decode($response->trait_0);
	$response->trait_1 = json_decode($response->trait_1);
	$response->trait_2 = json_decode($response->trait_2);
	$response->speed_special_power = json_decode($response->speed_special_power);
	$response->attack_special_power = json_decode($response->attack_special_power);
	$response->defense_special_power = json_decode($response->defense_special_power);
	$response->damage_special_power = json_decode($response->damage_special_power);
	$response->improved_movement = json_decode($response->improved_movement);
	$response->improved_targeting = json_decode($response->improved_targeting);
	$response->dial = json_decode($response->dial);
	echo json_encode($response);
	wp_die();
}

add_action('wp_ajax_search_by_unit_id', 'search_by_unit_id');
add_action('wp_ajax_nopriv_search_by_unit_id', 'search_by_unit_id');