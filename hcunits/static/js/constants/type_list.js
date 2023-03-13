const TYPE_LIST = {
  "character": {
    "name": "Character",
    "icon": "accessibility_new",
  },
  "object": {
    "name": "Object",
    "icon": "cookie",
  },
  "equipment": {
    "name": "Equipment",
    "icon": "swords",
  },
  "map": {
    "name": "Map",
    "icon": "map",
  },
  "bystander": {
    "name": "Bystander",
    "icon": "pets",
  },
  "mystery_card": {
    "name": "Mystery Card",
    "icon": "psychology_alt",
  },
  "tarot_card": {
    "name": "Tarot Card",
    "icon": "content_copy",
  },
  "id_card": {
    "name": "ID Card",
    "icon": "badge",
  },
  "attachment": {
    "name": "Attachment",
    "icon": "settings_account_box",
  },
  "battlefield_condition": {
    "name": "Battlefield Condition",
    "icon": "thunderstorm",
  },
  "feat": {
    "name": "Feat",
    "icon": "sprint",
  },
  /*
  "terrain": {
    "name": "Terrain"
  },
  "resource": {
    "name": "Resource"
  },
  "event_dial": {
    "name": "Event Dial"
  },*/
}

const OBJECT_TYPE_INFO = {
  "standard": {
    "name": "Object",
    "icon": "cookie",
  },
  "special": {
    "name": "Special Object",
    "icon": "blur_circular",
  },
  "equipment": {
    "name": "Equipment",
    "title": "EQUIPMENT",
    "description": "A character that's equipped with this object can use its EFFECT."
  },
  "plastic_man": {
    "name": "Disguised Plastic Man Special Object",
    "icon": "fire_hydrant",
  },
  "relic": {
    "name": "Relic",
    "description": "If a character occupies the same square as a relic, that character may be given a power action to roll a d6 that can’t be rerolled. This roll is called a relic roll. If the result of that roll is within the indicated range of numbers (or higher), the relic is assigned to that character, placed on that character’s card, and the character will gain certain abilities as described on the relic's card.",
    "icon": "social_leaderboard",
  }
};

const OBJECT_SIZE_INFO = {
  "light": {
    "name": "Light Object",
    "color": COLOR_YELLOW,
  },
  "heavy": {
    "name": "Heavy Object",
    "color": COLOR_RED,
  },
  "ultra_light": {
    "name": "Ultra Light Object",
    "color": COLOR_WHITE,
  },
  "ultra_heavy": {
    "name": "Ultra Heavy Object",
    "color": COLOR_PURPLE,
  },
  "immobile": {
    "name": "Immobile Object",
    "color": COLOR_BLUE,
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
  "horde": {
    "name": "Horde",
    "icon": "groups",
  },
  "toy": {
    "name": "Toy",
    "description": "When you build your force, this Toy has all keywords possessed by a friendly character named Toyman. Give this Toy a free action and attach it to an adjacent friendly SLOSH #050 Toyman. When attached, you may give this Toy a move action to detach and move on the map. When on the map, you may give this Toy a move action as a free action if it is within and remains within 3 squares of SLOSH #050 Toyman.",
    "icon": "toys",
  },
};

const ATTACHMENT_TYPE_INFO = {
  "comic_panel": {
    "name": "Comic Panel",
    "description": "At the beginning of your turn, if [DXF Chase Unit] has no action tokens, you may attach a comic panel to him, removing an already attached one. He can use the listed effect.",
    "icon": "background_replace",
  },
  "construct": {
    "name": "Construct",
    "icon": "table_lamp",
  },
  "word_balloon": {
    "name": "Word Balloon",
    "description": "Give [DP Unit] a free action and attach a word balloon to him, replacing any currently attached. [DP Unit] can use the associated affects.",
    "icon": "chat_bubble",
  },
};

const CARD_TYPE_INFO = {
  "mystery_card": {
    "name": "Mystery Card",
    "description": "During force construction, you may include any number of Mystery Cards on your Sideline. All Mystery Cards are UNIQUE.<br><br>Each Mystery Card has a list of keywords and a CLUE EFFECT that allows that card to gain Clue tokens. When a CLUE EFFECT is triggered, place a Clue token on that card. If multiple Mystery Cards have the same named CLUE EFFECT, you may only place a Clue token on one of those cards when that named CLUE EFFECT is triggered.<br><br>Each Mystery Card has effects that may be used while the number of Clue tokens on that card is equal to or greater than the number listed in parenthesis next to that effect. All CLUE EFFECTS and named effects have SIDELINE ACTIVE."
  },
  "tarot_card": {
    "name": "Tarot Card",
  },
  "id_card": {
    "name": "ID Card",
  },
  "battlefield_condition": {
    "name": "Battlefield Condition",
  },
  "feat": {
    "name": "Feat",
  }
};