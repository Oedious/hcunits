class SetListPanel extends ListPanel {
  constructor() {
    super()
    super.title = "Browse by Set"
    this.draw_()
  }

  panelName() {
    return "setListPanel"
  }

  numItems() {
    return SET_LIST.length;
  }

  activateCurrentItem() {}

  draw_() {
    var html = "<ul class='collection'>";
    for (var setId in SET_LIST) {
      var setItem = SET_LIST[setId];
      html += `
        <li class='collection-item avatar'>
          <a href='' onclick='sideNav.showUnitList("${setId}"); return false;'>
            <div class='listPanelImageDiv'>
              <img class='listPanelImage' src='images/set_${setId}.png' alt='${setId}' title='${setItem.name}'>
            </div>
            <div class='listPanelInfo'>
              <span class='title'>${setItem.name}</span>
              <p class='listPanelMinorInfo'>${setItem.release_date}</p>
            </div>
          </a>
        </li>`;
    }
    html += "</ul>"
    const panelName = "#" + this.panelName()
    $(panelName).html(html);
  }
}
