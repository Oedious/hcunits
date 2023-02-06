class NavPanel {
  constructor() {
    this.title_ = null
  }

  panelName() {
    throw new Error("Derived classes must implement NavPanel::panelName()")
  }
  
  get title() {
    return this.title_
  }
  
  set title(title) {
    this.title_ = title
  }

  nextItem() {
    throw new Error("Derived classes must implement NavPanel::nextItem()")
  }

  previousItem() {
    throw new Error("Derived classes must implement NavPanel::previousItem()")
  }

  showPanel() {
    var panel = document.getElementById(this.panelName());
    if (panel.style.display != "unset") {
      panel.style.display = "unset"
    }
  }
  
  hidePanel() {
    var panel = document.getElementById(this.panelName());
    if (panel.style.display != "none") {
      panel.style.display = "none"
    }
  }
}