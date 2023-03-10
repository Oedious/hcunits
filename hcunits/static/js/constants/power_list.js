const POWER_LIST = {
  "flurry": {
    "name": "Flurry",
    "description": "CLOSE: Make up to two close attacks",
    "type": "speed",
    "style": STYLE_RED
  },
  "leap_climb": {
    "name": "Leap/Climb",
    "description": "Improved Movement: Elevated, Outdoor Blocking, Move Through.",
    "type": "speed",
    "style": STYLE_ORANGE
  },
  "phasing_teleport": {
    "name": "Phasing/Teleport",
    "description": "MOVE: Improved Movement: Elevated, Blocking, Characters. Move.",
    "type": "speed",
    "style": STYLE_YELLOW
  },
  "earthbound_neutralized": {
    "name": "Earthbound/Neutralized",
    "description": "This character can't use Improved Movement or Improved Targeting abilities.",
    "type": "speed",
    "style": STYLE_LIGHT_GREEN
  },
  "charge": {
    "name": "Charge",
    "description": "POWER: Halve speed. Move, then CLOSE as FREE -or- make a close attack.",
    "type": "speed",
    "style": STYLE_GREEN
  },
  "mind_control": {
    "name": "Mind Control",
    "description": "CLOSE/RANGE: Minimum range 6. Make a close/range attack. Instead of normal damage, each hit character halves speed and becomes friendly to your force and, one at a time, may in either order: Move and/or make an attack, then it reverts forces.",
    "type": "speed",
    "style": STYLE_LIGHT_BLUE
  },
  "plasticity": {
    "name": "Plasticity",
    "description": "This character breaks away on any result except a [1]. Adjacent opposing characters that can’t use Phasing/Teleport, Plasticity, Leap/Climb, or Hypersonic Speed only break away on a [6].",
    "type": "speed",
    "style": STYLE_BLUE
  },
  "force_blast": {
    "name": "Force Blast",
    "description": "KNOCKBACK. // POWER: Minimum range 6. Knock back an opposing character within range and line of fire 3 squares away from this character.",
    "type": "speed",
    "style": STYLE_PURPLE
  },
  "sidestep": {
    "name": "Sidestep",
    "description": "FREE: Move up to 2 squares.",
    "type": "speed",
    "style": STYLE_PINK
  },
  "hypersonic_speed": {
    "name": "Hypersonic Speed",
    "description": "POWER: Halve range, Passenger:0, Improved Movement: Move Through. Move, then make an attack, then move up to your speed value minus the number of squares just moved.",
    "type": "speed",
    "style": STYLE_BROWN
  },
  "stealth": {
    "name": "Stealth",
    "description": "When it’s not your turn, hindered lines of fire drawn to this character by nonadjacent characters are blocked.",
    "type": "speed",
    "style": STYLE_BLACK
  },
  "running_shot": {
    "name": "Running Shot",
    "description": " POWER: Halve speed. Move, then RANGE as FREE -or- make a range attack.",
    "type": "speed",
    "style": STYLE_GRAY
  },
  "blades_claws_fangs": {
    "name": "Blades/Claws/Fangs",
    "description": "When this character makes a close attack against a single target and hits, you may roll a d6. If you do, deal damage equal to the result instead of normal damage. Minimum result is this character’s printed damage value -1.",
    "type": "attack",
    "style": STYLE_RED
  },
  "energy_explosion": {
    "name": "Energy Explosion",
    "description": "RANGE: Make a range attack and all other characters adjacent to an original target also become targets. Hit characters are dealt 2 damage instead of normal damage.",
    "type": "attack",
    "style": STYLE_ORANGE
  },
  "pulse_wave": {
    "name": "Pulse Wave",
    "description": "RANGE: Halve range, Improved Targeting: Characters, Adjacent. Other characters within range can’t use powers or abilities (for this action). Make a range attack targeting all other characters within range and line of fire, including at least one opposing character, using printed defense values for each targeted character. Each hit character is dealt 1 damage instead of normal damage.",
    "type": "attack",
    "style": STYLE_YELLOW
  },
  "quake": {
    "name": "Quake",
    "description": "When this character makes a close attack, they may target all adjacent opposing characters. If they do, they gain KNOCKBACK (for this attack) and deal each hit character 2 damage instead of normal damage.",
    "type": "attack",
    "style": STYLE_LIGHT_GREEN
  },
  "super_strength": {
    "name": "Super Strength",
    "description": "KNOCKBACK during close attacks. This character can pick up (and hold) heavy objects.",
    "type": "attack",
    "style": STYLE_GREEN
  },
  "incapacitate": {
    "name": "Incapacitate",
    "description": "When this character makes an attack, instead of normal damage, you may give each hit character an action token.",
    "type": "attack",
    "style": STYLE_LIGHT_BLUE
  },
  "penetrating_psychic_blast": {
    "name": "Penetrating/Psychic Blast",
    "description": "When this character makes a range attack, damage is penetrating.",
    "type": "attack",
    "style": STYLE_BLUE
  },
  "smoke_cloud": {
    "name": "Smoke Cloud",
    "description": "POWER: Minimum range 6. Generate up to 6 hindering terrain markers, one at a time, in distinct squares within range. Other than the first, each marker must be adjacent to at least one other, and at least one must be within line of fire. Opposing characters occupying one or more of these markers modify attack -1. At the beginning of your next turn, (even if this is lost) remove them.",
    "type": "attack",
    "style": STYLE_PURPLE
  },
  "precision_strike": {
    "name": "Precision Strike",
    "description": "When this character attacks, damage taken from the attack can’t be reduced below 1 and the target decreases its d6 roll for Super Senses by -1.",
    "type": "attack",
    "style": STYLE_PINK
  },
  "poison": {
    "name": "Poison",
    "description": "FREE: If this character hasn’t moved or been placed this turn, deal 1 damage to all adjacent opposing characters.",
    "type": "attack",
    "style": STYLE_BROWN
  },
  "steal_energy": {
    "name": "Steal Energy",
    "description": "When this character hits and damages one or more characters with a close attack, after resolutions heal this character 1 click.",
    "type": "attack",
    "style": STYLE_BLACK
  },
  "telekinesis": {
    "name": "Telekinesis",
    "description": " POWER: Minimum range 6. Place one target friendly single-base character or object within range and line of fire into another square within range and line of fire. That square must be within 6 squares and line of fire from the target’s current square. Characters placed with this power can’t use Telekinesis this turn.",
    "type": "attack",
    "style": STYLE_GRAY
  },
  "super_senses": {
    "name": "Super Senses",
    "description": " When this character would be hit, you may roll a d6. [5] - [6]: Evade.",
    "type": "defense",
    "style": STYLE_RED
  },
  "toughness": {
    "name": "Toughness",
    "description": "Reduce damage taken by 1.",
    "type": "defense",
    "style": STYLE_ORANGE
  },
  "defend": {
    "name": "Defend",
    "description": "Adjacent friendly characters may replace their defense value with this character’s printed defense value.",
    "type": "defense",
    "style": STYLE_YELLOW
  },
  "combat_reflexes": {
    "name": "Combat Reflexes",
    "description": "Modify defense +2 against close attacks.",
    "type": "defense",
    "style": STYLE_LIGHT_GREEN
  },
  "energy_shield_deflection": {
    "name": "Energy Shield/Deflection",
    "description": "Modify defense +2 against range attacks.",
    "type": "defense",
    "style": STYLE_GREEN
  },
  "barrier": {
    "name": "Barrier",
    "description": "POWER: Minimum range 6. Generate up to 4 blocking terrain markers, one at a time, in distinct squares within range. Other than the first, each marker must be adjacent to at least one other, and at least one must be within line of fire. At the beginning of your next turn, (even if this is lost) remove them.",
    "type": "defense",
    "style": STYLE_LIGHT_BLUE
  },
  "mastermind": {
    "name": "Mastermind",
    "description": "When this character would be hit by an opponent’s attack that deals damage, you may choose an adjacent friendly character that wouldn’t be hit by this attack and that is less points or shares a keyword. That friendly character instead becomes a hit target of the attack, even if it’s already a target (or would be an illegal target).",
    "type": "defense",
    "style": STYLE_BLUE
  },
  "willpower": {
    "name": "Willpower",
    "description": "At the beginning of your turn, you may roll a d6. [5] - [6]: Remove an action token from this character.",
    "type": "defense",
    "style": STYLE_PURPLE
  },
  "invincible": {
    "name": "Invincible",
    "description": " Reduce damage taken by 2. // Can reduce penetrating damage.",
    "type": "defense",
    "style": STYLE_PINK
  },
  "impervious": {
    "name": "Impervious",
    "description": "Reduce damage taken by 2. // When this character would take damage from an attack, you may roll a d6. [5] - [6]: Damage taken is reduced to 0.",
    "type": "defense",
    "style": STYLE_BROWN
  },
  "regeneration": {
    "name": "Regeneration",
    "description": "POWER: Roll a d6. Heal a number of clicks equal to half the result (rounded up).",
    "type": "defense",
    "style": STYLE_BLACK
  },
  "invulnerability": {
    "name": "Invulnerability",
    "description": " Reduce damage taken by 2.",
    "type": "defense",
    "style": STYLE_GRAY
  },
  "ranged_combat_expert": {
    "name": "Ranged Combat Expert",
    "description": "This character modifies attack and damage +1 while making a range attack or using RANGE destroy.",
    "type": "damage",
    "style": STYLE_RED
  },
  "battle_fury": {
    "name": "Battle Fury",
    "description": "This character can’t make range attacks, can’t be given RANGE actions, can’t be carried, can’t be given action tokens by opposing effects, and has SAFEGUARD: Mind Control. When this character attacks, opposing character can’t use Shape Change.",
    "type": "damage",
    "style": STYLE_ORANGE
  },
  "support": {
    "name": "Support",
    "description": "POWER: Choose a target adjacent friendly character. If this character and the target aren’t adjacent to any opposing characters, roll 2d6. Add the result to this character’s attack value, and if that is equal to or higher than the target’s defense value, roll a d6. The target is healed of that result - 2, minimum 2. (This is not an attack.)",
    "type": "damage",
    "style": STYLE_YELLOW
  },
  "exploit_weakness": {
    "name": "Exploit Weakness",
    "description": "When this character makes a close attack, damage is penetrating.",
    "type": "damage",
    "style": STYLE_LIGHT_GREEN
  },
  "enhancement": {
    "name": "Enhancement",
    "description": "Adjacent friendly characters modify damage +1 while making a range attack or using RANGE destroy.",
    "type": "damage",
    "style": STYLE_GREEN
  },
  "probability_control": {
    "name": "Probability Control",
    "description": "Once per turn, you may reroll a target character’s attack roll or break away roll. A targeted character must be within range and line of fire, minimum range 6.",
    "type": "damage",
    "style": STYLE_LIGHT_BLUE
  },
  "shape_change": {
    "name": "Shape Change",
    "description": "When this character would be targeted by an attack, you may roll a d6. [5] - [6]: This character can’t be targeted by the attacker this turn and the attacker may choose a different target instead.",
    "type": "damage",
    "style": STYLE_BLUE
  },
  "close_combat_expert": {
    "name": "Close Combat Expert",
    "description": "This character modifies attack and damage +1 while making a close attack or using CLOSE destroy",
    "type": "damage",
    "style": STYLE_PURPLE
  },
  "empower": {
    "name": "Empower",
    "description": "Adjacent friendly characters modify damage +1 while making close attacks or using CLOSE destroy",
    "type": "damage",
    "style": STYLE_PINK
  },
  "perplex": {
    "name": "Perplex",
    "description": "FREE: Minimum range 6. Choose a target character within range and line of fire. Modify one of that character’s combat values other than damage +1 or -1 until your next turn.",
    "type": "damage",
    "style": STYLE_BROWN
  },
  "outwit": {
    "name": "Outwit",
    "description": "FREE: Minimum range 6. Choose a target opposing character within range and line of fire and then choose one: any standard power -or- a special power printed on the target’s card. The target can’t use the chosen power until your next turn.",
    "type": "damage",
    "style": STYLE_BLACK
  },
  "leadership": {
    "name": "Leadership",
    "description": "For all friendly characters that can use Leadership, Action Total +1. // At the beginning of your turn, you may roll a d6. [5] - [6]: Remove an action token from an adjacent friendly character that’s less points or shares a keyword.",
    "type": "damage",
    "style": STYLE_GRAY
  },
  "special": {
    "name": "Special Power",
    "description": "See Card.",
    "type": "special",
    "style": STYLE_WHITE
  },
  "stop": {
    "name": "STOP",
    "description": "When this click is revealed due to damage taken from an opponent's attack, stop turning the dial. When this character would be healed by Regeneration or Support, it’s healed 1 less click. Protected: Outwit, Pulse Wave.",
    "type": "special",
    "style": STYLE_WHITE
  },
  "trap": {
    "name": "Trap",
    "description": "See Card",
    "type": "special",
    "image": "/static/images/sp/trap.png"
  },
  "spell": {
    "name": "Spell",
    "description": "See Card",
    "type": "special",
    "image": "/static/images/sp/spell.png"
  },
};

