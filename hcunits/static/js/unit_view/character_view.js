const RALLY_TYPE_TO_STYLE = {
  "friendly": STYLE_BLUE,
  "opposing": STYLE_RED,
  "all": STYLE_GREEN
};

class CharacterView extends BaseUnitView {

  static isType(type) {
    return type  == "character";
  }

  constructor(unit) {
    super(unit)
    if (!CharacterView.isType(this.unit_.type)) {
      throw new Error("Mismatched unit type: CharacterView require type='character'");
    }
    if (this.unit_.dial_size <= 12) {
      this.numDialTables_ = 1;
    } else if (this.unit_.dial_size <= 26) {
      this.numDialTables_ = 2;
    } else {
      throw new Error(`Cannot draw dial for unit ${this.unit_.unit_id}: too many clicks (${this.unit_.dial_size})`);
    }
  }
  
  draw() {
    // Compute the special powers HTML first because it will determine how many
    // cards we need to fully display everything.
    const specialPowersHtml = this.drawSpecialPowers_();
    const numCards = Math.max(1, Math.ceil(specialPowersHtml.length / 2));
    const borderColor = this.unit_.properties.includes("team_up") ? COLOR_BLUE : COLOR_BLACK;
    var html = `
      <div class='column'>
        <div id='unitCard0' class='largeCard'>
          <div class='largeCardBorders' style='border-top: 75px solid ${borderColor}'></div>
          <div id='largeCardHeader'>
            <div id='largeCardName'>${escapeHtml(this.unit_.name).toUpperCase()}</div>
            <div id='largeCardKeywords'>${this.drawKeywords_()}</div>
          </div>
          ${this.drawRealName_()}
          ${this.drawCollectorNumber_()}
          ${this.drawToken_()}
          ${this.drawImprovedAbilities_()}
          ${specialPowersHtml.length >= 1 ? specialPowersHtml[0] : ""}
          ${specialPowersHtml.length >= 2 ? specialPowersHtml[1] : ""}
          ${this.drawDial_()}
          ${this.drawTeamAbilities_()}
          ${super.drawPointValues_(40)}
          ${this.drawPassengers_()}
          <div class='largeCardHeroClixLogoClip'>
            <img class='largeCardHeroClixLogo' src='/static/images/logo/heroclix_logo_small.png' alt=''/>
          </div>
        </div>
      </div>`;

    // Draw extra cards to hold the additional special powers.
    for (var i = 1; i < numCards; ++i) {
      html += `
        <div class='column'>
          <div class='largeCard'>
            <div class='largeCardBorders' style='border-top: 20px solid ${borderColor}'></div>
            ${(i * 2) < specialPowersHtml.length ? specialPowersHtml[i * 2] : ""}
            ${(i * 2 + 1) < specialPowersHtml.length ? specialPowersHtml[i * 2 + 1] : ""}
            <div class='largeCardHeroClixLogoClip'>
              <img class='largeCardHeroClixLogo' src='/static/images/logo/heroclix_logo_small.png' alt=''/>
            </div>
          </div>
        </div>`;
    }

  	$('#unitCardsContainer').html(html);
  }
  
  drawKeywords_() {
  	if (!this.unit_.keywords) {
  	  return '';
  	}
  	var html = "<span class='largeCardKeyword'>";
  	var first = true;
  	for (var keyword of this.unit_.keywords) {
  		if (first) {
  			first = false;
  		} else {
  			html += ', ';
  		}
  		var escapedKeyword = escapeHtml(keyword);
  		if (READ_ONLY) {
  		  var keywordHtml = escapedKeyword;
  		} else {
  		  var keywordHtml = `<a href='' class='largeCardKeyword' onclick='sideNav.showSearchByKeywordResults("${escapedKeyword}"); return false;'>${escapedKeyword}</a>`;
  		}
  		var isGeneric = (KEYWORD_LIST[keyword] == "generic");
  		if (isGeneric) {
  		  html += `<em>${keywordHtml}</em>`;
  		} else {
  		  html += keywordHtml;
  		}
  	}
  	html += "</span>";
    return html;
  }

  drawRealName_() {
    if (!this.unit_.real_name) {
      return ""
    }
    return `
      <div id='largeCardRealName'>
        REAL NAME: ${escapeHtml(this.unit_.real_name).toUpperCase()}
      </div>`;
  }  

