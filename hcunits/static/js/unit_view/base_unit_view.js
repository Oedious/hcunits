class BaseUnitView {
  constructor(unit) {
    this.unit_ = unit;
  }
  
  draw() {
    throw new Error("Derived classes must implement UnitView::draw()");
  }

  drawPointValues_(bottomPosition) {
    if (this.unit_.point_values.length == 0) {
      return "";
    }

    var style = `bottom: ${bottomPosition}px;`
    if (this.unit_.point_values.length > 2) {
      style += ` width: ${182 + 30 * (this.unit_.point_values.length - 2)}px;`;
    }
    var html = `<div class='cardPointValues' style='${style}'>POINT VALUE: `;
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