// TODO: Query database for this info
$owner = "UserMan";
$name = "";
$description = "";
$format = "";  // "modern", "golden", "
$point_limit = "";
$visibility = "public";  // vs "unlisted".

$html = <<<EOD
	<div id="teamHeader">
		<div id="teamOwner">$owner</div>
		<input type="text" class="teamInput" id="teamName" size="80%" value="$name" placeholder="Team Name"/>
		<input type="text" class="teamInput" size="80%" value="$description" placeholder="Description"/>
		<div>
			<input type="number" class="teamInput" id="teamPointLimit" min="0" max="9999" value="$point_limit" placeholder="Points"/>
			<select class="teamSelect" id="teamFormat">
				<option value="modern">Modern Age</option>
				<option value="golden">Golden Age</option>
			</select>
		</div>
		<select class="teamSelect" id="teamVisibility">
			<option value="unlisted">Unlisted</option>
			<option value="public">Public</option>
		</select>
	</div>
	EOD;
echo $html;