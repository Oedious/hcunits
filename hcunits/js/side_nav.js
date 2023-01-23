class SideNav {

  constructor(dataSource) {
    this.setListPanel_ = new SetListPanel()
    this.unitListPanel_ = new UnitListPanel(dataSource)
    this.panelStack_ = [this.setListPanel_];
    this.updateTitle()
  }
  
  getTopPanel() {
    return this.panelStack_[this.panelStack_.length - 1];
  }

  nextItem() {
    this.getTopPanel().nextItem()
  }

  previousItem() {
    this.getTopPanel().previousItem()
  }

  // Reset the stack so that it's only this panel.
  setPanel(navPanel) {
    if (!this.isVisible()) {
      this.toggleVisibility()
    }
    if (navPanel) {
      while (this.panelStack_.length > 0) {
        this.getTopPanel().hidePanel();
        this.panelStack_.pop()
      }
      this.panelStack_ = [navPanel];
      this.getTopPanel().showPanel();
      this.updateTitle()
    }
  }

  pushPanel(navPanel) {
    if (!this.isVisible()) {
      this.toggleVisibility()
    }
    if (navPanel && this.getTopPanel() != navPanel) {
      this.getTopPanel().hidePanel();
      this.panelStack_.push(navPanel)
      this.getTopPanel().showPanel();
      this.updateTitle()
    }
  }

  popPanel() {
    if (this.panelStack_.length > 1) {
      this.getTopPanel().hidePanel()
      this.panelStack_.pop()
      this.getTopPanel().showPanel()
      this.updateTitle()
    }
  }

  updateTitle() {
    var html = ""
    var title = this.getTopPanel().title
    if (title) {
      var hasBackArrow = this.panelStack_.length > 1;
      html = "<div id='panelTitleBar'>"
      if (hasBackArrow) {
        html += "<a id='panelBackIcon' href='#' onclick='sideNav.popPanel()'><i class='material-icons'>arrow_back</i></a>"
      }
      html += `<div id='panelTitle'>${title}</div></div>`
    }
    document.getElementById("sideNavTitle").innerHTML = html
  }

  showSetList() {
    this.setPanel(this.setListPanel_)
    this.getTopPanel().showPanel()
  }
  
  showUnitList(setId) {
    this.unitListPanel_.showSet(setId)
    this.unitListPanel_.title = SET_LIST[setId].name
    this.pushPanel(this.unitListPanel_)
  }

  isVisible() {
    return document.getElementById("sideNav").style.left == "0px"
  }

  toggleVisibility() {
    var sideNav = document.getElementById("sideNav")
    var unitContainer = document.getElementById("unitContainer")
    var icon = document.getElementById("sideNavToggleIcon")
    console.log("sideNav.left=" + sideNav.style.left)
    if (!sideNav.style.left || sideNav.style.left == "0px") {
      sideNav.style.left = "-300px";
      icon.style.transform = "rotate(180deg)"
      unitContainer.style.left = "-300px"
    }
    else {
      sideNav.style.left = "0px";
      icon.style.transform = "rotate(0deg)"
      unitContainer.style.left = "0px"
    }
  }
}
