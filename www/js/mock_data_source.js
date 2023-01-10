var MockDataSource = function() {
  this.NUMBER_OF_SETS_ = 30;
  this.NUMBER_OF_UNITS_ = 20;
}

MockDataSource.prototype.getSetList = function() {
  var universeList = ["dc", "marvel", "indy", "universal"];
  var setList = [];
  for (var i = 0; i < this.NUMBER_OF_SETS_; ++i) {
    var setItem = {
      "id": "id_" + i,
      "universe": universeList[i % 4],
      "name": "Set " + i
    };
    setList.push(setItem);
  }
  return setList;
}

MockDataSource.prototype.searchBySetId = function(setId, onSuccess, onError) {
  const zeroPad = (num, places) => String(num).padStart(places, '0');

  var namePrefix = ["Captain", "Super", "Wonder", "Dr."];
  var nameSuffix= ["Man", "Woman", "Rabbit", "Strange"];
  var rarityList = ["common", "uncommon", "rare", "super_rare", "chase", "ultra_chase"];
  var unitList = [];
  for (var i = 0; i < this.NUMBER_OF_UNITS_; ++i) {
    var unitId = "id_" + i;
    var name =
        namePrefix[Math.floor(Math.random() * namePrefix.length)] +
        " " + nameSuffix[Math.floor(Math.random() * nameSuffix.length)];
    var collectorNumber =
        zeroPad(Math.floor(i / this.NUMBER_OF_UNITS_ * 70) + 1, 3);
    var point_value = (Math.floor(Math.random() * 40) + 1) * 5;
    var rarityIndex = Math.floor(i / (this.NUMBER_OF_UNITS_ + 1) * rarityList.length);
    var rarity = rarityList[rarityIndex];
    var unit = {
      "unit_id": unitId,
      "name": name,
      "collector_number": collectorNumber,
      "point_value": point_value,
      "rarity": rarity
    };
    unitList.push(unit);
  }
  onSuccess(JSON.stringify(unitList));
  return;
}

MockDataSource.prototype.searchByUnitId = function(unitId, onSuccess, onError) {
  onSuccess(JSON.stringify({
    "unit_id": "av4e001",
    "set_id": "av4e",
    "collector_number": "001",
    "name": "Captain America",
    "type": "character",
    "point_value": 90,
    "rarity": "common",
    "age": "modern",
    "real_name": "Steve Rogers",
    "team_abilities": ["avengers", "avengers_initiative", "shield"],
    "trait_0": {
      "name": "THOSE WHO OPPOSE HIS SHIELD MUST YIELD",
      "value": "Energy Shield/Deflection, Leadership.",
      "powers": ["Energy Shield/Deflection", "Leadership"]
    },
    "unit_range": 5,
    "targets": 2,
    "dimensions": "1x1",
    "keywords": ["Avengers", "Howling Commandos", "Invaders", "Past", "S.H.I.E.L.D.", "Soldier"],
    "speed_type": "boot",
    "attack_type": "fist",
    "defense_type": "indomitable",
    "damage_type": "starburst",
    "dial_start": 1,
    "dial_size": 12,
    "dial": [{
        "speed_power": "Running Shot",
        "speed_value": 10,
        "attack_value": 11,
        "defense_power": "Toughness",
        "defense_value": 18,
        "damage_power": "Outwit",
        "damage_value": 3
    },
    {
        "speed_power": "Running Shot",
        "speed_value": 8,
        "attack_value": 11,
        "defense_power": "Toughness",
        "defense_value": 18,
        "damage_power": "Outwit",
        "damage_value": 3
    },
    {
      "speed_power": "Running Shot",
      "speed_value": 8,
      "attack_value": 11,
      "defense_power": "Toughness",
      "defense_value": 17,
      "damage_power": "Outwit",
      "damage_value": 3
    },{
      "speed_power": "Running Shot",
      "speed_value": 8,
      "attack_value": 11,
      "defense_power": "Toughness",
      "defense_value": 17,
      "damage_power": "Outwit",
      "damage_value": 3
    },
    {
      "speed_power": "Charge",
      "speed_value": 8,
      "attack_power": "Quake",
      "attack_value": 11,
      "defense_power": "Combat Reflexes",
      "defense_value": 17,
      "damage_value": 3
    },
    {
      "speed_power": "Charge",
      "speed_value": 8,
      "attack_power": "Quake",
      "attack_value": 11,
      "defense_power": "Combat Reflexes",
      "defense_value": 17,
      "damage_value": 3
    },
    {
      "speed_power": "Charge",
      "speed_value": 8,
      "attack_power": "Quake",
      "attack_value": 11,
      "defense_power": "Combat Reflexes",
      "defense_value": 17,
      "damage_value": 3
    },
    {
      "speed_power": "Flurry",
      "speed_value": 8,
      "attack_value": 10,
      "defense_power": "Willpower",
      "defense_value": 17,
      "damage_power": "Close Combat Expert",
      "damage_value": 2
    },
    {
      "speed_power": "Flurry",
      "speed_value": 8,
      "attack_value": 10,
      "defense_power": "Willpower",
      "defense_value": 16,
      "damage_power": "Close Combat Expert",
      "damage_value": 2
    }]
  }));
}
