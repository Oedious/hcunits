const TEAM_ABILITY_LIST = {
  "cosmic_energy": {
    "name": "Cosmic Energy",
    "universe": "universal",
    "description": "Willpower. This character has SAFEGUARD: Outwit. Uncopyable.",
    "copyable": false,
    "wildcard": false
  },
  "mystics": {
    "name": "Mystics",
    "universe": "universal",
    "description": "Each time this character takes damage from an opposing character's attack, after resolutions deal the attacker 1 penetrating damage. Uncopyable.",
    "copyable": true,
    "wildcard": false
  },
  "police": {
    "name": "Police",
    "universe": "universal",
    "description": "When an adjacent friendly character makes a range attack, modify the target’s defense -1 if the target is within line of fire of this character.",
    "copyable": true,
    "wildcard": false
  },
  "snowfall": {
    "name": "Snowfall",
    "universe": "universal",
    "description": " FREE: Choose a team ability that a friendly character can use (that isn’t Uncopyable). This character can use the chosen team ability until you choose again. Uncopyable.",
    "copyable": false,
    "wildcard": true
  },
  "team_player": {
    "name": "Team Player",
    "universe": "universal",
    "description": "FREE: Choose a team ability that a friendly character can use (that isn’t Uncopyable). This character can use the chosen team ability until you choose again. Uncopyable.",
    "copyable": false,
    "wildcard": true
  },
  "underworld": {
    "name": "Underworld",
    "universe": "universal",
    "description": "Passenger:1, but only to carry a character that shares a keyword. Passenger:2, but only to carry characters that share a keyword (with this character) and are lower points.",
    "copyable": true,
    "wildcard": false
  },
  "avengers": {
    "name": "Avengers",
    "universe": "marvel",
    "description": "When this character is given a MOVE action, modify speed +1.",
    "copyable": true,
    "wildcard": false
  },
  "avengers_initiative": {
    "name": "Avengers Initiative",
    "universe": "marvel",
    "description": "Improved Targeting: Hindering",
    "copyable": true,
    "wildcard": false
  },
  "brotherhood_of_mutants": {
    "name": "Brotherhood of Mutants",
    "universe": "marvel",
    "description": "When this character hits an opposing character with an attack roll of [10-12], after resolutions remove an action token from this character.",
    "copyable": true,
    "wildcard": false
  },
  "defenders": {
    "name": "Defenders",
    "universe": "marvel",
    "description": "When this character is attacked, you may replace its defense value with the printed defense value of an adjacent friendly character that can use this team ability.",
    "copyable": true,
    "wildcard": false
  },
  "fantastic_four": {
    "name": "Fantastic Four",
    "universe": "marvel",
    "description": "When this character is KO'd, after resolutions each other friendly character using this team ability heals 1 click.",
    "copyable": true,
    "wildcard": false
  },
  "guardians": {
    "name": "Guardians",
    "universe": "marvel",
    "description": "This character’s combat values can’t be modified by opposing characters’ effects.",
    "copyable": true,
    "wildcard": false
  },
  "hydra": {
    "name": "Hydra",
    "universe": "marvel",
    "description": "When an adjacent friendly character makes a range attack, modify the target’s defense -1 if the target is within line of fire of this character.",
    "copyable": true,
    "wildcard": false
  },
  "masters_of_evil": {
    "name": "Masters of Evil",
    "universe": "marvel",
    "description": "When an adjacent friendly character makes a close attack, modify the target’s defense -1 if the target is adjacent to this character.",
    "copyable": true,
    "wildcard": false
  },
  "minions_of_doom": {
    "name": "Minions of Doom",
    "universe": "marvel",
    "description": "When this character KO's a standard opposing character, after resolutions heal 1 click on a friendly character using this team ability.",
    "copyable": true,
    "wildcard": false
  },
  "power_cosmic": {
    "name": "Power Cosmic",
    "universe": "marvel",
    "description": "Willpower. This character has SAFEGUARD: Outwit. Uncopyable.",
    "copyable": false,
    "wildcard": false
  },
  "sinister_syndicate": {
    "name": "Sinister Syndicate",
    "universe": "marvel",
    "description": "When this character makes an attack, you may replace its attack value with the printed attack value of an adjacent friendly character that can use this team ability.",
    "copyable": true,
    "wildcard": false
  },
  "skrulls": {
    "name": "Skrulls",
    "universe": "marvel",
    "description": "Shape Change, but only succeeds on a D6. If the character can already use Shape Change, instead increase the result of its roll for Shape Change by +1.",
    "copyable": true,
    "wildcard": false
  },
  "spider_man": {
    "name": "Spider-Man",
    "universe": "marvel",
    "description": "FREE: Choose a team ability that a friendly character can use (that isn’t Uncopyable). This character can use the chosen team ability until you choose again. Uncopyable.",
    "copyable": false,
    "wildcard": true
  },
  "shield": {
    "name": "S.H.I.E.L.D.",
    "universe": "marvel",
    "description": "Adjacent friendly characters modify range +1. POWER: Choose an adjacent friendly character. Once this turn, the chosen character modifies its damage +1 when making a range attack.",
    "copyable": true,
    "wildcard": false
  },
  "ultimates": {
    "name": "Ultimates",
    "universe": "marvel",
    "description": "Improved Targeting Hindering",
    "copyable": true,
    "wildcard": false
  },
  "ultimate_x_men": {
    "name": "Ultimate X-Men",
    "universe": "marvel",
    "description": "Once per game per character, a character using the Ultimate X-Men team ability may choose one opposing character or all characters possessing a single chosen team ability; this choice can be made only once per game even if the character has used another team ability. When this character attacks a chosen character, modify the chosen character’s defense value by -1.",
    "copyable": true,
    "wildcard": false
  },
  "x_men": {
    "name": "X-Men",
    "universe": "marvel",
    "description": "POWER: Choose an adjacent friendly character that can use this team ability and heal that character 1 click and roll a d6. [D1-D4]: This character is dealt 1 unavoidable damage.",
    "copyable": true,
    "wildcard": false
  },
  "batman_ally": {
    "name": "Batman Ally",
    "universe": "dc",
    "description": "Stealth.",
    "copyable": true,
    "wildcard": false
  },
  "batman_enemy": {
    "name": "Batman Enemy",
    "universe": "dc",
    "description": "When this character makes an attack, you may replace its attack value with the printed attack value of an adjacent friendly character that can use this team ability.",
    "copyable": true,
    "wildcard": false
  },
  "calculator": {
    "name": "Calculator",
    "universe": "dc",
    "description": "FREE: Choose a team ability that a friendly character can use (that isn’t Uncopyable). This character can use the chosen team ability until you choose again. Uncopyable.",
    "copyable": false,
    "wildcard": true
  },
  "crime_syndicate": {
    "name": "Crime Syndicate",
    "universe": "dc",
    "description": "Characters using the Crime Syndicate team ability can use Probability Control. When a roll is ignored because of this team ability an action token must be placed on a friendly character on the battlefield or the roll is not ignored. Uncopyable.",
    "copyable": false,
    "wildcard": false,
  },
  "green_lantern_corps": {
    "name": "Green Lantern Corps",
    "universe": "dc",
    "description": "Passenger:8",
    "copyable": true,
    "wildcard": false
  },
  "hypertime": {
    "name": "Hypertime",
    "universe": "dc",
    "description": "When an opposing character that can't use this team ability attempts to move from a non-adjacent square into a square that is adjacent to this character, it must roll a d6. [D1-D2]: The opposing character can't move into any square adjacent to this character this turn. Uncopyable.",
    "copyable": false,
    "wildcard": false
  },
  "injustice_league": {
    "name": "Injustice League",
    "universe": "dc",
    "description": "When this character hits an opposing character with an attack roll of [10-12], after resolutions remove an action token from this character.",
    "copyable": true,
    "wildcard": false
  },
  "justice_league": {
    "name": "Justice League",
    "universe": "dc",
    "description": "When this character is given a MOVE action, modify speed +1.",
    "copyable": true,
    "wildcard": false
  },
  "justice_society": {
    "name": "Justice Society",
    "universe": "dc",
    "description": "When this character is attacked, you may replace its defense value with the printed defense value of an adjacent friendly character that can use this team ability.",
    "copyable": true,
    "wildcard": false
  },
  "kingdom_come": {
    "name": "Kingdom Come",
    "universe": "dc",
    "description": "When this character would be hit by a range attack, if the attacker doesn’t have [Kingdom Come Team Ability Symbol], you may roll a d6. [D5-D6]: Evade. Uncopyable.",
    "copyable": false,
    "wildcard": false
  },
  "legion_of_super_heroes": {
    "name": "Legion of Super-Heroes",
    "universe": "dc",
    "description": "FREE: Choose a team ability that a friendly character can use (that isn’t Uncopyable). This character can use the chosen team ability until you choose again. Uncopyable.",
    "copyable": false,
    "wildcard": true
  },
  "outsiders": {
    "name": "Outsiders",
    "universe": "dc",
    "description": "FREE: Choose a character (including itself) within 6 squares and line of fire. Until your next turn, the chosen character’s combat values can’t be modified. Uncopyable.",
    "copyable": false,
    "wildcard": false
  },
  "quintessence": {
    "name": "Quintessence",
    "universe": "dc",
    "description": "Willpower. This character has SAFEGUARD: Outwit. Uncopyable.",
    "copyable": false,
    "wildcard": false
  },
  "suicide_squad": {
    "name": "Suicide Squad",
    "universe": "dc",
    "description": "When an adjacent friendly character is KO’d, after resolutions, you may roll a d6. If you do, heal this character equal to the result -2, minimum 1.",
    "copyable": true,
    "wildcard": false
  },
  "superman_ally": {
    "name": "Superman Ally",
    "universe": "dc",
    "description": "Improved Targeting Hindering",
    "copyable": true,
    "wildcard": false
  },
  "superman_enemy": {
    "name": "Superman Enemy",
    "universe": "dc",
    "description": "FREE: If this character is adjacent to a friendly character of lower points that can use this team ability, it can use Outwit until your next turn.",
    "copyable": true,
    "wildcard": false
  },
  "titans": {
    "name": "Titans",
    "universe": "dc",
    "description": "POWER: Choose an adjacent friendly character that can use this team ability and heal that character 1 click and roll a d6. [D1-D4]: This character is dealt 1 unavoidable damage.",
    "copyable": true,
    "wildcard": false
  },
  "wonder_woman_ally": {
    "name": "Wonder Woman Ally",
    "universe": "dc",
    "description": "Super Senses, but only succeeds on a D6. If the character can already use Super Senses, instead increase the result of its roll for Super Senses by +1.",
    "copyable": true,
    "wildcard": false
  },
  "borg": {
    "name": "Borg",
    "universe": "star_trek",
    "description": "When an adjacent friendly character is KO’d, after resolutions, you may roll a d6. If you do, heal this character equal to the result -2, minimum 1.",
    "copyable": true,
    "wildcard": false
  },
  "cardassian_union": {
    "name": "Cardassian Union",
    "universe": "star_trek",
    "description": " At the beginning of the game, you may choose a team ability. This character modifies attack +1 when attacking only characters with the chosen team ability.",
    "copyable": true,
    "wildcard": false
  },
  "united_federation": {
    "name": "United Federation of Planets",
    "universe": "star_trek",
    "description": "When this character is given a MOVE action, modify speed +1.",
    "copyable": true,
    "wildcard": false
  },
  "ferengi_alliance": {
    "name": "Ferengi Alliance",
    "universe": "star_trek",
    "description": "Shape Change, but this use only succeeds on a D6.",
    "copyable": true,
    "wildcard": false
  },
  "klingon_empire": {
    "name": "Klingon Empire",
    "universe": "star_trek",
    "description": "When this character hits an opposing character with an attack roll of 10-12, after resolutions remove an action token from this character.",
    "copyable": true,
    "wildcard": false
  },
  "mirror_universe": {
    "name": "Mirror Universe",
    "universe": "star_trek",
    "description": "Each time this character takes damage from an opposing character's attack, after resolutions deal the attacker 1 penetrating damage. Uncopyable.",
    "copyable": false,
    "wildcard": false
  },
  "q_continuum": {
    "name": "Q Continuum",
    "universe": "star_trek",
    "description": "Willpower. This character has SAFEGUARD: Outwit. Uncopyable.",
    "copyable": false,
    "wildcard": false
  },
  "romulan_star_empire": {
    "name": "Romulan Star Empire",
    "universe": "star_trek",
    "description": "Stealth.",
    "copyable": true,
    "wildcard": false
  },
  "ascendent": {
    "name": "Ascendent",
    "universe": "mageknight",
    "description": "A character using this team ability modifies its attack value by +1 when marked with 1 action token.",
    "copyable": true,
    "wildcard": false
  },
  "council_of_the_mists": {
    "name": "Council of the Mists",
    "universe": "mageknight",
    "description": "A character using this team ability can use Probability Control, but only during your turn and if the reroll does not have at least one die with a 1 or 6, the reroll is ignored.",
    "copyable": true,
    "wildcard": false
  },
  "dominion_pact": {
    "name": "Dominion Pact",
    "universe": "mageknight",
    "description": "When an opposing character within 4 squares is ko'ed, characters using this team ability are healed 1 damage.",
    "copyable": true,
    "wildcard": false
  },
  "mage_spawn": {
    "name": "Mage Spawn",
    "universe": "mageknight",
    "description": "At the beginning of the game, choose a friendly character with the highest point value to be this team's master. If a character using this team ability is within 4 squares of its master when the master if given a move action, then the character using this team ability may be given a move action as a free action. Uncopyable.",
    "copyable": false,
    "wildcard": false
  },
  "mercenary": {
    "name": "Mercenary",
    "universe": "mageknight",
    "description": "At the beginning of the game, choose a friendly character with the highest point value to be this team's leader. A character using this team ability modifies its defense value by +1 when it is within 4 squares of its leader. Uncopyable.",
    "copyable": false,
    "wildcard": false
  },
  "phoenix_concord": {
    "name": "Phoenix Concord",
    "universe": "mageknight",
    "description": "Once per turn when a power or ability of a character using this team ability or an adjacent friendly character would be countered, roll a d6; on a result of 5-6 the power or ability is not countered.",
    "copyable": true,
    "wildcard": false
  },
}