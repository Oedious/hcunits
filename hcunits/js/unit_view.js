class UnitView {
  constructor(unitJson) {
    this.unit_ = unitJson;
  }
  
  draw() {
    throw new Error("Derived classes must implement UnitView::Draw()");
  }

  drawPointValues_() {
    if (this.unit_.point_values.length == 0) {
      return "";
    }

    var style = ""
    if (this.unit_.point_values.length > 2) {
      style = `style='width: ${182 + 30 * (this.unit_.point_values.length - 2)}px;'`;
    }
    var html = `<div class='unitPointValues' ${style}>POINT VALUE: `;
    const colors = POINT_VALUE_COLORS[this.unit_.point_values.length];
    for (var i = 0; i < this.unit_.point_values.length; ++i) {
      if (i != 0) {
        html += "<span>/</span>"
      }
      html += `<span style='color: ${colors[i]}'>${this.unit_.point_values[i]}</span>`;
    }
    html += "</div>"
    return html;
  }
}