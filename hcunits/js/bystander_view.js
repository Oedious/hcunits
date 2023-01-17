class BystanderView extends UnitView {

  constructor(unitJson) {
    super(unitJson)
  }
  
  draw() {
    var objectTypeHtml = this.unit_.object_type ?
      `<div id='objectType'>${this.unit_.object_type}</div>` : "";
    var html = `
      <div id='objectCard'>
        <div id='objectCardBorders'></div>
        <div id='objectHeader'>
          <div id='objectName'>${escapeHtml(this.unit_.name).toUpperCase()}</div>
          ${objectTypeHtml}
        </div>
        <div id='objectCollectorNumber'>${this.unit_.collector_number}</div>
        <div id='objectPog'>${this.drawPog_()}</div>
        ${this.drawSpecialPowers_()}
      </div>`;
  	document.getElementById('unitContainer').innerHTML = html;
  }
  
  drawPog_() {
    var html = `
      <div id='objectPogClip'>
        <div id='objectPogBackground'></div>
        <div id='objectDialBackground'></div>
        <div id='objectCombatSymbols'>
          <div id='objectCombatSymbolRange' class='combatSymbol'>
            <div id='objectRange'>${this.unit_.unit_range}</div>`;
    for (var i = 0; i < this.unit_.targets; ++i) {
      html += `<img class='objectBolt' src='../hcunits/images/cs_bolt.png' alt='' height='12' width='6' style='left: ${28 + i * 4}px;'\>`;
    }
    html += `
          </div>
          <div id='objectCombatSymbolSpeed' class='combatSymbol'>
            <img class='objectCombatSymbolImg' src='../hcunits/images/cs_${this.unit_.speed_type}.png'/>
          </div>
          <div id='objectCombatSymbolAttack' class='combatSymbol'>
            <img class='objectCombatSymbolImg' src='../hcunits/images/cs_${this.unit_.attack_type}.png'/>
          </div>
          <div id='objectCombatSymbolDefense' class='combatSymbol'>
            <img class='objectCombatSymbolImg' src='../hcunits/images/cs_${this.unit_.defense_type}.png'/>
          </div>
          <div id='objectCombatSymbolDamage' class='combatSymbol'>
            <img class='objectCombatSymbolImg' src='../hcunits/images/cs_${this.unit_.damage_type}.png'/>
          </div>
        </div>
      </div>
      <div id='objectPogName'>${this.unit_.name.toUpperCase()}</div>
      <div id='objectDial'>${this.drawDial_()}</div>`;
    return html;
  }
  
  drawDial_() {
    if (this.unit_.dial.length != 1) {
      console.log(`Bystander '$(this.unit_.unit_id}' expected to have dial size of 1, but found ${this.unit_.dial.length}`);
      return "";
    }
    var html = "";
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
          <div class='unitDialEntry' style='${powerObj.style} ${position}'>
            <div class='tooltip'>
              <div>${value}</div>
              <span class='tooltiptext'><b>${powerObj.name}</b>: ${escapeHtml(powerObj.description)}</span>
            </div>
          </div>`;
      } else {
        html += `<div class='unitDialEntry' style='${position}'>${value}</div>`;
      }
    }
    return html;
  }

  drawSpecialPowers_() {
    if (!this.unit_.special_powers) {
      return '';
    }
    var html = "<table id='objectSpecialPowersTable' class='unitSpecialPowersTable'>";
    for (var i = 0; i < this.unit_.special_powers.length; ++i) {
      var power = this.unit_.special_powers[i];
      var type = power.type;

      // Handling for special trait types
      if (type != "trait" && type != "costed_trait" && type != "rally_trait") {
        type = this.unit_[type + "_type"];
      }
      
      var iconHtml = "";
      if (type == "costed_trait") {
        iconHtml = `
          <img class='unitSpecialPowerIcon' src='../hcunits/images/sp_${type}.png' alt=''/>
          <div class='unitSpecialPowerPointValue'>+${power.point_value} POINTS</div>`;
      } else if (type == "rally_trait") {
        iconHtml = `
          <div class='unitSpecialPowerRally' style='${RALLY_TYPE_TO_STYLE[power.rally_type]}'>
            <img class='unitSpecialPowerIcon' src='../hcunits/images/sp_trait.png' alt=''/>
            <img class='unitSpecialPowerRallyDie' src='../hcunits/images/d6_${power.rally_die}.png' alt='${power.rally_die}'/>
          </div>`;
      } else {
        iconHtml = `<img class='unitSpecialPowerIcon' src='../hcunits/images/sp_${type}.png' alt=''/>`;
      }
      html += `
        <tr class='unitSpecialPowerRow'>
          <td class='unitSpecialPower'>${iconHtml}</td>
          <td class='unitSpecialPower'><b>${escapeHtml(power.name.toUpperCase())}</b><br>${escapeHtml(power.description)}</td>
        </tr>`;
    }
    return html;
  }
}