//var dataSource = new DataSource();
var dataSource = new MockDataSource();
var mgr = new ViewManager(dataSource);

document.onkeydown = onKeyDown;

function onKeyDown(event) {
  var KEY_LEFT = '37';
  var KEY_UP = '38';
  var KEY_RIGHT = '39';
  var KEY_DOWN = '40';
  event = event || window.event;
  if (event.keyCode == KEY_LEFT || event.keyCode == KEY_UP) {
    mgr.previousUnit();
    event.preventDefault();
  }
  else if (event.keyCode == KEY_RIGHT || event.keyCode == KEY_DOWN) {
    mgr.nextUnit();
    event.preventDefault();
  }
}
