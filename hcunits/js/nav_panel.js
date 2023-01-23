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
    document.getElementById(this.panelName()).style.visibility = "visible"
  }
  
  hidePanel() {
    document.getElementById(this.panelName()).style.visibility = "hidden"
  }
}