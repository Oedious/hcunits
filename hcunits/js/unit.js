const PIXELS_PER_LINE = 15;
const MIN_CARD_HEIGHT = 525;

var Unit = function(json) {
  Object.assign(this, json);
  this.extraLines_ = 0;
}

Unit.prototype.draw = function() {
  // Compute the special powers HTML first because it may need to resize the
  // entire card to fit the text.
  var specialPowersHtml = this.drawSpecialPowers_();
  var cardHeight = MIN_CARD_HEIGHT + PIXELS_PER_LINE * this.extraLines_;
  var html = `
    <div id='unitFront' style='height:${cardHeight}px;'>
      <div id='unitFrontBorders'></div>
      <div id='unitHeader'>
        <div id='unitName'>${escapeHtml(this.name).toUpperCase()}</div>
        <div id='unitKeywords'>${this.drawKeywords_()}</div>
      </div>
      <div id='unitRealName'>REAL NAME: ${escapeHtml(this.real_name).toUpperCase()}</div>
      <div id='unitCollectorNumber'>${this.collector_number}</div>
      <div id='unitImage'></div>
      <div id='unitSpecialPowers'>${specialPowersHtml}<div>
      <div id='unitDial'>${this.drawDial_()}</div>
      <div id='unitTeamAbilities'>${this.drawTeamAbilities_()}</div>
      <div id='unitPointValue'>POINT VALUE: ${this.point_value}</div>
      <div id='unitHeroClixLogoClip'>
        <img id='unitHeroClixLogo' src='../hcunits/images/heroclix_logo_small.png' alt=''/>
      </div>
    </div>`;
    /*
    <div id='unitBack'>
      <div id='unitBackBorders'></div>
      Unit Back
    </div>
    */
    
	document.getElementById('unitContainer').innerHTML = html;
}

Unit.prototype.drawKeywords_ = function() {
	if (!this.keywords) {
	  return '';
	}
	var html = `<span class='unitKeyword'>`;
	var first = true;
	for (var keyword of this.keywords) {
		if (first) {
			first = false;
		} else {
			html += ', ';
		}
		var atag = `<a href='' class='unitKeyword' onclick='mgr.searchByKeyword("${escapeHtml(keyword)}"); return false;'>${keyword}</a>`;;
		var isGeneric = (KEYWORD_LIST[keyword] == "generic");
		if (isGeneric) {
		  html += `<em>${atag}</em>`;
		} else {
		  html += atag;
		}
	}
	html += `</span>`;
  return html;
}

Unit.prototype.drawTeamAbilities_ = function() {
  if (!this.team_abilities) {
    return '';
  }
  var teamAbilitiesHtml = '';
  for (var i = 0; i < this.team_abilities.length; ++i) {
    var teamAbility = TEAM_ABILITY_LIST[this.team_abilities[i]];
    teamAbilitiesHtml += `
      <div id='unitTeamAbility${i}' class='tooltip'>
        <img src='../hcunits/images/ta_${this.team_abilities[i]}.png' alt=''/>
        <span class='tooltiptext'>${escapeHtml(teamAbility.description)}</span>
      </div>
      `;
  }
  return teamAbilitiesHtml;
}

