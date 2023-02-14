class UnitView {
  constructor(unitJson) {
    this.unit_ = unitJson;
    // Only "xmxs" set has images.
    if (this.unit_.set_id == "xmxs") {
      this.unit_.has_image = true;
    } else {
      this.unit_.has_image = false;
    }
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
      style += ` 'width: ${182 + 30 * (this.unit_.point_values.length - 2)}px;'`;
    }
    var html = `<div class='unitPointValues' style='${style}'>POINT VALUE: `;
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