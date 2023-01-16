class UnitView {
  constructor(unitJson) {
    this.unit_ = unitJson;
  }
  
  draw() {
    throw new Error("Derived classes must implement UnitView::Draw()");
  }
}