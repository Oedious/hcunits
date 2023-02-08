class SearchByCombatSymbol extends SearchOption {
  constructor() {
    super()
  }

  static id() {
    return "CombatSymbol"
  }
  
  static title() {
    return "Combat Symbol"
  }
  
  draw() {
    var html = `
      <div class='input-field col s12'>
        <select id='searchOptionsCombatSymbolSelect' multiple>
          <option value="" disabled>Select Combat Symbol(s)</option>
        `
    var optGroup = null;
    for (var combatSymbolId in COMBAT_SYMBOL_LIST) {
      var combatSymbolItem = COMBAT_SYMBOL_LIST[combatSymbolId];
      if (optGroup != combatSymbolItem.type) {
        if (optGroup == null) {
          html += "</optgroup>"
        }
        html += `<optgroup label='${POWER_TYPE_LIST[combatSymbolItem.type].name}'>`
        optGroup = combatSymbolItem.type;
      }
      html += `<option value='${combatSymbolId}'>${combatSymbolItem.name}</option>`
    }
    html += `
          </optgroup>
        </select>
      <label>Combat Symbol</label>
    </div>`
    return html;
  }
  
  initElement() {
    // Initialize Materialize search options select inputs.
    $(document).ready(function(){
      $('#searchOptionsCombatSymbolSelect').formSelect();
    });
  }
  
  addOptionToQuery(query) {
    // Although it's presented in the UI under a single select input, we need
    // to break it apart and send each type separately.
    var combatSymbolTypeMap = {
      "speed": [],
      "attack": [],
      "defense": [],
      "damage": []
    }
    var combatSymbolOptions = document.getElementById('searchOptionsCombatSymbolSelect').options
    for (var option of combatSymbolOptions) {
      if (option.selected) {
        var combatSymbolType = COMBAT_SYMBOL_LIST[option.value].type
        combatSymbolTypeMap[combatSymbolType].push(option.value)
      }
    }
    for (const [type, symbols] of Object.entries(combatSymbolTypeMap)) {
      if (symbols.length > 0) {
        query[type + '_type'] = symbols
      }
    }
  }
}