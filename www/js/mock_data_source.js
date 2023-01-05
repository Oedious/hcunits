var MockDataSource = function() {
  this.NUMBER_OF_SETS_ = 30;
  this.NUMBER_OF_UNITS_ = 10;
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
  var rarityList = ["common", "uncommon", "rare", "super_rare", "chase"];
  var unitList = [];
  for (var i = 0; i < this.NUMBER_OF_UNITS_; ++i) {
    var unitId = "id_" + i;
    var name =
        namePrefix[Math.floor(Math.random() * namePrefix.length)] +
        " " + nameSuffix[Math.floor(Math.random() * nameSuffix.length)];
    var collectorNumber =
        zeroPad(Math.floor(i / this.NUMBER_OF_UNITS_ * 70) + 1, 3);
    var points = Math.floor(Math.random() * 200) + 5;
    var rarityIndex = Math.floor(i / this.NUMBER_OF_UNITS_ * rarityList.length);
    var rarity = rarityList[rarityIndex];
    var unit = {
      "unit_id": unitId,
      "name": name,
      "collector_number": collectorNumber,
      "points": points,
      "rarity": rarity
    };
    unitList.push(unit);
  }
  onSuccess(JSON.stringify(unitList));
  return;
}