Unit.prototype.drawSpecialPowers_ = function() {
  if (!this.special_powers) {
    return '';
  }
  var layoutSuccessful = false;
  // Start out with a minimum lines per each column and try to fit into that.
  // If it's not enough, slowly increase the size of the card until it all fits.
  this.extraLines_ = 0;
  const LINES_PER_COL = [16, 9, 0];
  const CHARS_PER_NAME_LINE = 23;
  const CHARS_PER_DESC_LINE = 32;
  const PIXELS_PER_LINE = 14;
  while (!layoutSuccessful) {
    var html = `<table id='unitSpecialPowersTable0' class='unitSpecialPowersTable'>`;
    var linesPerCol = [0, 0];
    var currentColumn = 0;
    var currentPower = 0;
    for (var i = 0; i < this.special_powers.length && currentColumn < 2; ++i) {
      var power = this.special_powers[i];
      var type = power.type;
      if (type != "trait" && type != "costed_trait") {
        type = this[type + "_type"];
      }
      pointValue = ""
      if (power.point_value) {
        pointValue = `<div class='unitSpecialPower'>+${power.point_value} POINTS</div>`
      }
      
      var headerLines = Math.ceil(power.name.length / CHARS_PER_NAME_LINE);
      var descLines = Math.ceil(power.description.length / CHARS_PER_DESC_LINE);
      var lines = headerLines + descLines;
      // console.log(`Estimated headerLines=${headerLines} descLines=${descLines} for power #${currentPower}`)

      // If the line count surpasses the max in the first column, move to the
      // 2nd column. If it's already there, then increase the size and redo the
      // layout.
      if (currentColumn == 0) {
        if (linesPerCol[currentColumn] + lines > LINES_PER_COL[currentColumn] + this.extraLines_) {
          // Try to move to the 2nd column.
          ++currentColumn;
          html += `
            </table>
            <table id='unitSpecialPowersTable1' class='unitSpecialPowersTable'>`;
        }
      }
      if (currentColumn == 1) {
        if (linesPerCol[currentColumn] + lines > LINES_PER_COL[currentColumn] + this.extraLines_) {
          // Couldn't fit into 2 columns - add a line and redo the layout.
          ++currentColumn;
        }
      }
      if (currentColumn < 2) {
        linesPerCol[currentColumn] += lines + 1;
        html += `
          <tr class='unitSpecialPowerRow'>
            <td class='unitSpecialPower'>
              <img src='../hcunits/images/sp_${type}.png' alt=''/>
              ${pointValue}
            </td>
            <td class='unitSpecialPower'><b>${escapeHtml(power.name.toUpperCase())}</b><br>${escapeHtml(power.description)}</td>
          </tr>`;
      }
      ++currentPower;
    }
    if (currentColumn < 2) {
      layoutSuccessful = true;
    } else {
      ++this.extraLines_;
    }
  }
  html += `</table>`
  return html;
}

Unit.prototype.drawDial_ = function() {
  var html = `
    <div class='unitCombatSymbol'>
      <div id='unitRange'>${this.unit_range}</div>`;
  for (var i = 0; i < this.targets; ++i) {
    html += `<img class='unitBolt' src='../hcunits/images/cs_bolt.png' alt='' height='12' width='6' style='left: ${10 + i * 4}px;'\>`;
  }
  html += `
    </div>
    <div id='unitCombatSymbolSpeed' class='unitCombatSymbol'>
      <img class='unitCombatSymbolImg' src='../hcunits/images/cs_${this.speed_type}.png'/>
    </div>
    <div id='unitCombatSymbolAttack' class='unitCombatSymbol'>
      <img class='unitCombatSymbolImg' src='../hcunits/images/cs_${this.attack_type}.png'/>
    </div>
    <div id='unitCombatSymbolDefense' class='unitCombatSymbol'>
      <img class='unitCombatSymbolImg' src='../hcunits/images/cs_${this.defense_type}.png'/>
    </div>
    <div id='unitCombatSymbolDamage' class='unitCombatSymbol'>
      <img class='unitCombatSymbolImg' src='../hcunits/images/cs_${this.damage_type}.png'/>
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
      var colOffset = col - (this.dial_start - 1);
      if (colOffset >= 0 && colOffset < this.dial.length) {
        var power = this.dial[colOffset][rowType + '_power'];
        var value = this.dial[colOffset][rowType + '_value'];
        if (power) {
          var powerObj = POWER_LIST[power];
          if (!powerObj) {
            powerObj = {
              name: 'Unknown power',
              style: 'color:black; background-color: white; border: 2px solid red;',
              description: power
            }
          }
          html += `
            <td class='unitDialEntry' style='${powerObj.style}'>
              <div class='tooltip'>
                <div>${value}</div>
                <span class='tooltiptext'><b>${powerObj.name}</b>: ${escapeHtml(powerObj.description)}</span>
              </div>
            </td>`;
        } else {
          html += `<td class='unitDialEntry'>${value}</td>`;
        }
      } else {
        html += `<td class='unitDialEntryKO'>KO</td>`;
      }
    }
    html += `</tr>`;
  }
  html += `</table>`;
  return html;
}
