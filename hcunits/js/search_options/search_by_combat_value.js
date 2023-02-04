class SearchByCombatValue extends SearchOption {
  constructor() {
    super()
  }
  
  getCombatValue() {
    throw new Error("Derived classes must implement SearchByCombatValue::getCombatValue()")
  }
  
  getSearchParam() {
    throw new Error("Derived classes must implement SearchByCombatValue::getSearchParam()")
  }
  
  draw() {
    const combatValue = this.getCombatValue();
    var html = `
      <div class="input-field col s12 m5">
        <select id="searchOptions${combatValue}Select">
          <option value="equals">Equals</option>
          <option value="less_than">Less Than</option>
          <option value="greater_than">Greater Than</option>
          <option value="from">From</option>
        </select>
        <label>${combatValue} Value</label>
      </div>
      <div class="input-field col s12 m3">
        <input id="searchOptions${combatValue}1" type="number" min="0" max="99">
      </div>
      <div class="valign-wrapper col s12 m1" style="height: 70px">
        <h6 id="searchOptions${combatValue}2Label" style="display:none;">to</h6>
      </div>
      <div class="input-field col s12 m3">
        <input id="searchOptions${combatValue}2" type="number" min="0" max="99" style="display:none;">
      </div>
    `;
    return html;
  }
  
  initElement() {
    // Initialize Materialize search options select inputs.
    const name = `#searchOptions${this.getCombatValue()}Select`
    $(document).ready(function(){
      $(name).formSelect();
    });

    // Hide or show the second range value field depending on the selected option.
    const label = `#searchOptions${this.getCombatValue()}2Label`
    const input = `#searchOptions${this.getCombatValue()}2`
    $(name).change(function(){
      var value = $(this).val();
      if (value == "from") {
        $(label).show()
        $(input).show()
      } else {
        $(label).hide()
        $(input).hide()
      }
    })
  }
  
  addOptionToQuery(query) {
    const combatValue = this.getCombatValue()
    const searchParam = this.getSearchParam()
    const value1 = document.getElementById(`searchOptions${combatValue}1`).value
    if (value1) {
      const select = document.getElementById(`searchOptions${combatValue}Select`).value
      if (select != "from") {
        query[searchParam + '_' + select] = value1
      } else {
        const value2 = document.getElementById(`searchOptions${combatValue}2`).value
        if (value2) {
          query[searchParam + '_from'] = value1
          query[searchParam + '_to'] = value2
        }
      }
    }
  }
}

class SearchByCombatValueRange extends SearchByCombatValue {
  constructor() {
    super()
  }
  
  static id() {
    return "Range"
  }
  
  static title() {
    return "Range Value"
  }
  
  getCombatValue() {
    return "Range"
  }
  
  getSearchParam() {
    return "unit_range"
  }
}

class SearchByCombatValueTargets extends SearchByCombatValue {
  constructor() {
    super()
  }
  
  static id() {
    return "Targets"
  }
  
  static title() {
    return "Targets"
  }
  
  getCombatValue() {
    return "Targets"
  }
  
  getSearchParam() {
    return "targets"
  }
}

class SearchByCombatValueSpeed extends SearchByCombatValue {
  constructor() {
    super()
  }
  
  static id() {
    return "Speed"
  }
  
  static title() {
    return "Speed Value"
  }
  
  getCombatValue() {
    return "Speed"
  }
  
  getSearchParam() {
    return "speed"
  }
}

class SearchByCombatValueAttack extends SearchByCombatValue {
  constructor() {
    super()
  }
  
  static id() {
    return "Attack"
  }
  
  static title() {
    return "Attack Value"
  }
  
  getCombatValue() {
    return "Attack"
  }
  
  getSearchParam() {
    return "attack"
  }
}

class SearchByCombatValueDefense extends SearchByCombatValue {
  constructor() {
    super()
  }
  
  static id() {
    return "Defense"
  }
  
  static title() {
    return "Defense Value"
  }
  
  getCombatValue() {
    return "Defense"
  }
  
  getSearchParam() {
    return "defense"
  }
}

class SearchByCombatValueDamage extends SearchByCombatValue {
  constructor() {
    super()
  }
  
  static id() {
    return "Damage"
  }
  
  static title() {
    return "Damage Value"
  }
  
  getCombatValue() {
    return "Damage"
  }
  
  getSearchParam() {
    return "damage"
  }
}

