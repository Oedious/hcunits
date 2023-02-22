const TYPE_LIST = {
  "character": {
    "name": "Character"
  },
  "object": {
    "name": "Object"
  },
  "equipment": {
    "name": "Equipment"
  },
  "map": {
    "name": "Map"
  },
  "bystander": {
    "name": "Bystander"
  },
  "mystery_card": {
    "name": "Mystery Card"
  },
  "tarot_card": {
    "name": "Tarot Card"
  },/*
  "terrain": {
    "name": "Terrain"
  },
  "resource": {
    "name": "Resource"
  },
  "relic": {
    "name": "Relic"
  },
  "battlefield_condition": {
    "name": "Battlefield Condition"
  },
  "event_dial": {
    "name": "Event Dial"
  },*/
}

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

const BYSTANDER_TYPE_INFO = {
  "standard": {
    "name": "Bystander",
  },
  "construct": {
    "name": "Construct",
    "description": "Immediately KO this Construct if it is not within 6 squares of the character that generated it.<br>// Constructs do not block line of fire, do not require opposing characters to break away, and opposing characters don't stop moving when they become adjacent to a Construct. Constructs can't be chosen for Mastermind or have their combat values modified by other characters.",
    "icon": "table_lamp",
  },
};

const CARD_TYPE_INFO = {
  "mystery_card": {
    "name": "Mystery Card",
    "title": "MYSTERY CARD",
    "description": "During force construction, you may include any number of Mystery Cards on your Sideline. All Mystery Cards are UNIQUE.<br><br>Each Mystery Card has a list of keywords and a CLUE EFFECT that allows that card to gain Clue tokens. When a CLUE EFFECT is triggered, place a Clue token on that card. If multiple Mystery Cards have the same named CLUE EFFECT, you may only place a Clue token on one of those cards when that named CLUE EFFECT is triggered.<br><br>Each Mystery Card has effects that may be used while the number of Clue tokens on that card is equal to or greater than the number listed in parenthesis next to that effect. All CLUE EFFECTS and named effects have SIDELINE ACTIVE."
  },
  "tarot_card": {
    "name": "Tarot Card",
    "title": "TAROT CARD",
  },
  // TODO: Add ID cards
};