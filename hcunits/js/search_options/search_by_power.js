class SearchByPower extends SearchOption {
  constructor() {
    super()
  }

  static id() {
    return "Power"
  }
  
  static title() {
    return "Power"
  }
  
  draw() {
    var html = `
      <div class='input-field col s12'>
        <select id='searchOptionsPowerSelect' multiple>
          <option value="" disabled>Select Power(s)</option>
        `
    var optGroup = null;
    for (var powerId in POWER_LIST) {
      var powerItem = POWER_LIST[powerId];
      if (optGroup != powerItem.type) {
        if (optGroup == null) {
          html += "</optgroup>"
        }
        html += `<optgroup label='${POWER_TYPE_LIST[powerItem.type].name}'>`
        optGroup = powerItem.type;
      }
      html += `<option value='${powerId}'>${powerItem.name}</option>`
    }
    html += `
          </optgroup>
        </select>
      <label>Powers</label>
    </div>`
    return html;
  }
  
  initElement() {
    // Initialize Materialize search options select inputs.
    $(document).ready(function(){
      $('#searchOptionsPowerSelect').formSelect();
    });
  }
  
  addOptionToQuery(query) {
    // Although it's presented in the UI under a single select input, we need
    // to break it apart and send each type separately.
    var powerMap = {
      "speed": [],
      "attack": [],
      "defense": [],
      "damage": [],
      "special": []
    }
    var powerOptions = document.getElementById('searchOptionsPowerSelect').options
    for (var option of powerOptions) {
      if (option.selected) {
        var powerType = POWER_LIST[option.value].type
        powerMap[powerType].push(option.value)
      }
    }
    for (const [type, powers] of Object.entries(powerMap)) {
      if (powers.length > 0) {
        query[type + '_power'] = powers
      }
    }
 }
}