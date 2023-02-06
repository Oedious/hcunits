const BUTTONS = [
  {
    "name": "Build",
    "link": "build"
  }, {
    "name": "Explore",
    "link": "explore"
  }, {
    "name": "Help",
    "link": "help"
  }
]
function drawHeaderAndFooter(activeButtonName) {
  var headerHtml = `
    <nav>
      <div class="nav-wrapper">
        <a href="index.html" class="brand-logo left">
          <img src="images/logo_2x1_med.png" alt='' style='padding-top: 2px;'/>
        </a>
        <ul id="headerLinks" class="left">`
  for (const button of BUTTONS) {
    var name;
    if (button.name == activeButtonName) {
      name = "<b>" + button.name + "</b>"
    } else {
      name = button.name
    }
    headerHtml += `<li class='navButton'><a href="${button.link}">${name}</a></li>`
  }
  headerHtml += `
        </ul>
      </div>
    </nav>`
  $("header").html(headerHtml)

  const footerHtml = `
    <div class="container">
      <p>WizKids, HeroClix, and their logos are trademarks of WIZKIDS/NECA, LLC in the United States and other countries. &copy; 2023 WIZKIDS/NECA, LLC. All rights reserved.</p>
      <p>HCUnits is not affiliated with, endorsed, sponsored, or specifically approved by WIZKIDS/NECA, LLC. HeroClix, WizKids and Combat Dial are trademarks of WIZKIDS/NECA, LLC. For more information about NECA/WizKids or any trademarks or other intellectual property, please visit their website at <a href="https://wizkids.com/">WizKids.com</a>.</p>
      <p>&copy; 2023 HCUnits &middot; <a href="/help/tos">Terms of Service</a> &middot; <a href="/help/privacy">Privacy Policy</a> &middot; <span>Version 2023.02.05.1</span></p>
    </div>
      `
  $("footer").html(footerHtml)
}
  
