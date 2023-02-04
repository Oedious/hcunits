const HOST_NAME = "https://api.hcunits.net"
//const HOST_NAME = "http://localhost:8000"
var dataSource = new DataSource(HOST_NAME);
//var dataSource = new MockDataSource();
var mgr = new ViewManager(dataSource);
var sideNav = new SideNav(dataSource);

document.onkeydown = onKeyDown;

function onKeyDown(event) {
  var KEY_LEFT = '37';
  var KEY_UP = '38';
  var KEY_RIGHT = '39';
  var KEY_DOWN = '40';
  event = event || window.event;
  if (event.keyCode == KEY_LEFT || event.keyCode == KEY_UP) {
    sideNav.previousItem();
    event.preventDefault();
  }
  else if (event.keyCode == KEY_RIGHT || event.keyCode == KEY_DOWN) {
    sideNav.nextItem();
    event.preventDefault();
  }
}
/*
// Initialize Materialize select inputs.
$(document).ready(function(){
  $('select').formSelect();
});
*/