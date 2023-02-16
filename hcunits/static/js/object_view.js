const OBJECT_TYPE_RULES = {
  "bystander": {
    "name": "Bystander",
  },
  "construct": {
    "name": "Construct",
    "title": "CONSTRUCT",
    "description": "Immediately KO this Construct if it is not within 6 squares of the character that generated it.<br>// Constructs do not block line of fire, do not require opposing characters to break away, and opposing characters don't stop moving when they become adjacent to a Construct. Constructs can't be chosen for Mastermind or have their combat values modified by other characters."
  },
  "equipment": {
    "name": "Equipment",
    "title": "EQUIPMENT",
    "description": "A character that's equipped with this object can use its EFFECT."
  },
  "mystery_card": {
    "name": "Mystery Card",
    "title": "MYSTERY CARD",
    "description": "During force construction, you may include any number of Mystery Cards on your Sideline. All Mystery Cards are UNIQUE.<br><br>Each Mystery Card has a list of keywords and a CLUE EFFECT that allows that card to gain Clue tokens. When a CLUE EFFECT is triggered, place a Clue token on that card. If multiple Mystery Cards have the same named CLUE EFFECT, you may only place a Clue token on one of those cards when that named CLUE EFFECT is triggered.<br><br>Each Mystery Card has effects that may be used while the number of Clue tokens on that card is equal to or greater than the number listed in parenthesis next to that effect. All CLUE EFFECTS and named effects have SIDELINE ACTIVE."
  },
  "tarot_card": {
    "name": "Tarot Card",
    "title": "TAROT CARD",
  }
};

const OBJECT_KEYPHRASE_RULES = {
  "indestructible": {
    "name": "INDESTRUCTIBLE",
    "description": "This object can only be destroyed by using it in an object attack or by its own effect."
  },
  "equip_friendly": {
    "name": "EQUIP: FRIENDLY",
    "description": "A friendly character holding, or occupying the same square as this equipment has \"Power: Equip this equipment.\""
  },
  "equip_any": {
    "name": "EQUIP: ANY",
    "description": "Any character (friendly or opposing) holding, or occupying the same square as, this equipment has \"POWER: Equip this equipment.\""
  },
  "unequip_ko": {
    "name": "UNEQUIP: KO",
    "description": "When unequipped, destroy this equipment."
  },
  "unequip_drop": {
    "name": "UNEQUIP: DROP",
    "description": "When unequipped, place this equipment in the previously equipped character's square."
  },
  "sword_equipment": {
    "name": "SWORD EQUIPMENT",
    "description": "Applies to the 'SWORD BEARER' trait."
  }
};

const OBJECT_TYPE_TO_INFO = {
  "light": {
    "name": "Light Object",
    "style": "border: 7px solid " + COLOR_YELLOW + ";"
  },
  "heavy": {
    "name": "Heavy Object",
    "style": "border: 7px solid " + COLOR_RED + ";"
  },
  "ultra_heavy": {
    "name": "Ultra Light Object",
    "style": "border: 7px solid " + COLOR_WHITE + ";"
  },
  "ultra_heavy_object": {
    "name": "Ultra Heavy Object",
    "style": "border: 7px solid " + COLOR_PURPLE + ";"
  },
  "special_object": {
    "name": "Special Object",
    "style": "border: 7px solid " + COLOR_BLUE + ";"
  }
};

class ObjectView extends UnitView {
  
  static isType(type) {
    return type == "object" ||
           type == "bystander" ||
           type == "equipment" ||
           type == "construct" ||
           type == "id_card" ||
           type == "mystery_card" ||
           type == "tarot_card";
  }

  constructor(unitJson) {
    super(unitJson);
    this.extraLines_ = 0;
  }

  draw() {
    const specialPowersHtml = this.drawSpecialPowers_();
    var html = `
      <div class='column'>
        <div id='card0' class='objectCard'>
          <div class='objectCardBorders' style='border-top: 70px solid black;'></div>
          <div id='objectHeader'>
            <div id='objectName'>${escapeHtml(this.unit_.name).toUpperCase()}</div>
            ${this.drawObjectType_()}
          </div>
          ${this.drawObjectKeyphrases_()}
          <div id='objectCollectorNumber'>${this.unit_.collector_number}</div>
          ${this.drawToken_()}
          ${specialPowersHtml.length >= 1 ? specialPowersHtml[0] : ""}
          ${super.drawPointValues_(30)}
        </div>
      </div>`;

    if (specialPowersHtml.length > 1) {
      html += `
        <div class='column'>
          <div class='objectCard'>
            <div class='objectCardBorders' style='border-top: 25px solid black;'></div>
            ${specialPowersHtml.length >= 2 ? specialPowersHtml[1] : ""}
          </div>
        </div>`;
    }
  	$('#unitCardsContainer').html(html);
  }
  
  isCardType_() {
    return this.unit_.type == "mystery_card" ||
        this.unit_.type == "id_card" ||
        this.unit_.type == "tarot_card";
  }
  
