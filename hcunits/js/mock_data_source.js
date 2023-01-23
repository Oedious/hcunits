var MockDataSource = function() {
  /*
    this.units_ = [{
        "unit_id": "set001",
        "set_id": "set",
        "collector_number": "001",
        "name": "Simple Super",
        "type": "character",
        "point_value": 5,
        "rarity": "common",
        "age": "modern",
        "real_name": "Simple Steve",
        "unit_range": 0,
        "targets": 1,
        "dimensions": "1x1",
        "speed_type": "boot",
        "attack_type": "fist",
        "defense_type": "indomitable",
        "damage_type": "starburst",
        "dial_start": 1,
        "dial_size": 12,
        "dial": [{
            "speed_value": 7,
            "attack_value": 8,
            "defense_value": 9,
            "damage_value": 10
        }]
    }, {
        "unit_id": "set002",
        "set_id": "set",
        "collector_number": "002",
        "name": "Rainbow Girl, Color Keeper",
        "type": "character",
        "point_value": 300,
        "rarity": "uncommon",
        "age": "modern",
        "real_name": "Riley Rainbow",
        "team_abilities": ["avengers", "avengers_initiative", "shield"],
        "traits": [{
            "name": "THOSE WHO LOVE LIGHT MUST JOIN ME",
            "value": "Energy Shield/Deflection, Leadership.",
            "powers": ["energy_shield_deflection", "leadership"]
        }],
        "unit_range": 10,
        "targets": 3,
        "dimensions": "1x1",
        "keywords": ["Avengers", "Justice League", "S.H.I.E.L.D.", "Brigade of Light", "Happy Happy Joy Joy"],
        "speed_type": "wing",
        "attack_type": "fist",
        "defense_type": "indomitable",
        "damage_type": "starburst",
        "dial_start": 1,
        "dial_size": 12,
        "dial": [{
                "speed_power": "flurry",
                "speed_value": 10,
                "attack_power": "blades_claws_fangs",
                "attack_value": 10,
                "defense_power": "super_senses",
                "defense_value": 18,
                "damage_power": "ranged_combat_expert",
                "damage_value": 2
            },
            {
                "speed_power": "leap_climb",
                "speed_value": 10,
                "attack_power": "energy_explosion",
                "attack_value": 10,
                "defense_power": "toughness",
                "defense_value": 18,
                "damage_power": "battle_fury",
                "damage_value": 2
            },
            {
                "speed_power": "phasing_teleport",
                "speed_value": 10,
                "attack_power": "pulse_wave",
                "attack_value": 10,
                "defense_power": "defend",
                "defense_value": 18,
                "damage_power": "support",
                "damage_value": 2
            },
            {
                "speed_power": "earthbound_neutralized",
                "speed_value": 10,
                "attack_power": "quake",
                "attack_value": 10,
                "defense_power": "combat_reflexes",
                "defense_value": 18,
                "damage_power": "exploit_weakness",
                "damage_value": 2
            },
            {
                "speed_power": "charge",
                "speed_value": 10,
                "attack_power": "super_strength",
                "attack_value": 10,
                "defense_power": "energy_shield_deflection",
                "defense_value": 18,
                "damage_power": "enhancement",
                "damage_value": 2
            },
            {
                "speed_power": "mind_control",
                "speed_value": 10,
                "attack_power": "incapacitate",
                "attack_value": 10,
                "defense_power": "barrier",
                "defense_value": 18,
                "damage_power": "probability_control",
                "damage_value": 2
            },
            {
                "speed_power": "plasticity",
                "speed_value": 10,
                "attack_power": "penetrating_psychic_blast",
                "attack_value": 10,
                "defense_power": "mastermind",
                "defense_value": 18,
                "damage_power": "shape_change",
                "damage_value": 2
            },
            {
                "speed_power": "force_blast",
                "speed_value": 10,
                "attack_power": "smoke_cloud",
                "attack_value": 10,
                "defense_power": "willpower",
                "defense_value": 18,
                "damage_power": "close_combat_expert",
                "damage_value": 2
            },
            {
                "speed_power": "sidestep",
                "speed_value": 10,
                "attack_power": "precision_strike",
                "attack_value": 10,
                "defense_power": "invincible",
                "defense_value": 18,
                "damage_power": "empower",
                "damage_value": 2
            },
            {
                "speed_power": "hypersonic_speed",
                "speed_value": 10,
                "attack_power": "poison",
                "attack_value": 10,
                "defense_power": "impervious",
                "defense_value": 18,
                "damage_power": "perplex",
                "damage_value": 2
            },
            {
                "speed_power": "stealth",
                "speed_value": 10,
                "attack_power": "steal_energy",
                "attack_value": 10,
                "defense_power": "regeneration",
                "defense_value": 18,
                "damage_power": "outwit",
                "damage_value": 2
            },
            {
                "speed_power": "running_shot",
                "speed_value": 10,
                "attack_power": "telekinesis",
                "attack_value": 10,
                "defense_power": "invulnerability",
                "defense_value": 18,
                "damage_power": "leadership",
                "damage_value": 2
            }
        ]
    }, {
        "unit_id": "set003",
        "set_id": "set",
        "collector_number": "003",
        "name": "Special Girl",
        "type": "character",
        "point_value": 50,
        "rarity": "rare",
        "age": "modern",
        "real_name": "Special Sal",
        "unit_range": 6,
        "targets": 2,
        "keywords": ["Elders of the Universe", "Cosmic"],
        "special_powers": [{
            "type": "trait",
            "name": "TRAITED POWER",
            "value": "This is a very special trait. It gives you the ability to see through space and time.",
            "powers": ["telekinesis"]
        }, {
            "type": "speed",
            "name": "IF I MOVED ANY FASTER, I WOULD BREAK THE SPEED OF LIGHT",
            "value": "Hypersonic Speed, but replace your speed value with 100 before doing so.",
            "powers": ["hypersonic_speed"]
        }, {
            "type": "attack",
            "name": "SPECIAL ATTACK",
            "value": "Pulse Wave, but special.",
            "powers": ["pulse_wave"]
        }, {
            "type": "defense",
            "name": "SPECIAL DEFENSE",
            "value": "Impervious, but special.",
            "powers": ["impervious"]
        }, {
            "type": "damage",
            "name": "SPECIAL DAMAGE",
            "value": "Enhancement, but special.",
            "powers": ["enhancement"]
        }],
        "dimensions": "1x1",
        "speed_type": "boot",
        "attack_type": "fist",
        "defense_type": "indomitable",
        "damage_type": "starburst",
        "dial_start": 1,
        "dial_size": 12,
        "dial": [{
            "speed_power": "special",
            "speed_value": 10,
            "attack_power": "special",
            "attack_value": 10,
            "defense_power": "special",
            "defense_value": 17,
            "damage_power": "special",
            "damage_value": 2
        }]
    }
  ];*/
}

MockDataSource.prototype.searchBySetId = function(setId, onSuccess, onError) {
  this.units_ = []
  var dataSource = this;
  jQuery.ajax({
    url: `../hcunits/db/set_${setId}.json`,
    type: 'get',
    success: function(response) {
      dataSource.units_ = response
      // Sort units by unit ID.
      onSuccess(response);
    },
    error: onError
  });
}

MockDataSource.prototype.searchByUnitId = function(unitId, onSuccess, onError) {
  for (var unit of this.units_) {
    if (unit.unit_id == unitId) {
      onSuccess(unit);
      return;
    }
  }
}
