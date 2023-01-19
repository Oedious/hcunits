const SPECIAL_TYPE_TO_COLOR = {
  "unique": "silver",
  "prime": COLOR_GREEN,
  "title_character": COLOR_BLACK
};

const RALLY_TYPE_TO_STYLE = {
  "friendly": STYLE_BLUE,
  "opposing": STYLE_RED,
  "all": STYLE_GREEN
}

class CharacterView extends UnitView {

  constructor(unitJson) {
    super(unitJson)
    this.extraLines_ = 0;
    if (this.unit_.type != "character") {
      throw new Error("Mismatched unit type: CharacterViews require type=character")
    }
  }
  
  draw() {
    // Compute the special powers HTML first because it may need to resize the
    // entire card to fit the text.
    const MIN_CARD_HEIGHT = 525;
    const PIXELS_PER_LINE = 14;
    var specialPowersHtml = this.drawSpecialPowers_();
    var cardHeight = MIN_CARD_HEIGHT + PIXELS_PER_LINE * this.extraLines_;
    var html = `
      <div id='characterCard' style='height:${cardHeight}px;'>
        <div id='characterCardBorders'></div>
        <div id='characterHeader'>
          <div id='characterName'>${escapeHtml(this.unit_.name).toUpperCase()}</div>
          <div id='characterKeywords'>${this.drawKeywords_()}</div>
        </div>
        <div id='characterRealName'>REAL NAME: ${escapeHtml(this.unit_.real_name).toUpperCase()}</div>
        <div id='characterCollectorNumber'>${this.unit_.collector_number}</div>
        ${this.drawImage_()}
        ${specialPowersHtml}
        <div id='characterDial'>${this.drawDial_()}</div>
        <div id='characterTeamAbilities'>${this.drawTeamAbilities_()}</div>
        <div id='characterPointValue'>POINT VALUE: ${this.unit_.point_value}</div>
        <div id='characterHeroClixLogoClip'>
          <img id='characterHeroClixLogo' src='../hcunits/images/heroclix_logo_small.png' alt=''/>
        </div>
      </div>`;

  	document.getElementById('unitContainer').innerHTML = html;
  }
  
  drawKeywords_() {
  	if (!this.unit_.keywords) {
  	  return '';
  	}
  	var html = "<span class='characterKeyword'>";
  	var first = true;
  	for (var keyword of this.unit_.keywords) {
  		if (first) {
  			first = false;
  		} else {
  			html += ', ';
  		}
  		var atag = `<a href='' class='characterKeyword' onclick='mgr.searchByKeyword("${escapeHtml(keyword)}"); return false;'>${keyword}</a>`;;
  		var isGeneric = (KEYWORD_LIST[keyword] == "generic");
  		if (isGeneric) {
  		  html += `<em>${atag}</em>`;
  		} else {
  		  html += atag;
  		}
  	}
  	html += "</span>";
    return html;
  }
  
  drawImage_() {
    var color = "black";
    if (this.unit_.special_type) {
      color = SPECIAL_TYPE_TO_COLOR[this.unit_.special_type];
    }
    var html = `<div id='characterImage' style='border: 7px solid ${color};'></div>`
    return html;
  }
  
  drawTeamAbilities_() {
    if (!this.unit_.team_abilities) {
      return '';
    }
    var teamAbilitiesHtml = '';
    for (var i = 0; i < this.unit_.team_abilities.length; ++i) {
      var teamAbility = TEAM_ABILITY_LIST[this.unit_.team_abilities[i]];
      teamAbilitiesHtml += `
        <div id='characterTeamAbility${i}' class='tooltip'>
          <img src='../hcunits/images/ta_${this.unit_.team_abilities[i]}.png' alt=''/>
          <span class='tooltiptext'>${escapeHtml(teamAbility.description)}</span>
        </div>
        `;
    }
    return teamAbilitiesHtml;
  }
  