  drawCollectorNumber_() {
    const PROPERTY_NAMES = {
      "team_up": "TEAM_UP",
      "legacy": "LEGACY",
      "captain": "CAPTAIN",
      "sidekick": "SIDEKICK",
      "ally": "ALLY",
      "secret_identity": "SECRET IDENTITY",
    };
    var properties = "";
    for (const property of this.unit_.properties) {
      const name = PROPERTY_NAMES[property];
      if (!name) {
        continue;
      }

      if (properties != "") {
        properties += "/";
      }
      properties += name;
    }
    var text;
    if (properties != "") {
      text = `<span id='largeCardTeamUp'>${properties}</span>&nbsp;&nbsp;&nbsp;${this.unit_.collector_number}`;
    } else {
      text = this.unit_.collector_number;
    }
    return `<div id='largeCardCollectorNumber'>${text}</div>`;
  }
  
  drawToken_() {
    var color = "black";
    if (this.unit_.properties.includes("prime")) {
      color = COLOR_GREEN;
    } else if (this.unit_.properties.includes("unique")) {
      color = "silver";
    } else if (this.unit_.properties.includes("team_up")) {
      color = COLOR_BLUE;
    }
    var imgUrl = this.unit_.img_url;
    if (!imgUrl || imgUrl.length == 0) {
      imgUrl = "/static/images/misc/unknown.png";
    }
    return `
      <div id='largeCardToken'>
        <img id='largeCardTokenImg' src='${imgUrl}' alt='' onerror='this.style.display=\"none\"'/>
        <div id='largeCardTokenCircle' style='border: 11px solid ${color};'></div>
      </div>`;
  }

  drawImprovedAbilities_() {
    if (this.unit_.improved_movement.length == 0 &&
        this.unit_.improved_targeting.length == 0) {
      return "";
    }
    var html = "<div id='largeCardImprovedAbilities'>";
    // First iterate through each array and collect a list of all the symbols
    // that need to be drawn.
    var imp_info = [];
    if (this.unit_.improved_movement.length > 0) {
      imp_info.push({
        "url": "/static/images/imp/movement.png",
      });
    }
    for (const im of this.unit_.improved_movement) {
      const info = IMPROVED_MOVEMENT_LIST[im];
      imp_info.push({
        "tooltip": `<b>${escapeHtml(info.name)}</b>: ${escapeHtml(info.description)}`,
        "url": `/static/images/imp/${im}.png`
      });
    }
    if (this.unit_.improved_targeting.length > 0) {
      imp_info.push({
        "url": "/static/images/imp/targeting.png",
      });
    }
    for (const it of this.unit_.improved_targeting) {
      const info = IMPROVED_TARGETING_LIST[it];
      imp_info.push({
        "tooltip": `<b>${escapeHtml(info.name)}</b>: ${escapeHtml(info.description)}`,
        "url": `/static/images/imp/${it}.png`
      });
    }

    // Now go around the unit circle, drawing each element.
    const INCREMENT = 2 * Math.PI / 16;
    const RADIUS = 70;
    const IMG_OFFSET = 9;
    for (var i = 0; i < imp_info.length; ++i) {
      const img_url = imp_info[i].url;
      const tooltip = imp_info[i].tooltip;
      const left = Math.cos(INCREMENT * i) * -RADIUS - IMG_OFFSET;
      const top = Math.sin(INCREMENT * i) * RADIUS - IMG_OFFSET;
      if (tooltip) {
        html += `
          <div class='tooltip' style='position:absolute;left:${left}px;top:${top}px;'>
            <img class='largeCardImprovedAbilityIcon' src='${img_url}'>
            <span class='tooltiptext'>${tooltip}</span>
          </div>`;
      } else {
        html += `<img class='largeCardImprovedAbilityIcon' src='${img_url}' style='left:${left}px;top:${top}px;'>`
      }
    }
    html += "</div>";
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
    var html = `<div id='largeCardTeamAbilities' style='bottom:${bottom}px'>`
    for (var i = 0; i < this.unit_.team_abilities.length; ++i) {
      var teamAbility = TEAM_ABILITY_LIST[this.unit_.team_abilities[i]];
      html += `
        <div class='largeCardTeamAbility' style='top: ${10 + 45 * i}px'>
          <div class='tooltip'>
            <img src='/static/images/ta/${this.unit_.team_abilities[i]}.png' alt=''/>
            <span class='tooltiptext'>${escapeHtml(teamAbility.description)}</span>
          </div>
        </div>
        `;
    }
    html += "</div>"
    return html;
  }

