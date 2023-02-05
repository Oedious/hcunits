const BUTTONS = [
  {
    "name": "Build",
    "link": "build/"
  }, {
    "name": "Explore",
    "link": "explore/"
  }, {
    "name": "Help",
    "link": "help/"
  }
]
function drawSiteHeader(activeButtonName) {
  var html = `
    <nav id="siteHeader">
      <div class="nav-wrapper">
        <a href="index.html" class="brand-logo left">HCUnits</a>
        <ul id="siteHeaderLinks" class="left">`
  for (const button of BUTTONS) {
    var name;
    if (button.name == activeButtonName) {
      name = "<b>" + button.name + "</b>"
    } else {
      name = button.name
    }
    html += `<li class='navButton'><a href="${button.link}">${name}</a></li>`
  }
  html += `
        </ul>
      </div>
    </nav>`
  $("body").prepend(html)
}
