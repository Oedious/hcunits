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

  static isType(type) {
    return type  == "character";
  }

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
    var specialPowersHtml = this.drawSpecialPowers_();
    var cardHeight = this.getCardHeight_();
    var borderColor = this.isTeamUp_() ? COLOR_BLUE : COLOR_BLACK;
    var html = `
      <div id='characterCard' style='height:${cardHeight}px;'>
        <div id='characterCardBorders' style='border-color:${borderColor};'></div>
        <div id='characterHeader'>
          <div id='characterName'>${escapeHtml(this.unit_.name).toUpperCase()}</div>
          <div id='characterKeywords'>${this.drawKeywords_()}</div>
        </div>
        <div id='characterRealName'>REAL NAME: ${escapeHtml(this.unit_.real_name).toUpperCase()}</div>
        ${this.drawCollectorNumber_()}
        ${this.drawToken_()}
        ${specialPowersHtml}
        ${this.drawDial_()}
        ${this.drawTeamAbilities_()}
        ${super.drawPointValues_()}
        <div id='characterHeroClixLogoClip'>
          <img id='characterHeroClixLogo' src='images/heroclix_logo_small.png' alt=''/>
        </div>
      </div>`;

  	document.getElementById('unitContainer').innerHTML = html;
  }
  
  isTeamUp_() {
    return this.unit_.special_powers.length > 0 &&
        this.unit_.special_powers[0].name.startsWith("TEAM UP:");
  }
  
  getCardHeight_() {
    const MIN_CARD_HEIGHT = 525;
    const PIXELS_PER_LINE = 14;
    var cardHeight = MIN_CARD_HEIGHT + PIXELS_PER_LINE * this.extraLines_;
    if (this.unit_.dial_size > 12) {
      cardHeight += 135
    }
    return cardHeight;
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
  		var escapedKeyword = escapeHtml(keyword);
  		var atag = `<a href='' class='characterKeyword' onclick='mgr.searchByKeyword("${escapedKeyword}"); return false;'>${escapedKeyword}</a>`;;
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
  
  drawCollectorNumber_() {
    var text;
    if (this.isTeamUp_()) {
      text = `<span id='characterTeamUp'>TEAM UP</span>&nbsp;&nbsp;&nbsp;${this.unit_.collector_number}`;
    } else {
      text = this.unit_.collector_number;
    }
    return `<div id='characterCollectorNumber'>${text}</div>`;
  }
  
  drawToken_() {
    var color = "black";
    if (this.unit_.special_type) {
      color = SPECIAL_TYPE_TO_COLOR[this.unit_.special_type];
    } else if (this.isTeamUp_()) {
      color = COLOR_BLUE;
    }
    var html =
      `<div id='characterTokenCircle' style='border: 7px solid ${color};'>
        <img id='characterTokenImg' src='images/${this.unit_.set_id}/${this.unit_.unit_id}.png' alt='' onerror='this.style.display=\"none\"'/>
      </div>`
    return html;
  }
  
  drawTeamAbilities_() {
    if (!this.unit_.team_abilities) {
      return '';
    }
    var bottom = 70;
    if (this.unit_.dial_size > 12) {
      bottom += 135
    }
    var html = `<div id='characterTeamAbilities' style='bottom:${bottom}px'>`
    for (var i = 0; i < this.unit_.team_abilities.length; ++i) {
      var teamAbility = TEAM_ABILITY_LIST[this.unit_.team_abilities[i]];
      html += `
        <div id='characterTeamAbility${i}' class='tooltip'>
          <img src='images/ta_${this.unit_.team_abilities[i]}.png' alt=''/>
          <span class='tooltiptext'>${escapeHtml(teamAbility.description)}</span>
        </div>
        `;
    }
    html += "</div>"
    return html;
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
        if (type == "speed" || type == "attack" || type == "defense" || type == "damage") {
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
              <img class='unitSpecialPowerIcon' src='images/sp_${type}.png' alt=''/>
              <div class='unitSpecialPowerPointValue'>+${power.point_value} POINTS</div>`;
          } else if (type == "rally_trait") {
            iconHtml = `
              <div class='unitSpecialPowerRally' style='${RALLY_TYPE_TO_STYLE[power.rally_type]}'>
                <img class='unitSpecialPowerIcon' src='images/sp_trait.png' alt=''/>
                <img class='unitSpecialPowerRallyDie' src='images/d6_${power.rally_die}.png' alt='${power.rally_die}'/>
              </div>`;
          } else if (type == "plus_plot_points" || type == "minus_plot_points") {
            var textColor = type == "plus_plot_points" ? "white" : "black";
            iconHtml = `
              <div style='position: relative;'>
                <img class='unitSpecialPowerIcon' src='images/sp_${type}.png' alt=''/>
                <div class='unitSpecialPowerPlotPoints' style='color:${textColor};'>${Math.abs(power.plot_points)}</div>
              </div>`;
          } else {
            iconHtml = `<img class='unitSpecialPowerIcon' src='images/sp_${type}.png' alt=''/>`;
          }
          html += `
            <tr class='unitSpecialPowerRow'>
              <td class='unitSpecialPowerImg'>${iconHtml}</td>
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
    if (this.unit_.dial_size <= 12) {
       var numTables = 1;
       var tableCols = [{"start": 0, "end": this.unit_.dial_size}];
       var bottom = [70];
    } else if (this.unit_.dial_size <= 26) {
      var numTables = 2;
      var tableCols = [
        {"start": 0, "end": 12},
        {"start": 12, "end": this.unit_.dial_size}
      ];
      var bottom = [205, 70];
    } else {
      console.log(`Cannot draw dial for unit ${this.unit_.unit_id}: too many clicks (${this.unit_.dial_size})`)
      return "";
    }
    var html = "";
    var tableDialStart = 0;
    for (var t = 0; t < numTables; ++t) {
      var bottom = 70 + 135 * (numTables - t - 1);
      var borderWidth = 49 + 23 * (tableCols[t].end - tableCols[t].start);
      var tableWidth = 4 + 23 * (tableCols[t].end - tableCols[t].start);
      html += `
        <div class='characterDial' style='bottom:${bottom}px;width:${borderWidth}px;'>
        <div class='combatSymbol'>
          <div class='characterRange'>${this.unit_.unit_range}</div>`;
      for (var i = 0; i < this.unit_.targets; ++i) {
        html += `<img class='characterBolt' src='images/cs_bolt.png' alt='' height='12' width='6' style='left: ${10 + i * 4}px;'\>`;
      }
      html += `
        </div>
        <div class='combatSymbol' style='position:absolute;top:24px;'>
          <img class='characterCombatSymbolImg' src='images/cs_${this.unit_.speed_type}.png'/>
        </div>
        <div class='combatSymbol' style='position:absolute;top:48px;'>
          <img class='characterCombatSymbolImg' src='images/cs_${this.unit_.attack_type}.png'/>
        </div>
        <div class='combatSymbol' style='position:absolute;top:72px;'>
          <img class='characterCombatSymbolImg' src='images/cs_${this.unit_.defense_type}.png'/>
        </div>
        <div class='combatSymbol' style='position:absolute;top:96px;'>
          <img class='characterCombatSymbolImg' src='images/cs_${this.unit_.damage_type}.png'/>
        </div>
        <table class='characterDialTable' style='width:${tableWidth}px'>`;
    
      html += "<tr class='characterDialRow'>";
      for (var col = tableCols[t].start; col < tableCols[t].end; ++col) {
        html += `<th class='characterDialHeader'>${col + 1}</th>`;
      }
      html += "</tr>";
      var currentClick;
      for (var row = 0; row < 4; ++row) {
        var rowType = ['speed', 'attack', 'defense', 'damage'][row];
        html += "<tr class='characterDialRow'>";
        currentClick = tableDialStart;
        for (var col = tableCols[t].start; col < tableCols[t].end; ++col) {
          if (currentClick < this.unit_.dial.length &&
              col == this.unit_.dial[currentClick].click_number) {
            var power = this.unit_.dial[currentClick][rowType + '_power'];
            var value = this.unit_.dial[currentClick][rowType + '_value'];
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
            ++currentClick;
          } else {
            html += "<td class='unitDialEntryKO'>KO</td>";
          }
        }
        html += "</tr>";
      }
      html += "</table>";

      // The end of the dial is indicated by the last click processed.
      var tableDialEnd = currentClick;
      var currentLine = 0;
      for (var click = tableDialStart; click < tableDialEnd; ++click) {
        if (this.unit_.dial[click].starting_line) {
          var left = 31 + 23 * this.unit_.dial[click].click_number;
          var color = STARTING_LINE_COLORS[this.unit_.point_values.length][currentLine++];
          html += `<div class='characterDialStartingLine' style='left: ${left}px; background-color: ${color}'></div>`
        }
      }
      // Update the starting click for the next table.
      tableDialStart = tableDialEnd;
      html += "</div>"
    }
    return html;
  }
}