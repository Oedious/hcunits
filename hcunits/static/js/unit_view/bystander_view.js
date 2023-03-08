class BystanderView extends SmallUnitView {
  
  static isType(type) {
    return type == "bystander";
  }

  constructor(unit) {
    super(unit);
    if (!BystanderView.isType(this.unit_.type)) {
      throw new Error("Mismatched unit type: BystanderView require type='bystander'");
    }
  }

  getTypeInfo() {
    return BYSTANDER_TYPE_INFO[this.unit_.bystander_type];
  }
  
  drawToken_() {
    if (this.unit_.dial.length != 1) {
      throw new Error(`Bystander '$(this.unit_.unit_id}' expected to have dial size of 1, but found ${this.unit_.dial.length}`);
    }
    var html = `
      <div id='smallCardToken'>
        <div id='smallCardTokenClip'>
          <div id='smallCardBystanderTokenCircle'>
            <div id='smallCardBystanderBackground'>`;
    const imgUrl = this.unit_.img_url;
    if (imgUrl && imgUrl.length > 0) {
      html += `<img id='smallCardBystanderTokenImg' src='${imgUrl}' alt='' onerror='this.style.display=\"none\"' style="left:-35px;top:-45px;"/>`
    }
    html += `
            </div>
          </div>
          <div id='smallCardDialBackground'></div>
          <div id='smallCardCombatSymbols'>
            <div id='smallCardCombatSymbolRange' class='combatSymbol'>
              <div id='smallCardRange'>${this.unit_.unit_range}</div>`;
    for (var i = 0; i < this.unit_.targets; ++i) {
      html += `<img class='smallCardBolt' src='/static/images/cs/bolt.png' alt='' height='12' width='6' style='left: ${18 + i * 4}px;'\>`;
    }
    html += `
            </div>
            <div id='smallCardCombatSymbolSpeed' class='combatSymbol'>
              <img class='smallCardCombatSymbolImg' src='/static/images/cs/${this.unit_.speed_type}.png'/>
            </div>
            <div id='smallCardCombatSymbolAttack' class='combatSymbol'>
              <img class='smallCardCombatSymbolImg' src='/static/images/cs/${this.unit_.attack_type}.png'/>
            </div>
            <div id='smallCardCombatSymbolDefense' class='combatSymbol'>
              <img class='smallCardCombatSymbolImg' src='/static/images/cs/${this.unit_.defense_type}.png'/>
            </div>
            <div id='smallCardCombatSymbolDamage' class='combatSymbol'>
              <img class='smallCardCombatSymbolImg' src='/static/images/cs/${this.unit_.damage_type}.png'/>
            </div>
          </div>
        </div>`;
    html += `
        ${this.drawImprovedAbilities_()}
        ${this.drawTeamAbilities_()}
        ${this.drawPassengers_()}
        <div id='smallCardBystanderName'>
          ${this.unit_.name.toUpperCase()}
        </div>
        <div id='smallCardDial'>`;

    for (var row = 0; row < 4; ++row) {
      const ENTRY_HEIGHT = 24;
      const ROW_OFFSET = 7;
      var rowType = ['speed', 'attack', 'defense', 'damage'][row];
      var power = this.unit_.dial[0][rowType + '_power'];
      var value = this.unit_.dial[0][rowType + '_value'];
      var position = `position: absolute; left: ${row * ROW_OFFSET}px; top: ${row * ENTRY_HEIGHT}px;`
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
          <div class='dialEntry' style='${powerObj.style} ${position}'>
            <div class='tooltip'>
              <div>${value}</div>
              <span class='tooltiptext'><b>${powerObj.name}</b>: ${escapeHtml(powerObj.description)}</span>
            </div>
          </div>`;
      } else {
        html += `<div class='dialEntry' style='${position}'>${value}</div>`;
      }
    }
    html += "</div></div>";
    return html;
  }
  
  drawImprovedAbilities_() {
    if (this.unit_.improved_movement.length == 0 &&
        this.unit_.improved_targeting.length == 0) {
      return "";
    }
    var html = "<div id='smallCardImprovedAbilities'>";
    // First iterate through each array and collect a list of all the symbols
    // that need to be drawn.
    var impInfo = [];
    if (this.unit_.improved_movement.length > 0) {
      impInfo.push({
        "url": "/static/images/imp/movement.png",
      });
    }
    for (const im of this.unit_.improved_movement) {
      const info = IMPROVED_MOVEMENT_LIST[im];
      impInfo.push({
        "tooltip": `<b>${escapeHtml(info.name)}</b>: ${escapeHtml(info.description)}`,
        "url": `/static/images/imp/${im}.png`
      });
    }
    if (this.unit_.improved_targeting.length > 0) {
      impInfo.push({
        "url": "/static/images/imp/targeting.png",
      });
    }
    for (const it of this.unit_.improved_targeting) {
      const info = IMPROVED_TARGETING_LIST[it];
      impInfo.push({
        "tooltip": `<b>${escapeHtml(info.name)}</b>: ${escapeHtml(info.description)}`,
        "url": `/static/images/imp/${it}.png`
      });
    }

    // Now go around the unit circle, drawing each element.
    const INCREMENT = 2 * Math.PI / 22;
    const RADIUS = 90;
    const IMG_OFFSET = 9;
    for (var i = 0; i < impInfo.length; ++i) {
      const imgUrl = impInfo[i].url;
      const tooltip = impInfo[i].tooltip;
      const left = Math.cos(INCREMENT * i) * RADIUS - IMG_OFFSET;
      const top = Math.sin(INCREMENT * i) * RADIUS - IMG_OFFSET;
      if (tooltip) {
        html += `
          <div class='tooltip' style='position:absolute;left:${left}px;top:${top}px;'>
            <img class='smallCardImprovedAbilityIcon' src='${imgUrl}'>
            <span class='tooltiptext'>${tooltip}</span>
          </div>`;
      } else {
        html += `<img class='smallCardImprovedAbilityIcon' src='${imgUrl}' style='left:${left}px;top:${top}px;'>`
      }
    }
    html += "</div>";
    return html;
  }

  drawTeamAbilities_() {
    if (this.unit_.team_abilities.length <= 0) {
      return "";
    }
    var html = "<div id='smallCardTeamAbilities'>";
    for (const teamAbility of this.unit_.team_abilities) {
      const teamAbilityInfo = TEAM_ABILITY_LIST[teamAbility];
      html += `
        <div class='tooltip'>
          <img src='/static/images/ta/${teamAbility}.png' alt=''/>
          <span class='tooltiptext'>${escapeHtml(teamAbilityInfo.description)}</span>
        </div>`;
    }
    html += "</div>";
    return html;
  }

  drawPassengers_() {
    var html = ""
    if (this.unit_.passengers) {
      html = `
        <div id='smallCardPassengers'>
          <img src='/static/images/misc/passenger.png' alt=''>
          <span>${this.unit_.passengers}</span>
        </div>`;
    }
    // Draw horde token stack in the same spot as passengers as they're
    // mutally exclusive (assuming no more horde tokens will be made).
    if (this.unit_.horde_stack_max) {
      html = `
        <div id='smallCardPassengers'>
          <img src='/static/images/misc/max_stack.png' alt=''>
          <span>=${this.unit_.horde_stack_max}</span>
        </div>`;
    }
    return html;
  }
}