  drawObjectType_() {
    var html = "";
    var rules = OBJECT_TYPE_RULES[this.unit_.type];
    var objectTypeName;
    if (this.unit_.object_type) {
      objectTypeName = OBJECT_TYPE_TO_INFO[this.unit_.object_type].name;
    } else if (rules) {
      objectTypeName = rules.name;
    } else {
      objectTypeName = this.unit_.type;
    }
    if (rules && rules.description) {
      html = `
        <div id='objectType'>
          <div class='tooltip'>
            <i>${objectTypeName}</i>
            <span class='tooltiptext'><b>${rules.name}</b>: ${rules.description}</span>
          </div>
        </div>`;
    } else {
      html = `<div id='objectType'><i>${objectTypeName}</i></div>`;
    }
    return html;
  }
  
  drawObjectKeyphrases_() {
    if (this.unit_.object_keyphrases.length == 0 && this.unit_.keywords.length == 0) {
      return "";
    }
    var html = "<div id='objectKeyphrases'>";
    html += this.drawKeywords_();
    for (var keyphrase of this.unit_.object_keyphrases) {
      var rules = OBJECT_KEYPHRASE_RULES[keyphrase];
      if (!rules) {
        console.log(`Couldn't find rules for object keyphrase '${keyphrase}'`);
        continue;
      }
      html += `
        <div>
          <div class='tooltip'>
            <b>${rules.name}</b>
            <span class='tooltiptext'><b>${rules.name}</b>: ${escapeHtml(rules.description)}</span>
          </div>
        </div>`;
    }
    html += "</div>"
    return html;
  }
  
  drawKeywords_() {
    if (this.unit_.keywords.length == 0) {
      return "";
    }
    var html = "<div><b>KEYWORDS: ";
    for (var i = 0; i < this.unit_.keywords.length; ++i) {
      if (i != 0) {
        html += ", "
      }
  		var escapedKeyword = escapeHtml(this.unit_.keywords[i]);
  		html += `<a href='' style='color:black;' onclick='mgr.searchByKeyword("${escapedKeyword}"); return false;'>${escapedKeyword.toUpperCase()}</a>`;
    }
    html += "</b></div>"
    return html;
  }
  
  drawToken_() {
    if (this.unit_.type == "bystander" || this.unit_.type == "construct") {
      return this.drawBystander_();
    } else if (this.unit_.type == "object" || this.unit_.type == "equipment" || this.unit_.type == "relic") {
      return this.drawObject_();
    } else if (this.isCardType_()) {
      return ""
    } else {
      console.log(`Cannot draw object token for unknown type '${this.unit_.type}'`);
      return ""
    }
  }
  
  drawBystander_() {
    var html = `
      <div id='objectToken'>
        <div id='objectTokenClip'>
          <div id='objectTokenCircle'>
            <div id='objectBystanderBackground'>`;
    if (this.unit_.has_image) {
      html += `<img id='objectTokenImg' src='/static/images/${this.unit_.set_id}/${this.unit_.unit_id}.png' alt='' onerror='this.style.display=\"none\"' style="left:-35px;top:-45px;"/>`
    }
    html += `
            </div>
          </div>
          <div id='objectDialBackground'></div>
          <div id='objectCombatSymbols'>
            <div id='objectCombatSymbolRange' class='combatSymbol'>
              <div id='objectRange'>${this.unit_.unit_range}</div>`;
    for (var i = 0; i < this.unit_.targets; ++i) {
      html += `<img class='objectBolt' src='/static/images/cs_bolt.png' alt='' height='12' width='6' style='left: ${28 + i * 4}px;'\>`;
    }
    html += `
            </div>
            <div id='objectCombatSymbolSpeed' class='combatSymbol'>
              <img class='objectCombatSymbolImg' src='/static/images/cs_${this.unit_.speed_type}.png'/>
            </div>
            <div id='objectCombatSymbolAttack' class='combatSymbol'>
              <img class='objectCombatSymbolImg' src='/static/images/cs_${this.unit_.attack_type}.png'/>
            </div>
            <div id='objectCombatSymbolDefense' class='combatSymbol'>
              <img class='objectCombatSymbolImg' src='/static/images/cs_${this.unit_.defense_type}.png'/>
            </div>
            <div id='objectCombatSymbolDamage' class='combatSymbol'>
              <img class='objectCombatSymbolImg' src='/static/images/cs_${this.unit_.damage_type}.png'/>
            </div>
          </div>
        </div>
        <div id='objectBystanderName'>${this.unit_.name.toUpperCase()}</div>
        <div id='objectDial'>${this.drawDial_()}</div>
      </div>`;
    return html;
  }
  
  drawObject_() {
    var objectStyle = this.unit_.object_type ?
      OBJECT_TYPE_TO_INFO[this.unit_.object_type].style : ""
      
    var html =
      `<div id='objectToken'>
        <div id='objectTokenCircle' style='background-color: lightgray; ${objectStyle}'></div>`;
    if (this.unit_.has_image) {
      html += `<img id='objectTokenImg' src='/static/images/${this.unit_.set_id}/${this.unit_.unit_id}.png' alt='' onerror='this.style.display=\"none\"'/>`
    }
    html += "</div>";
    return html;
  }
  
