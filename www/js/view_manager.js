var ViewManager = function(db) {
  M.AutoInit();
  var elem = document.querySelector('.collapsible.expandable');
  var instance = M.Collapsible.init(elem, {accordion: false});
  this.db_ = db;
  this.loadSetMenu_();
}

ViewManager.prototype.loadSetMenu_ = function() {
  var setList = this.db_.getSetList();
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
      <span class='setItemLink' onclick='searchBySetId("${setItem.id}")'>
        <img class='setIcon' src='/wp-content/uploads/set_${setItem.id}.png' alt='${setItem.id}' title='${setItem.name}'/>
        <div class='setName'>${setItem.id}</div>
      </span>
    </div>
    `;
  }
  var setMenu = document.getElementById("setMenu");
  setMenu.innertHTML = html;
}