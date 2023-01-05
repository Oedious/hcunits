var MockDataSource = function() {
  alert("MockDataSource ctor");
}

MockDataSource.prototype.getSetList = function() {
  var universeList = ["dc", "marvel", "indy", "universal"];
  var setList = [];
  for (var i = 0; i < 20; ++i) {
    var setItem = {
      "id": "id_" + i,
      "universe": universeList[i % 4],
      "name": "Set " + i
    };
    setList.push(setItem);
  }
  return setList;
}