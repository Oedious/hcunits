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
    teamAbilitiesHtml += `<img id='unitTeamAbility${i}' src='wp-content/uploads/ta_${this.team_abilities[i]}.png' alt='TA0'/>`;
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
      <img id='unitHeroClixLogo' src='wp-content/uploads/heroclix_logo_small.png' alt=''/>
    </div>
    <div id='unitBack'>
      <div id='unitBackBorders'></div>
      Unit Back
    </div>`;
	document.getElementById('unitContainer').innerHTML = html;
}

Unit.prototype.drawDial_ = function() {
  var dialHtml = `
    <div id='unitSymbol0' class='unitSymbol'></div>
    <div id='unitSymbol1' class='unitSymbol'></div>
    <div id='unitSymbol2' class='unitSymbol'></div>
    <div id='unitSymbol3' class='unitSymbol'></div>
    <div id='unitSymbol4' class='unitSymbol'></div>
    <table id='unitDialTable'>`;

  dialHtml += `<tr class='unitDialRow'>`;
  for (var col = 0; col < this.dial_size; ++col) {
    dialHtml += `<th class='unitDialHeader'>${col + 1}</th>`;
  }
  dialHtml += `</tr>`;
  for (var row = 0; row < 4; ++row) {
    dialHtml += `<tr class='unitDialRow'>`;
    for (var col = 0; col < this.dial_size; ++col) {
      dialHtml += `<td class='unitDialEntry'></td>`;
    }
    dialHtml += `</tr>`;
  }
  dialHtml += `</table>`;
  return dialHtml;
}
