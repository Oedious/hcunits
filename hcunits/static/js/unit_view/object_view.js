const OBJECT_TYPE_INFO = {
  "standard": {
    "name": "Object",
  },
  "special": {
    "name": "Special Object",
  },
  "equipment": {
    "name": "Equipment",
    "title": "EQUIPMENT",
    "description": "A character that's equipped with this object can use its EFFECT."
  },
  "plastic_man": {
    "name": "Disguised Plastic Man Special Object",
  },
  "relic": {
    "name": "Relic",
  }
};

const OBJECT_SIZE_INFO = {
  "light": {
    "name": "Light Object",
    "style": "border: 7px solid " + COLOR_YELLOW + ";"
  },
  "heavy": {
    "name": "Heavy Object",
    "style": "border: 7px solid " + COLOR_RED + ";"
  },
  "ultra_light": {
    "name": "Ultra Light Object",
    "style": "border: 7px solid " + COLOR_WHITE + ";"
  },
  "ultra_heavy": {
    "name": "Ultra Heavy Object",
    "style": "border: 7px solid " + COLOR_PURPLE + ";"
  },
  "immobile": {
    "name": "Immobile Object",
    "style": "border: 7px solid " + COLOR_BLUE + ";"
  }
};

const OBJECT_KEYPHRASE_INFO = {
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

class ObjectView extends SmallUnitView {
  
  static isType(type) {
    return type == "object";
  }

  constructor(unit) {
    super(unit);
    if (!ObjectView.isType(this.unit_.type)) {
      throw new Error("Mismatched unit type: ObjectView require type='object'");
    }
  }

  getTypeInfo() {
    if (this.unit_.object_type == "standard" || this.unit_.object_type == "special") {
      return OBJECT_SIZE_INFO[this.unit_.object_size];
    } else {
      return OBJECT_TYPE_INFO[this.unit_.object_type];
    }
  }

  drawKeyphrases_() {
    var html = "";
    for (var keyphrase of this.unit_.object_keyphrases) {
      const info = OBJECT_KEYPHRASE_INFO[keyphrase];
      if (!info) {
        console.log(`Couldn't find info for object keyphrase '${keyphrase}'`);
        continue;
      }
      html += `
        <div>
          <div class='tooltip'>
            <b>${info.name}</b>
            <span class='tooltiptext'><b>${info.name}</b>: ${escapeHtml(info.description)}</span>
          </div>
        </div>`;
    }
    return html;
  }
  
  drawToken_() {
    const objectStyle = OBJECT_SIZE_INFO[this.unit_.object_size].style;
    var html =
      `<div id='smallCardToken'>
        <div id='smallCardTokenCircle' style='background-color: lightgray; ${objectStyle}'></div>`;
    if (this.unit_.has_image) {
      html += `<img id='smallCardTokenImg' src='/static/images/${this.unit_.set_id}/${this.unit_.unit_id}.png' alt='' onerror='this.style.display=\"none\"'/>`
    }
    html += "</div>";
    return html;
  }
  
  drawFooter_() {
    if (this.unit_.object_type == "standard") {
      return "";
    }
    return "<img class='specialObjectIcon' src='/static/images/gear.png' alt=''/>";
  }
}