  drawPassengers_() {
    if (!this.unit_.passengers) {
      return "";
    }
    var html = `
      <div class='cardPassengers'>
        <img class='cardPassengersIcon' src='/static/images/misc/passenger.png' alt=''>
        <span>${this.unit_.passengers}</span>
      </div>
    `;
    return html;
  }
  
  drawSpecialPowers_() {
    if (!this.unit_.special_powers) {
      return [];
    }
    const LINES_PER_COLUMN = (this.numDialTables_ == 1) ? [16, 9, 30] : [7, 1, 30];
    const CHARS_PER_NAME_LINE = 23;
    const CHARS_PER_DESC_LINE = 30;
    var currentLineCount = 0;
    var currentColumn = 0;
    var currentPower = 0;
    var htmlColumns = [];
    var html = "<table id='largeCardSpecialPowersTable0' class='specialPowersTable'>";
    for (var i = 0; i < this.unit_.special_powers.length; ++i) {
      const power = this.unit_.special_powers[i];
      var type = power.type;
  
      // Handling for special trait types
      if (type == "speed" || type == "attack" || type == "defense" || type == "damage") {
        type = this.unit_[type + "_type"];
      }
        
      const headerLines = power.name ? Math.ceil(power.name.length / CHARS_PER_NAME_LINE) : 0;
      const descLines = Math.ceil(power.description.length / CHARS_PER_DESC_LINE);
      const lines = headerLines + descLines;
      if (lines > LINES_PER_COLUMN[LINES_PER_COLUMN.length - 1]) {
        throw new Error("Special power contains more than 30 lines in a single column.");
      }
      // If the line count surpasses the max in the current column, move to the
      // next column.
      while (currentLineCount + lines > LINES_PER_COLUMN[Math.min(currentColumn, LINES_PER_COLUMN.length - 1)]) {
        html += "</table>";
        htmlColumns.push(html);
        ++currentColumn;
        currentLineCount = 0;
        html = `<table id='largeCardSpecialPowersTable${currentColumn}' class='specialPowersTable'>`;
      }

      currentLineCount += lines + 1;
      var iconHtml = "";
      if (type == "costed_trait") {
        iconHtml = `
          <img class='specialPowerIcon' src='/static/images/sp/${type}.png' alt=''/>
          <div class='specialPowerPointValue'>+${power.point_value} POINTS</div>`;
      } else if (type == "rally_trait") {
        iconHtml = `
          <div class='specialPowerRally' style='${RALLY_TYPE_TO_STYLE[power.rally_type]}'>
            <img class='specialPowerIcon' src='/static/images/sp/trait.png' alt=''/>
            <img class='specialPowerRallyDie' src='/static/images/misc/d6_${power.rally_die}.png' alt='${power.rally_die}'/>
          </div>`;
      } else if (type == "plus_plot_points" || type == "minus_plot_points") {
        var textColor = type == "plus_plot_points" ? "white" : "black";
        var plotPoints = power.plot_points == "X" ? "X" : Math.abs(power.plot_points);
        iconHtml = `
          <div style='position: relative;'>
            <img class='specialPowerIcon' src='/static/images/sp/${type}.png' alt=''/>
            <div class='specialPowerPlotPoints' style='color:${textColor};'>${plotPoints}</div>
          </div>`;
      } else if (type) {
        iconHtml = `<img class='specialPowerIcon' src='/static/images/sp/${type}.png' alt=''/>`;
      }
      html += `
        <tr class='specialPowerRow'>
          <td class='specialPowerImg'>${iconHtml}</td>
          <td class='specialPower'>`;
      if (power.name) {
        html += `<b>${escapeHtml(power.name.toUpperCase())}</b><br>`;
      }
      html += `${escapeHtml(power.description)}</td></tr>`;
    }
    html += "</table>"
    htmlColumns.push(html)
    return htmlColumns;
  }
  
