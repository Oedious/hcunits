global $wpdb;
$setList = $wpdb->get_results("SELECT id, name, universe FROM {$wpdb->prefix}sets ORDER BY release_date DESC");
foreach ($setList as $set) {
	switch ($set->universe) {
		case "dc":
			$universe_color = "blue";
			break;
		case "marvel":
			$universe_color = "red";
			break;
		case "indy":
			$universe_color = "green";
			break;
		default:
			$universe_color = "purple";
			break;
	}
	echo <<<EOD
	<div class='setItem' style='border-bottom: 2px solid $universe_color;'>
		<span class='setItemLink' onclick='searchBySetId("$set->id")'>
			<img class='setIcon' src='/wp-content/uploads/set_$set->id.png' alt='$set->id' title='$set->name'/>
			<div class='setName'>$set->id</div>
		</span>
	</div>
	EOD;
}