  drawDial_() {
    if (this.unit_.dial.length != 1) {
      throw new Error(`Object '$(this.unit_.unit_id}' expected to have dial size of 1, but found ${this.unit_.dial.length}`);
    }
    var html = "";
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
          <div class='unitDialEntry' style='${powerObj.style} ${position}'>
            <div class='tooltip'>
              <div>${value}</div>
              <span class='tooltiptext'><b>${powerObj.name}</b>: ${escapeHtml(powerObj.description)}</span>
            </div>
          </div>`;
      } else {
        html += `<div class='unitDialEntry' style='${position}'>${value}</div>`;
      }
    }
    return html;
  }

  drawSpecialPowers_() {
    if (!this.unit_.special_powers) {
      return [];
    }
    const CHARS_PER_NAME_LINE_WITH_ICON = 40;
    const CHARS_PER_NAME_LINE_WITHOUT_ICON = 60;
    const CHARS_PER_DESC_LINE_WITH_ICON = 60;
    const CHARS_PER_DESC_LINE_WITHOUT_ICON = 70;
    // The minimum number of lines varies on the whether we show the the token
    // and the "Point Value" bar.
    var card0Lines = 4;
    var hasPointValue = this.unit_.point_values.length > 0
    if (!hasPointValue) {
      card0Lines += 2;
    }
    var hasToken = !this.isCardType_()
    if (!hasToken) {
      card0Lines += 11;
    }
    const LINES_PER_CARD = [card0Lines, 23];
    var currentLineCount = 0;
    var currentCard = 0;

    var htmlColumns = [];
    var top = this.isCardType_() ? 100 : 288;
    var html = `<table id='objectSpecialPowersTable0' class='unitSpecialPowersTable' style='top:${top}px;'>`;
    for (var i = 0; i < this.unit_.special_powers.length; ++i) {
      var power = this.unit_.special_powers[i];
      var type = power.type;
      var iconHtml = "";
      if (type == "costed_trait") {
        iconHtml = `
          <td class='unitSpecialPower'>
            <img class='unitSpecialPowerIcon' src='/static/images/sp_${type}.png' alt=''/>
            <div class='unitSpecialPowerPointValue'>+${power.point_values} POINTS</div>
          </td>`;
      } else if (type == "rally_trait") {
        iconHtml = `
          <td class='unitSpecialPower'>
            <div class='unitSpecialPowerRally' style='${RALLY_TYPE_TO_STYLE[power.rally_type]}'>
              <img class='unitSpecialPowerIcon' src='/static/images/sp_trait.png' alt=''/>
              <img class='unitSpecialPowerRallyDie' src='/static/images/d6_${power.rally_die}.png' alt='${power.rally_die}'/>
            </div>
          </td>`;
      } else if (type == "object" || type == "equipment" || type == "mystery_card" || type == "tarot_card") {
        // Don't use an icon.
        iconHtml = ""
      } else {
        var combatSymbolType = type;
        if (type != "trait") {
          combatSymbolType = this.unit_[type + "_type"];
        }
        iconHtml = `
          <td class='unitSpecialPowerImg'>
            <img class='unitSpecialPowerIcon' src='/static/images/sp_${combatSymbolType}.png' alt=''/>
          </td>`;
      }

      const CHARS_PER_NAME_LINE = iconHtml.length == 0 ? CHARS_PER_NAME_LINE_WITHOUT_ICON : CHARS_PER_NAME_LINE_WITH_ICON;
      const CHARS_PER_DESC_LINE = iconHtml.length == 0 ? CHARS_PER_DESC_LINE_WITHOUT_ICON : CHARS_PER_DESC_LINE_WITH_ICON;
      const headerLines = power.name ? Math.ceil(power.name.length / CHARS_PER_NAME_LINE) : 0;
      const descLines = power.description ? Math.ceil(power.description.length / CHARS_PER_DESC_LINE) : 0;
      const lines = headerLines + descLines;

      // If the line count surpasses the max in the current card, move to the
      // next card.
      while (currentLineCount + lines > LINES_PER_CARD[currentCard]) {
        if (currentCard >= 1) {
          throw new Error(`Cannot draw special powers for unit ${this.unit_.unit_id}: text won't fit on 2 cards`);
        }
        html += "</table>";
        htmlColumns.push(html);
        ++currentCard;
        currentLineCount = 0;
        html = `<table id='objectSpecialPowersTable${currentCard}' class='unitSpecialPowersTable'>`;
      }
      currentLineCount += lines;

      var nameHtml = ""
      if (power.name) {
        nameHtml = `<b>${escapeHtml(power.name.toUpperCase())}</b><br>`
      }
      html += `
        <tr class='unitSpecialPowerRow'>
          ${iconHtml}
          <td class='unitSpecialPower'>${nameHtml}${escapeHtml(power.description)}</td>
        </tr>`;
    }
    html += "</table>"
    htmlColumns.push(html)
    return htmlColumns;
  }
}