  drawDial_() {
    // Contains information on how to layout the dial tables, depending on
    // whether there's one dial table or two.
    const TABLE_COLS = [
      [
        {"start": 0, "end": this.unit_.dial_size}
      ], [
        {"start": 0, "end": 12},
        {"start": 12, "end": this.unit_.dial_size}
      ],
    ];
    const tableCols = TABLE_COLS[this.numDialTables_ - 1];

    var html = "";
    var tableDialStart = 0;
    var currentStartingLine = 0;
    for (var t = 0; t < this.numDialTables_; ++t) {
      var bottom = 70 + 135 * (this.numDialTables_ - t - 1);
      var borderWidth = 49 + 23 * (tableCols[t].end - tableCols[t].start);
      var tableWidth = 4 + 23 * (tableCols[t].end - tableCols[t].start);
      html += `
        <div class='largeCardDial' style='bottom:${bottom}px;width:${borderWidth}px;'>
        <div class='combatSymbol'>
          <div class='largeCardRange'>${this.unit_.unit_range}</div>`;
      for (var i = 0; i < this.unit_.targets; ++i) {
        html += `<img class='largeCardBolt' src='/static/images/cs/bolt.png' alt='' height='12' width='6' style='left: ${10 + i * 4}px;'\>`;
      }
      html += `
        </div>
        <div class='combatSymbol' style='position:absolute;top:24px;'>
          <img class='largeCardCombatSymbolImg' src='/static/images/cs/${this.unit_.speed_type}.png'/>
        </div>
        <div class='combatSymbol' style='position:absolute;top:48px;'>
          <img class='largeCardCombatSymbolImg' src='/static/images/cs/${this.unit_.attack_type}.png'/>
        </div>
        <div class='combatSymbol' style='position:absolute;top:72px;'>
          <img class='largeCardCombatSymbolImg' src='/static/images/cs/${this.unit_.defense_type}.png'/>
        </div>
        <div class='combatSymbol' style='position:absolute;top:96px;'>
          <img class='largeCardCombatSymbolImg' src='/static/images/cs/${this.unit_.damage_type}.png'/>
        </div>
        <table class='largeCardDialTable' style='width:${tableWidth}px'>`;
    
      html += "<tr class='largeCardDialRow'>";
      var currentClick = tableDialStart;
      for (var col = tableCols[t].start; col < tableCols[t].end; ++col) {
        var style = ""
        var clickNum = col + 1;
        if (currentClick < this.unit_.dial.length &&
            clickNum == this.unit_.dial[currentClick].click_number) {
          if (this.unit_.dial[currentClick].alt_click_number) {
            style = "style='color:blue;'";
            clickNum = this.unit_.dial[currentClick].alt_click_number;
          }
          ++currentClick;
        }
        html += `<th class='largeCardDialHeader' ${style}>${clickNum}</th>`;
      }
      html += "</tr>";
      var currentClick;
      for (var row = 0; row < 4; ++row) {
        var rowType = ['speed', 'attack', 'defense', 'damage'][row];
        html += "<tr class='largeCardDialRow'>";
        currentClick = tableDialStart;
        for (var col = tableCols[t].start; col < tableCols[t].end; ++col) {
          if (currentClick < this.unit_.dial.length &&
              col == this.unit_.dial[currentClick].click_number - 1) {
            var power = this.unit_.dial[currentClick][rowType + '_power'];
            var value = this.unit_.dial[currentClick][rowType + '_value'];
            var entryClass = "dialEntry";
            if (!Number.isInteger(value) && value != "") {
              entryClass = "dialEntryText";
            }
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
                <td class='${entryClass}' style='${powerObj.style}'>
                  <div class='tooltip'>
                    <div>${value}</div>
                    <span class='tooltiptext'><b>${powerObj.name}</b>: ${escapeHtml(powerObj.description)}</span>
                  </div>
                </td>`;
            } else {
              html += `<td class='${entryClass}'>${value}</td>`;
            }
            ++currentClick;
          } else {
            html += "<td class='dialEntryKO'>KO</td>";
          }
        }
        html += "</tr>";
      }
      html += "</table>";

      // The end of the dial is indicated by the last click processed.
      const pointValuesLength =
          Math.min(this.unit_.point_values.length, POINT_VALUE_COLORS.length);
      var tableDialEnd = currentClick;
      for (var click = tableDialStart; click < tableDialEnd; ++click) {
        const startingLine = this.unit_.dial[click].starting_line;
        if (startingLine) {
          // Try to interpret the value of starting_line as a particular color.
          var color = COLOR_MAP[startingLine];
          if (!color) {
            // Otherwise fall back to having it correspond to the starting
            // point color.
            const colorIdx = Math.min(currentStartingLine++, STARTING_LINE_COLORS[pointValuesLength - 1].length - 1);
            color = STARTING_LINE_COLORS[pointValuesLength - 1][colorIdx];
          }
          const left = 31 + 23 * (this.unit_.dial[click].click_number - tableCols[t].start - 1);
          html += `<div class='largeCardDialStartingLine' style='left: ${left}px; background-color: ${color}'></div>`
        }
      }
      // Update the starting click for the next table.
      tableDialStart = tableDialEnd;
      html += "</div>"
    }
    return html;
  }
}