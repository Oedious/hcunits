var Unit = function(json) {
  Object.assign(this, json);
}

Unit.prototype.draw = function() {
	var keywordsHtml = '<span>';
	var first = true;
	for (var keyword of this.keywords) {
		if (first) {
			first = false;
		} else {
			keywordsHtml += ', </a>';
		}
		keywordsHtml +=
		  `<a href='' class='unitKeyword' onclick='mgr.searchByKeyword("${keyword}"); return false;'>${keyword}`;
	}
	keywordsHtml += '</a></span>';

  var teamAbilitiesHtml = '';
  for (var i = 0; i < this.team_abilities.length; ++i) {
    teamAbilitiesHtml += `<img id='unitTeamAbility${i}' src='../wp-content/uploads/ta_${this.team_abilities[i]}.png' alt=''/>`;
  }

  var html = `
    <div id='unitFront'>
      <div id='unitFrontBorders'></div>
      <div id='unitName'>${this.name.toUpperCase()}</div>
      <div id='unitKeywords'>${keywordsHtml}</div>
      <div id='unitRealName'>REAL NAME: ${this.real_name.toUpperCase()}</div>
      <div id='unitCollectorNumber'>${this.collector_number}</div>
      <div id='unitImage'></div>
      <div id='unitDial'>${this.drawDial_()}</div>
      <div id='unitTeamAbilities'>${teamAbilitiesHtml}</div>
      <div id='unitPointValue'>POINT VALUE: ${this.point_value}</div>
      <img id='unitHeroClixLogo' src='../wp-content/uploads/heroclix_logo_small.png' alt=''/>
    </div>
    <div id='unitBack'>
      <div id='unitBackBorders'></div>
      Unit Back
    </div>`;
	document.getElementById('unitContainer').innerHTML = html;
}

Unit.prototype.drawDial_ = function() {
  var html = `
    <div class='unitTraitType'>
      <div id='unitRange'>${this.unit_range}</div>`;
  for (var i = 0; i < this.targets; ++i) {
    html += `<img class='unitBolt' src='../wp-content/uploads/bolt.png' alt='' style='left: ${20 + i * 5}px;'\>`;
  }
  html += `
    </div>
    <div id='unitSpeedType' class='unitTraitType'>
      <img class='unitTraitImg' src='../wp-content/uploads/${this.speed_type}.png'/>
    </div>
    <div id='unitAttackType' class='unitTraitType'>
      <img class='unitTraitImg' src='../wp-content/uploads/${this.attack_type}.png'/>
    </div>
    <div id='unitDefenseType' class='unitTraitType'>
      <img class='unitTraitImg' src='../wp-content/uploads/${this.defense_type}.png'/>
    </div>
    <div id='unitDamageType' class='unitTraitType'>
      <img class='unitTraitImg' src='../wp-content/uploads/${this.damage_type}.png'/>
    </div>
    <table id='unitDialTable'>`;

  html += `<tr class='unitDialRow'>`;
  for (var col = 0; col < this.dial_size; ++col) {
    html += `<th class='unitDialHeader'>${col + 1}</th>`;
  }
  html += `</tr>`;
  for (var row = 0; row < 4; ++row) {
    var rowType = ['speed', 'attack', 'defense', 'damage'][row];
    html += `<tr class='unitDialRow'>`;
    for (var col = 0; col < this.dial_size; ++col) {
      if ((col + 1) >= this.dial_start && col < this.dial.length) {
        var power = this.dial[col][rowType + '_power'];
        var style = '';
        if (power) {
          style = POWER_TO_STYLE[power];
        }
        var value = this.dial[col][rowType + '_value'];
        html += `<td class='unitDialEntry' style='${style}'>${value}</td>`;
      } else {
        html += `<td class='unitDialEntryKO'>KO</td>`;
      }
    }
    html += `</tr>`;
  }
  html += `</table>`;
  return html;
}
