var ViewManager = function(dataSource) {
  this.dataSource_ = dataSource;
  this.loadSetMenu_();
  this.searchMgr_ = new SearchManager(dataSource);
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
  this.searchMgr_.searchBySetId(setId);
}