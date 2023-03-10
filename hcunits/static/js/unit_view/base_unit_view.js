class BaseUnitView {
  constructor(unit) {
    this.unit_ = unit;
    
    // Sort the keywords so that named keywords are first, generic
    // keywords are last, otherwise sorted alphabetically.
    this.unit_.keywords.sort(function(k1, k2) {
      var keywordType1 = KEYWORD_LIST[k1];
      var keywordType2 = KEYWORD_LIST[k2];
      if (keywordType1 == "generic" && keywordType2 != "generic") {
        return 1;
      }
      if (keywordType1 != "generic" && keywordType2 == "generic") {
        return -1;
      }
      if (k1 > k2) {
        return 1;
      }
      if (k1 < k2) {
        return -1;
      }
      return 0;
    })
  }
  
  draw() {
    throw new Error("Derived classes must implement UnitView::draw()");
  }

  drawPointValues_(bottomPosition) {
    if (this.unit_.point_values.length == 0) {
      return "";
    }

    var style = `bottom: ${bottomPosition}px;`
    var innerHtml = "";
    if (this.unit_.point_values.length > POINT_VALUE_COLORS.length) {
      innerHtml = `<span>${this.unit_.point_values[0]} ... ${this.unit_.point_values[this.unit_.point_values.length - 1]}</span>`;
    } else {
      if (this.unit_.point_values.length > 2) {
        style += ` width: ${182 + 30 * (this.unit_.point_values.length - 2)}px;`;
      }
      const colors = POINT_VALUE_COLORS[this.unit_.point_values.length - 1];
      for (var i = 0; i < this.unit_.point_values.length; ++i) {
        if (i != 0) {
          innerHtml += "<span>/</span>"
        }
        innerHtml += `<span style='color: ${colors[i]}'>${this.unit_.point_values[i]}</span>`;
      }
    }
    var html = `
      <div class='cardPointValues' style='${style}'>POINT VALUE:
        ${innerHtml}
      </div>`;
    return html;
  }
}