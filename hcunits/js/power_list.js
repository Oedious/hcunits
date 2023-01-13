const POWER_LIST = {
  "special": {
    "name": "Special Power",
    "rules": "See Card.",
    "style": STYLE_WHITE
  },
  "flurry": {
    "name": "Flurry",
    "rules": "CLOSE: Make up to two close attacks",
    "style": STYLE_RED
  },
  "leap_climb": {
    "name": "Leap/Climb",
    "rules": "Improved Movement: Elevated, Outdoor Blocking, Move Through.",
    "style": STYLE_ORANGE
  },
  "phasing_teleport": {
    "name": "Phasing/Teleport",
    "rules": "MOVE: Improved Movement: Elevated, Blocking, Characters. Move.",
    "style": STYLE_YELLOW
  },
  "earthbound_neutralized": {
    "name": "Earthbound/Neutralized",
    "rules": "This character can't use Improved Movement or Improved Targeting abilities.",
    "style": STYLE_LIGHT_GREEN
  },
  "charge": {
    "name": "Charge",
    "rules": "POWER: Halve speed. Move, then CLOSE as FREE -or- make a close attack.",
    "style": STYLE_GREEN
  },
  "mind_control": {
    "name": "Mind Control",
    "rules": "CLOSE/RANGE: Minimum range 6. Make a close/range attack. Instead of normal damage, each hit character halves speed and becomes friendly to your force and, one at a time, may in either order: Move and/or make an attack, then it reverts forces.",
    "style": STYLE_LIGHT_BLUE
  },
  "plasticity": {
    "name": "Plasticity",
    "rules": "This character breaks away on any result except a [1]. Adjacent opposing characters that can’t use Phasing/Teleport, Plasticity, Leap/Climb, or Hypersonic Speed only break away on a [6].",
    "style": STYLE_BLUE
  },
  "force_blast": {
    "name": "Force Blast",
    "rules": "KNOCKBACK. // POWER: Minimum range 6. Knock back an opposing character within range and line of fire 3 squares away from this character.",
    "style": STYLE_PURPLE
  },
  "sidestep": {
    "name": "Sidestep",
    "rules": "FREE: Move up to 2 squares.",
    "style": STYLE_PINK
  },
  "hypersonic_speed": {
    "name": "Hypersonic Speed",
    "rules": "POWER: Halve range, Passenger:0, Improved Movement: Move Through. Move, then make an attack, then move up to your speed value minus the number of squares just moved.",
    "style": STYLE_BROWN
  },
  "stealth": {
    "name": "Stealth",
    "rules": "When it’s not your turn, hindered lines of fire drawn to this character by nonadjacent characters are blocked.",
    "style": STYLE_BLACK
  },
  "running_shot": {
    "name": "Running Shot",
    "rules": " POWER: Halve speed. Move, then RANGE as FREE -or- make a range attack.",
    "style": STYLE_GRAY
  },
  "blades_claws_fangs": {
    "name": "Blades/Claws/Fangs",
    "rules": "When this character makes a close attack against a single target and hits, you may roll a d6. If you do, deal damage equal to the result instead of normal damage. Minimum result is this character’s printed damage value -1.",
    "style": STYLE_RED
  },
  "energy_explosion": {
    "name": "Energy Explosion",
    "rules": "RANGE: Make a range attack and all other characters adjacent to an original target also become targets. Hit characters are dealt 2 damage instead of normal damage.",
    "style": STYLE_ORANGE
  },
  "pulse_wave": {
    "name": "Pulse Wave",
    "rules": "RANGE: Halve range, Improved Targeting: Characters, Adjacent. Other characters within range can’t use powers or abilities (for this action). Make a range attack targeting all other characters within range and line of fire, including at least one opposing character, using printed defense values for each targeted character. Each hit character is dealt 1 damage instead of normal damage.",
    "style": STYLE_YELLOW
  },
  "quake": {
    "name": "Quake",
    "rules": "When this character makes a close attack, they may target all adjacent opposing characters. If they do, they gain KNOCKBACK (for this attack) and deal each hit character 2 damage instead of normal damage.",
    "style": STYLE_LIGHT_GREEN
  },
  "super_strength": {
    "name": "Super Strength",
    "rules": "KNOCKBACK during close attacks. This character can pick up (and hold) heavy objects.",
    "style": STYLE_GREEN
  },
  "incapacitate": {
    "name": "Incapacitate",
    "rules": "When this character makes an attack, instead of normal damage, you may give each hit character an action token.",
    "style": STYLE_LIGHT_BLUE
  },
  "penetrating_psychic_blast": {
    "name": "Penetrating/Psychic Blast",
    "rules": "When this character makes a range attack, damage is penetrating.",
    "style": STYLE_BLUE
  },
  "smoke_cloud": {
    "name": "Smoke Cloud",
    "rules": "POWER: Minimum range 6. Generate up to 6 hindering terrain markers, one at a time, in distinct squares within range. Other than the first, each marker must be adjacent to at least one other, and at least one must be within line of fire. Opposing characters occupying one or more of these markers modify attack -1. At the beginning of your next turn, (even if this is lost) remove them.",
    "style": STYLE_PURPLE
  },
  "precision_strike": {
    "name": "Precision Strike",
    "rules": "When this character attacks, damage taken from the attack can’t be reduced below 1 and the target decreases its d6 roll for Super Senses by -1.",
    "style": STYLE_PINK
  },
  "poison": {
    "name": "Poison",
    "rules": "FREE: If this character hasn’t moved or been placed this turn, deal 1 damage to all adjacent opposing characters.",
    "style": STYLE_BROWN
  },
  "steal_energy": {
    "name": "Steal Energy",
    "rules": "When this character hits and damages one or more characters with a close attack, after resolutions heal this character 1 click.",
    "style": STYLE_BLACK
  },
  "telekinesis": {
    "name": "Telekinesis",
    "rules": " POWER: Minimum range 6. Place one target friendly single-base character or object within range and line of fire into another square within range and line of fire. That square must be within 6 squares and line of fire from the target’s current square. Characters placed with this power can’t use Telekinesis this turn.",
    "style": STYLE_GRAY
  },
  "super_senses": {
    "name": "Super Senses",
    "rules": " When this character would be hit, you may roll a d6. [5] - [6]: Evade.",
    "style": STYLE_RED
  },
  "toughness": {
    "name": "Toughness",
    "rules": "Reduce damage taken by 1.",
    "style": STYLE_ORANGE
  },
  "defend": {
    "name": "Defend",
    "rules": "Adjacent friendly characters may replace their defense value with this character’s printed defense value.",
    "style": STYLE_YELLOW
  },
  "combat_reflexes": {
    "name": "Combat Reflexes",
    "rules": "Modify defense +2 against close attacks.",
    "style": STYLE_LIGHT_GREEN
  },
  "energy_shield_deflection": {
    "name": "Energy Shield/Deflection",
    "rules": "Modify defense +2 against range attacks.",
    "style": STYLE_GREEN
  },
  "barrier": {
    "name": "Barrier",
    "rules": "POWER: Minimum range 6. Generate up to 4 blocking terrain markers, one at a time, in distinct squares within range. Other than the first, each marker must be adjacent to at least one other, and at least one must be within line of fire. At the beginning of your next turn, (even if this is lost) remove them.",
    "style": STYLE_LIGHT_BLUE
  },
  "mastermind": {
    "name": "Mastermind",
    "rules": "When this character would be hit by an opponent’s attack that deals damage, you may choose an adjacent friendly character that wouldn’t be hit by this attack and that is less points or shares a keyword. That friendly character instead becomes a hit target of the attack, even if it’s already a target (or would be an illegal target).",
    "style": STYLE_BLUE
  },
  "willpower": {
    "name": "Willpower",
    "rules": "At the beginning of your turn, you may roll a d6. [5] - [6]: Remove an action token from this character.",
    "style": STYLE_PURPLE
  },
  "invincible": {
    "name": "Invincible",
    "rules": " Reduce damage taken by 2. // Can reduce penetrating damage.",
    "style": STYLE_PINK
  },
  "impervious": {
    "name": "Impervious",
    "rules": "Reduce damage taken by 2. // When this character would take damage from an attack, you may roll a d6. [5] - [6]: Damage taken is reduced to 0.",
    "style": STYLE_BROWN
  },
  "regeneration": {
    "name": "Regeneration",
    "rules": "POWER: Roll a d6. Heal a number of clicks equal to half the result (rounded up).",
    "style": STYLE_BLACK
  },
  "invulnerability": {
    "name": "Invulnerability",
    "rules": " Reduce damage taken by 2.",
    "style": STYLE_GRAY
  },
  "ranged_combat_expert": {
    "name": "Ranged Combat Expert",
    "rules": "This character modifies attack and damage +1 while making a range attack or using RANGE destroy.",
    "style": STYLE_RED
  },
  "battle_fury": {
    "name": "Battle Fury",
    "rules": "This character can’t make range attacks, can’t be given RANGE actions, can’t be carried, can’t be given action tokens by opposing effects, and has SAFEGUARD: Mind Control. When this character attacks, opposing character can’t use Shape Change.",
    "style": STYLE_ORANGE
  },
  "support": {
    "name": "Support",
    "rules": "POWER: Choose a target adjacent friendly character. If this character and the target aren’t adjacent to any opposing characters, roll 2d6. Add the result to this character’s attack value, and if that is equal to or higher than the target’s defense value, roll a d6. The target is healed of that result - 2, minimum 2. (This is not an attack.)",
    "style": STYLE_YELLOW
  },
  "exploit_weakness": {
    "name": "Exploit Weakness",
    "rules": "When this character makes a close attack, damage is penetrating.",
    "style": STYLE_LIGHT_GREEN
  },
  "enhancement": {
    "name": "Enhancement",
    "rules": "Adjacent friendly characters modify damage +1 while making a range attack or using RANGE destroy.",
    "style": STYLE_GREEN
  },
  "probability_control": {
    "name": "Probability Control",
    "rules": "Once per turn, you may reroll a target character’s attack roll or break away roll. A targeted character must be within range and line of fire, minimum range 6.",
    "style": STYLE_LIGHT_BLUE
  },
  "shape_change": {
    "name": "Shape Change",
    "rules": "When this character would be targeted by an attack, you may roll a d6. [5] - [6]: This character can’t be targeted by the attacker this turn and the attacker may choose a different target instead.",
    "style": STYLE_BLUE
  },
  "close_combat_expert": {
    "name": "Close Combat Expert",
    "rules": "This character modifies attack and damage +1 while making a close attack or using CLOSE destroy",
    "style": STYLE_PURPLE
  },
  "empower": {
    "name": "Empower",
    "rules": "Adjacent friendly characters modify damage +1 while making close attacks or using CLOSE destroy",
    "style": STYLE_PINK
  },
  "perplex": {
    "name": "Perplex",
    "rules": "FREE: Minimum range 6. Choose a target character within range and line of fire. Modify one of that character’s combat values other than damage +1 or -1 until your next turn.",
    "style": STYLE_BROWN
  },
  "outwit": {
    "name": "Outwit",
    "rules": "FREE: Minimum range 6. Choose a target opposing character within range and line of fire and then choose one: any standard power -or- a special power printed on the target’s card. The target can’t use the chosen power until your next turn.",
    "style": STYLE_BLACK
  },
  "leadership": {
    "name": "Leadership",
    "rules": "For all friendly characters that can use Leadership, Action Total +1. // At the beginning of your turn, you may roll a d6. [5] - [6]: Remove an action token from an adjacent friendly character that’s less points or shares a keyword.",
    "style": STYLE_GRAY
  }
};