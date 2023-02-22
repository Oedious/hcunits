class BystanderView extends SmallUnitView {
  
  static isType(type) {
    return type == "bystander";
  }

  constructor(unit) {
    super(unit);
    if (!BystanderView.isType(this.unit_.type)) {
      throw new Error("Mismatched unit type: BystanderView require type='bystander'");
    }
  }

  getTypeInfo() {
    return BYSTANDER_TYPE_INFO[this.unit_.bystander_type];
  }
  
  drawToken_() {
    if (this.unit_.dial.length != 1) {
      throw new Error(`Bystander '$(this.unit_.unit_id}' expected to have dial size of 1, but found ${this.unit_.dial.length}`);
    }
    var html = `
      <div id='smallCardToken'>
        <div id='smallCardTokenClip'>
          <div id='smallCardTokenCircle'>
            <div id='smallCardBystanderBackground'>`;
    if (this.unit_.has_image) {
      html += `<img id='smallCardTokenImg' src='/static/images/${this.unit_.set_id}/${this.unit_.unit_id}.png' alt='' onerror='this.style.display=\"none\"' style="left:-35px;top:-45px;"/>`
    }
    html += `
            </div>
          </div>
          <div id='smallCardDialBackground'></div>
          <div id='smallCardCombatSymbols'>
            <div id='smallCardCombatSymbolRange' class='combatSymbol'>
              <div id='smallCardRange'>${this.unit_.unit_range}</div>`;
    for (var i = 0; i < this.unit_.targets; ++i) {
      html += `<img class='smallCardBolt' src='/static/images/cs_bolt.png' alt='' height='12' width='6' style='left: ${28 + i * 4}px;'\>`;
    }
    html += `
            </div>
            <div id='smallCardCombatSymbolSpeed' class='combatSymbol'>
              <img class='smallCardCombatSymbolImg' src='/static/images/cs_${this.unit_.speed_type}.png'/>
            </div>
            <div id='smallCardCombatSymbolAttack' class='combatSymbol'>
              <img class='smallCardCombatSymbolImg' src='/static/images/cs_${this.unit_.attack_type}.png'/>
            </div>
            <div id='smallCardCombatSymbolDefense' class='combatSymbol'>
              <img class='smallCardCombatSymbolImg' src='/static/images/cs_${this.unit_.defense_type}.png'/>
            </div>
            <div id='smallCardCombatSymbolDamage' class='combatSymbol'>
              <img class='smallCardCombatSymbolImg' src='/static/images/cs_${this.unit_.damage_type}.png'/>
            </div>
          </div>
        </div>
        <div id='smallCardBystanderName'>${this.unit_.name.toUpperCase()}</div>
        <div id='smallCardDial'>`;

    for (var row = 0; row < 4; ++row) {
      const ENTRY_HEIGHT = 24;
      const ROW_OFFSET = 7;
      var rowType = ['speed', 'attack', 'defense', 'damage'][row];
      var power = this.unit_.dial[0][rowType + '_power'];
      var value = this.unit_.dial[0][rowType + '_value'];
      var position = `position: absolute; left: ${row * ROW_OFFSET}px; top: ${row * ENTRY_HEIGHT}px;`
      if (power) {
        var powerObj = POWER_LIST[power];
        if (!powerObj) {
          powerObj = {
            name: 'Unknown power',
            style: 'color:black; background-color: white; border: 2px solid red;',
            description: power
          }
        }
        html += `
          <div class='dialEntry' style='${powerObj.style} ${position}'>
            <div class='tooltip'>
              <div>${value}</div>
              <span class='tooltiptext'><b>${powerObj.name}</b>: ${escapeHtml(powerObj.description)}</span>
            </div>
          </div>`;
      } else {
        html += `<div class='dialEntry' style='${position}'>${value}</div>`;
      }
    }
    html += "</div></div>";
    return html;
  }
}