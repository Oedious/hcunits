var ViewManager = function(dataSource) {
  this.dataSource_ = dataSource;
  this.searchMgr_ = new SearchManager(dataSource);
  this.unitView_ = null;
  this.loadSetMenu_();
}

ViewManager.prototype.loadSetMenu_ = function() {
  var html = '';
  for (var setId in SET_LIST) {
    var setItem = SET_LIST[setId];
    var universe_color;
    switch (setItem.universe) {
      case "dc":
        universe_color = "blue";
        break;
      case "marvel":
        universe_color = "red";
        break;
      case "indy":
        universe_color = "green";
        break;
      default:
        universe_color = "purple";
        break;
    }
  
    html += `
      <div class='setItem' style='border-bottom: 2px solid ${universe_color};'>
      <span class='setItemLink' onclick='mgr.searchBySetId("${setId}")'>
        <img class='setIcon' src='../hcunits/images/set_${setId}.png' alt='${setId}' title='${setItem.name}'/>
        <div class='setName'>${setId}</div>
      </span>
    </div>
    `;
  }
  var setMenu = document.getElementById("setMenu");
  setMenu.innerHTML = html;
}

ViewManager.prototype.searchBySetId = function(setId) {
  this.searchMgr_.searchBySetId(setId);
}

ViewManager.prototype.searchByKeyword = function(keyword) {
}

ViewManager.prototype.showUnit = function(unitId) {
  this.searchMgr_.setCurrentUnit(unitId);
  var viewMgr = this;
	this.dataSource_.searchByUnitId(unitId,
		function(unitJson) {
			viewMgr.showUnit_(unitJson);
		},
		function(xhr, desc, err) {
			alert("Error in showUnit(" + unitId + "): " + desc) + " err=" + err;
		});
}

ViewManager.prototype.showUnit_ = function(unitJson) {
  if (unitJson.type == "character") {
      this.unitView_ = new CharacterView(unitJson);
  } else {
    throw new Error(`ViewManager doesn't know how to handle unit type ${unitJson.type}`);
  }
  this.unitView_.draw();
}

ViewManager.prototype.previousUnit = function() {
  this.searchMgr_.previousUnit();
}

ViewManager.prototype.nextUnit = function() {
  this.searchMgr_.nextUnit();
}