const POWER_TYPE_LIST = {
  "speed": {
    "name": "Speed"
  },
  "attack": {
    "name": "Attack"
  },
  "defense": {
    "name": "Defense"
  },
  "damage": {
    "name": "Damage"
  },
  "special": {
    "name": "Special"
  }
};

const SPECIAL_POWER_TYPE_LIST = {
  "trait": {
    "name": "Trait"
  },
  "speed": {
    "name": "Special Power (speed)"
  },
  "attack": {
    "name": "Special Power (attack)"
  },
  "defense": {
    "name": "Special Power (defense)"
  },
  "damage": {
    "name": "Special Power (damage)"
  },
  "costed_trait": {
    "name": "Costed Trait",
    "title": "POINT VALUE TRAIT",
    "description": "This trait can only be used when the game element is added to a starting force at a specific point value."
  },
  "rally_trait": {
    "name": "Rally Trait",
    "title": "RALLY",
    "description": "Once per roll for each die in a finalized attack roll and for all characters with a matching RALLY die and trait color printed under their trait star, after resolutions you may choose a friendly character to gain a matching RALLY die. RALLY trait colors specify which attack type they can gain RALLY dies from. BLUE = Friendly Attack Rolls. RED = Opposing Attack Rolls. GREEN = All Attack Rolls. When a character gains a RALLY die, place a die with the matching result on their card."
  },
  "title_trait": {
    "name": "Title",
    "title": "TITLE CHARACTER ABILITIES",
    "description": "Title characters start the game with and can accumulate tokens (called \"Plot Points\") on their card. They have special Plot abilities activated by FREE actions that can add or remove Plot Points: (Add Plot Points) and (Subtract Plot Points). You can only activate one Plot ability a turn. When you activate a Add Points Plot ability, give the Title Character that many Plot Points. You can't activate a Subtract Plot ability unless you are able to remove that many Plot Points. Title Characters also have Continuity trait abilities: Continuity abilities have \"Protected: Pulse Wave\". You may only have one title character on your starting force, and title characters can't replace or be replaced by other characters. At the end of your turn, if the title character activated a Plot ability but didn't make an attack, deal it 1 unavoidable damage."
  },
  "plus_plot_points": {
    "name": "Add Plot Points"
  },
  "minus_plot_points": {
    "name": "Subtract Plot Points"
  },
  "location": {
    "name": "Location",
    "title": "LOCATION",
    "description": "LOCATION: You may add one Location to your starting force. You may add any number of the Location's different Bonuses to your staring force by paying their costs. If you are the player that chooses the map and you chose the Location, you can use the Bonus(es) you paid for. If you didn't choose the map and didn't win the roll for the first player, you instead can use the Consolation(s) associated with the Bonus(es) you paid for. (Otherwise, there are no effects.) SCORING: Your Location's Bonus(es) that you paid for are scored if you are defeated. (Whether you received the Bonus, the Consolation, or nothing.)"
  },
  "epic": {
    "name": "Epic Action"
  },
  "construct": {
    "name": "Construct"
  },
  "word_balloon": {
    "name": "Word Ballon"
  },
  "toy": {
    "name": "Toy"
  },
  "fusion": {
    "name": "Fusion"
  },
  "spell": {
    "name": "Spell"
  },
  "trap": {
    "name": "Trap"
  },
};