  drawSpecialPowers_() {
    if (!this.unit_.special_powers) {
      return '';
    }
    var layoutSuccessful = false;
    // Start out with a minimum lines per each column and try to fit into that.
    // If it's not enough, slowly increase the size of the card until it all fits.
    this.extraLines_ = 0;
    const LINES_PER_COL = [16, 9, 0];
    const CHARS_PER_NAME_LINE = 23;
    const CHARS_PER_DESC_LINE = 30;
    while (!layoutSuccessful) {
      var html = "<table id='characterSpecialPowersTable0' class='unitSpecialPowersTable'>";
      var linesPerCol = [0, 0];
      var currentColumn = 0;
      var currentPower = 0;
      for (var i = 0; i < this.unit_.special_powers.length && currentColumn < 2; ++i) {
        var power = this.unit_.special_powers[i];
        var type = power.type;
  
        // Handling for special trait types
        if (type != "trait" && type != "costed_trait" && type != "rally_trait") {
          type = this.unit_[type + "_type"];
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
              <table id='characterSpecialPowersTable1' class='unitSpecialPowersTable'>`;
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
          var iconHtml = "";
          if (type == "costed_trait") {
            iconHtml = `
              <img class='unitSpecialPowerIcon' src='../hcunits/images/sp_${type}.png' alt=''/>
              <div class='unitSpecialPowerPointValue'>+${power.point_value} POINTS</div>`;
          } else if (type == "rally_trait") {
            iconHtml = `
              <div class='unitSpecialPowerRally' style='${RALLY_TYPE_TO_STYLE[power.rally_type]}'>
                <img class='unitSpecialPowerIcon' src='../hcunits/images/sp_trait.png' alt=''/>
                <img class='unitSpecialPowerRallyDie' src='../hcunits/images/d6_${power.rally_die}.png' alt='${power.rally_die}'/>
              </div>`;
          } else {
            iconHtml = `<img class='unitSpecialPowerIcon' src='../hcunits/images/sp_${type}.png' alt=''/>`;
          }
          html += `
            <tr class='unitSpecialPowerRow'>
              <td class='unitSpecialPower'>${iconHtml}</td>
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
    html += "</table>"
    return html;
  }
  
  drawDial_() {
    var html = `
      <div class='combatSymbol'>
        <div id='characterRange'>${this.unit_.unit_range}</div>`;
    for (var i = 0; i < this.unit_.targets; ++i) {
      html += `<img class='characterBolt' src='../hcunits/images/cs_bolt.png' alt='' height='12' width='6' style='left: ${10 + i * 4}px;'\>`;
    }
    html += `
      </div>
      <div id='characterCombatSymbolSpeed' class='combatSymbol'>
        <img class='characterCombatSymbolImg' src='../hcunits/images/cs_${this.unit_.speed_type}.png'/>
      </div>
      <div id='characterCombatSymbolAttack' class='combatSymbol'>
        <img class='characterCombatSymbolImg' src='../hcunits/images/cs_${this.unit_.attack_type}.png'/>
      </div>
      <div id='characterCombatSymbolDefense' class='combatSymbol'>
        <img class='characterCombatSymbolImg' src='../hcunits/images/cs_${this.unit_.defense_type}.png'/>
      </div>
      <div id='characterCombatSymbolDamage' class='combatSymbol'>
        <img class='characterCombatSymbolImg' src='../hcunits/images/cs_${this.unit_.damage_type}.png'/>
      </div>
      <table id='characterDialTable'>`;
  
    html += "<tr class='characterDialRow'>";
    for (var col = 0; col < this.unit_.dial_size; ++col) {
      html += `<th class='characterDialHeader'>${col + 1}</th>`;
    }
    html += "</tr>";
    for (var row = 0; row < 4; ++row) {
      var rowType = ['speed', 'attack', 'defense', 'damage'][row];
      html += "<tr class='characterDialRow'>";
      for (var col = 0; col < this.unit_.dial_size; ++col) {
        var colOffset = col - (this.unit_.dial_start - 1);
        if (colOffset >= 0 && colOffset < this.unit_.dial.length) {
          var power = this.unit_.dial[colOffset][rowType + '_power'];
          var value = this.unit_.dial[colOffset][rowType + '_value'];
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
          html += "<td class='unitDialEntryKO'>KO</td>";
        }
      }
      html += "</tr>";
    }
    html += "</table>";
    return html;
  }
}