class ObjectView extends SmallUnitView {
  
  static isType(type) {
    return type == "object" || type == "equipment";
  }

  constructor(unit) {
    super(unit);
    if (!ObjectView.isType(this.unit_.type)) {
      throw new Error("Mismatched unit type: ObjectView require type='object' or 'equipment'");
    }
  }

  getTypeInfo() {
    if (this.unit_.object_type == "standard" || this.unit_.object_type == "special") {
      return OBJECT_SIZE_INFO[this.unit_.object_size];
    } else {
      return OBJECT_TYPE_INFO[this.unit_.object_type];
    }
  }

  drawKeyphrases_() {
    var html = "";
    for (var keyphrase of this.unit_.object_keyphrases) {
      const info = OBJECT_KEYPHRASE_INFO[keyphrase];
      if (!info) {
        console.log(`Couldn't find info for object keyphrase '${keyphrase}'`);
        continue;
      }
      html += `
        <div>
          <div class='tooltip'>
            <b>${info.name}</b>
            <span class='tooltiptext'><b>${info.name}</b>: ${escapeHtml(info.description)}</span>
          </div>
        </div>`;
    }
    return html;
  }
  
  drawToken_() {
    const objectStyle = OBJECT_SIZE_INFO[this.unit_.object_size].style;
    var html =
      `<div id='smallCardToken'>
        <div id='smallCardTokenCircle' style='background-color: lightgray; ${objectStyle}'></div>`;
    if (this.unit_.has_image) {
      html += `<img id='smallCardTokenImg' src='/static/images/${this.unit_.set_id}/${this.unit_.unit_id}.png' alt='' onerror='this.style.display=\"none\"'/>`
    }
    html += "</div>";
    return html;
  }
  
  drawFooter_() {
    if (this.unit_.object_type == "standard") {
      return "";
    }
    return "<img class='specialObjectIcon' src='/static/images/gear.png' alt=''/>";
  }
}