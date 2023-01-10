var ViewManager = function(dataSource) {
  this.dataSource_ = dataSource;
  this.loadSetMenu_();
  this.unit_ = null;
}

ViewManager.prototype.loadSetMenu_ = function() {
  var setList = this.dataSource_.getSetList();
  var html = '';
  for (var setItem of setList) {
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
      <span class='setItemLink' onclick='mgr.searchBySetId("${setItem.id}")'>
        <img class='setIcon' src='/wp-content/uploads/set_${setItem.id}.png' alt='${setItem.id}' title='${setItem.name}'/>
        <div class='setName'>${setItem.id}</div>
      </span>
    </div>
    `;
  }
  var setMenu = document.getElementById("setMenu");
  setMenu.innerHTML = html;
}

ViewManager.prototype.searchBySetId = function(setId) {
	this.dataSource_.searchBySetId(setId,
		function(searchResults) {
			var units = JSON.parse(searchResults);
			var html = "";
			for (var unit of units) {
				var color = RARITY_TO_COLOR[unit.rarity];
				html += `
          <li class="collection-item avatar">
            <a href='' onclick='mgr.searchByUnitId("${unit.id}"); return false;'>
              <i class="material-icons circle" style="font-size: 36px; color:${color};">account_circle</i>
              <span class="title">${unit.collector_number} - ${unit.name}</span>
              <p class="searchResultInfo">${unit.point_value} points</p>
            </a>
          </li>`;
			}
			document.getElementById("searchResults").innerHTML = html;
		},
		function(xhr, desc, err) {
			alert("Error in searchBySetId(" + setId + "): " + desc) + " err=" + err;
		});
}

ViewManager.prototype.searchByKeyword = function(keyword) {
}

ViewManager.prototype.searchByUnitId = function(unitId) {
	this.dataSource_.searchByUnitId(unitId,
		function(searchResults) {
			var unitJson = JSON.parse(searchResults);
			mgr.loadUnit(unitJson);
		},
		function(xhr, desc, err) {
			alert("Error in searchByUnitId(" + unitId + "): " + desc) + " err=" + err;
		});
}

ViewManager.prototype.loadUnit = function(unitJson) {
  this.unit_ = new Unit(unitJson);
  this.unit_.draw();
}
