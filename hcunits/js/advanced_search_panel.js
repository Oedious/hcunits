class AdvancedSearchPanel extends NavPanel {
  constructor(dataSource) {
    super(dataSource)
    super.title = "Advanced Search"
    this.draw_();
  }
  
  panelName() {
    return "advancedSearchPanel"
  }
  
  nextItem() {
  }
  
  previousItem() {
  }

  draw_() {
    var html = `
      <ul id="searchOptions" class="collapsible">
        <li>
          <div class="collapsible-header blue-grey lighten-4">
            <i class="material-icons">info</i>
            Basic Info
          </div>
          <div class="collapsible-body">
            <div class="row">
              <div class="input-field col s12 m4">
                <select id="searchOptionsNameSelect">
                  <option value="has">Has</option>
                  <option value="is">Is</option>
                  <option value="begins">Begins</option>
                  <option value="ends">Ends</option>
                </select>
                <label>Name</label>
              </div>
              <div class="input-field col s12 m8">
                <input id="searchOptionsName" type="text" placeholder="Name" class="validate">
              </div>
            </div>
            <div class="row">
              <div class="input-field col s12 m4">
                <select id="searchOptionsRealNameSelect">
                  <option value="has">Has</option>
                  <option value="is">Is</option>
                  <option value="begins">Begins</option>
                  <option value="ends">Ends</option>
                </select>
                <label>Real Name</label>
              </div>
              <div class="input-field col s12 m8">
                <input id="searchOptionsRealName" type="text" placeholder="Real Name" class="validate">
              </div>
            </div>
            <div class="row">
              ${this.drawSetSelectHtml_()}
            </div>
            <div class="row">
              <div class="input-field col s12 m5">
                <select id="searchOptionsPointValueSelect">
                  <option value="equals">Equals</option>
                  <option value="less_than">Less Than</option>
                  <option value="greater_than">Greater Than</option>
                  <option value="from">From</option>
                </select>
                <label>Point Value</label>
              </div>
              <div class="input-field col s12 m3">
                <input id="searchOptionsPointValue1" type="number" min="0" max="9999">
              </div>
              <div class="valign-wrapper col s12 m1" style="height: 70px">
                <h6 id="searchOptionsPointValue2Label" style="display:none;">to</h6>
              </div>
              <div class="input-field col s12 m3">
                <input id="searchOptionsPointValue2" type="number" min="0" max="9999" style="display:none;">
              </div>
            </div>
            <div class="row">
              ${this.drawTypeSelectHtml_()}
            </div>
            <div class="row">
              <div class="input-field col s12 m8">
                <label id="searchOptionsKeywordsLabel">Keywords</label>
                <div id="searchOptionsKeywords" class="chips chips-autocomplete"></div>
              </div>
            </div>
          </div>
        </li>
        <li>
          <div class="collapsible-header blue-grey lighten-4">
            <i class="material-icons">security</i>
            Combat Symbols and Values
          </div>
          <div class="collapsible-body">
            <div class="row">
              ${this.drawCombatSymbolSelectHtml_()}
            </div>
            <div class="row">
              ${this.drawCombatValueSelectHtml_("Range")}
            </div>
            <div class="row">
              ${this.drawCombatValueSelectHtml_("Targets")}
            </div>
            <div class="row">
              ${this.drawCombatValueSelectHtml_("Speed")}
            </div>
            <div class="row">
              ${this.drawCombatValueSelectHtml_("Attack")}
            </div>
            <div class="row">
              ${this.drawCombatValueSelectHtml_("Defense")}
            </div>
            <div class="row">
              ${this.drawCombatValueSelectHtml_("Damage")}
            </div>
          </div>
        </li>
        <li>
          <div class="collapsible-header blue-grey lighten-4">
            <i class="material-icons">flash_on</i>
            Powers and Abilities
          </div>
          <div class="collapsible-body">
            <div class="row">
              ${this.drawPowerSelectHtml_()}
            </div>
            <div class="row">
              ${this.drawImprovedMovementSelectHtml_()}
            </div>
            <div class="row">
              ${this.drawImprovedTargetingSelectHtml_()}
            </div>
            <div id="searchOptionsTeamAbilities" class="row">
              ${this.drawTeamAbilitySelectHtml_()}
              <div class="searchOptionsLabel">
                <label>
                  <input id="searchOptionsWildcard" type="checkbox" class="filled-in"/>
                  <span>Is Wildcard</span>
                </label>
              </div>
            </div>
          </div>
        </li>
      </ul>
        `;
    document.getElementById(this.panelName()).innerHTML = html;

    // Hide or show the second point value field depending on the selected option.
    $('#searchOptionsPointValueSelect').change(function(){
      var value = $(this).val();
      if (value == "from") {
        $('#searchOptionsPointValue2Label').show()
        $('#searchOptionsPointValue2').show()
      } else {
        $('#searchOptionsPointValue2Label').hide()
        $('#searchOptionsPointValue2').hide()
      }
    })

    // Hide or show the second range value field depending on the selected option.
    $('#searchOptionsRangeSelect').change(function(){
      var value = $(this).val();
      if (value == "from") {
        $('#searchOptionsRange2Label').show()
        $('#searchOptionsRange2').show()
      } else {
        $('#searchOptionsRange2Label').hide()
        $('#searchOptionsRange2').hide()
      }
    })

    var keywordsChips = {}
    // Add keywords to chips autocomplete.
    for (const [keyword, type] of Object.entries(KEYWORD_LIST)) {
      keywordsChips[keyword] = null
    }
    $('#searchOptionsKeywords').chips({
      placeholder: "Enter a keyword",
      secondaryPlaceholder: "+keyword",
      autocompleteOnly: true,
      autocompleteOptions: {
        data: keywordsChips,
        limit: Infinity,
        minLength: 1
      }
    });

    // Initialize Materialize collapsible fields.
    $(document).ready(function(){
      $('#searchOptions').collapsible();
    });

    // Initialize Materialize search options select inputs.
    $(document).ready(function(){
      $('#searchOptions div select').formSelect();
    });
  }

  drawSetSelectHtml_() {
    var html = `
      <div class='input-field col s12'>
        <select id='searchOptionsSetSelect' multiple>`
    for (var setId in SET_LIST) {
      var setItem = SET_LIST[setId];
      html += `<option value='${setId}'>${setItem.name}</option>`
    }
    html += `
        </select>
      <label>Set</label>
    </div>`
    return html;
  }

  drawTypeSelectHtml_() {
    var html = `
      <div class='input-field col s12'>
        <select id='searchOptionsTypeSelect' multiple>`
    for (var typeId in TYPE_LIST) {
      var typeItem = TYPE_LIST[typeId];
      html += `<option value='${typeId}'>${typeItem.name}</option>`
    }
    html += `
        </select>
      <label>Type</label>
    </div>`
    return html;
  }

  drawTeamAbilitySelectHtml_() {
    var html = `
      <div class='input-field col s12'>
        <select id='searchOptionsTeamAbilitySelect' multiple>`
    var optGroup = null;
    for (var teamAbilityId in TEAM_ABILITY_LIST) {
      var teamAbilityItem = TEAM_ABILITY_LIST[teamAbilityId];
      if (optGroup != teamAbilityItem.universe) {
        if (optGroup == null) {
          html += "</optgroup>"
        }
        html += `<optgroup label='${UNIVERSE_LIST[teamAbilityItem.universe].name}'>`
        optGroup = teamAbilityItem.universe;
      }
      html += `<option value='${teamAbilityId}'>${teamAbilityItem.name}</option>`
    }
    html += `
          </optgroup>
        </select>
      <label>Team Ability</label>
    </div>`
    return html;
  }

  drawCombatSymbolSelectHtml_() {
    var html = `
      <div class='input-field col s12'>
        <select id='searchOptionsCombatSymbolSelect' multiple>`
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
  
  drawCombatValueSelectHtml_(combatValue) {
    var html = `
      <div class="input-field col s12 m5">
        <select id="searchOptions${combatValue}Select">
          <option value="equals">Equals</option>
          <option value="less_than">Less Than</option>
          <option value="greater_than">Greater Than</option>
          <option value="from">From</option>
        </select>
        <label>${combatValue}</label>
      </div>
      <div class="input-field col s12 m3">
        <input id="searchOptions${combatValue}1" type="number" min="0" max="9999">
      </div>
      <div class="valign-wrapper col s12 m1" style="height: 70px">
        <h6 id="searchOptions${combatValue}2Label" style="display:none;">to</h6>
      </div>
      <div class="input-field col s12 m3">
        <input id="searchOptions${combatValue}2" type="number" min="0" max="9999" style="display:none;">
      </div>
    `;
    return html;
  }

  drawPowerSelectHtml_() {
    var html = `
      <div class='input-field col s12'>
        <select id='searchOptionsPowerSelect' multiple>`
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

  drawImprovedMovementSelectHtml_() {
    var html = `
      <div class='input-field col s12'>
        <select id='searchOptionsImprovedMovementSelect' multiple>`
    for (var abilityId in IMPROVED_MOVEMENT_LIST) {
      var abilityItem = IMPROVED_MOVEMENT_LIST[abilityId];
      html += `<option value='${abilityId}'>${abilityItem.name}</option>`
    }
    html += `
        </select>
      <label>Improved Movement</label>
    </div>`
    return html;
  }

  drawImprovedTargetingSelectHtml_() {
    var html = `
      <div class='input-field col s12'>
        <select id=searchOptionsImprovedTargetingSelect' multiple>`
    for (var abilityId in IMPROVED_TARGETING_LIST) {
      var abilityItem = IMPROVED_TARGETING_LIST[abilityId];
      html += `<option value='${abilityId}'>${abilityItem.name}</option>`
    }
    html += `
        </select>
      <label>Improved Targeting</label>
    </div>`
    return html;
  }

  static getQuery() {
    var query = {}
    
    // Handle the '*_name' parameters.
    var name = document.getElementById('searchOptionsName').value
    if (name) {
      var select = document.getElementById('searchOptionsNameSelect').value
      query['name_' + select] = name
    }

    // Handle the '*_real_name' parameters.
    var real_name = document.getElementById('searchOptionsRealName').value
    if (real_name) {
      var select = document.getElementById('searchOptionsRealNameSelect').value
      query['real_name_' + select] = real_name
    }

    // Handle the 'set_id' parameter.
    var setIds = []
    var setOptions = document.getElementById('searchOptionsSetSelect').options
    for (var option of setOptions) {
      if (option.selected) {
        setIds.push(option.value)
      }
    }
    if (setIds.length > 0) {
      query['set_id'] = setIds
    }

    // Handle the '*_point_value' parameters.
    var pointValue1 = document.getElementById('searchOptionsPointValue1').value
    if (pointValue1) {
      var select = document.getElementById('searchOptionsPointValueSelect').value
      if (select != "from") {
        query['point_value_' + select] = pointValue1
      } else {
        var pointValue2 = document.getElementById('searchOptionsPointValue2').value
        if (pointValue2) {
          query['point_value_from'] = pointValue1
          query['point_value_to'] = pointValue2
        }
      }
    }
    
    // Handle unit "types" parameter.
    var typeIds = []
    var typeOptions = document.getElementById('searchOptionsTypeSelect').options
    for (var option of typeOptions) {
      if (option.selected) {
        typeIds.push(option.value)
      }
    }
    if (typeIds.length > 0) {
      query['type'] = setIds
    }
    
    // Handle 'keywords' parameter.
    var chipsInstance = M.Chips.getInstance(document.getElementById('searchOptionsKeywords'))
    var keywords = []
    for (var chip of chipsInstance.chipsData) {
      var keyword = chip.tag
      if (keyword.length > 0) {
        keywords.push(keyword)
      }
    }
    if (keywords.length > 0) {
      query['keyword'] = keywords
    }
    
    // Handle combat symbol types parameters.
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

    // Handle combat value types parameters.
    const COMBAT_VALUE_TYPES = [
      ["Range", "unit_range"],
      ["Targets", "targets"],
      ["Speed", "speed"],
      ["Attack", "attack"],
      ["Defense", "defense"],
      ["Damage", "damage"]
    ]
    for (var combatValueType of COMBAT_VALUE_TYPES) {
      var value1 = document.getElementById(`searchOptions${combatValueType[0]}1`).value
      if (value1) {
        var select = document.getElementById(`searchOptions${combatValueType[0]}Select`).value
        if (select != "from") {
          query[combatValueType[1] + '_' + select] = value1
        } else {
          var value2 = document.getElementById(`searchOptions${combatValueType[0]}2`).value
          if (value2) {
            query[combatValueType[1] + '_from'] = value1
            query[combatValueType[1] + '_to'] = value2
          }
        }
      }
    }

    // Handle power types parameters.
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

    // Handle the 'improved movement' parameter.
    var improvedMovement = []
    var improvedMovementOptions = document.getElementById('searchOptionsImprovedMovementSelect').options
    for (var option of setOptions) {
      if (option.selected) {
        improvedMovement.push(option.value)
      }
    }
    if (improvedMovement.length > 0) {
      query['improved_movement'] = improvedMovement
    }

    // Handle the 'improved targeting' parameter.
    var improvedTargeting = []
    var improvedTargetingOptions = document.getElementById('searchOptionsImprovedTargetingSelect').options
    for (var option of setOptions) {
      if (option.selected) {
        improvedTargeting.push(option.value)
      }
    }
    if (improvedTargeting.length > 0) {
      query['improved_targeting'] = improvedTargeting
    }

    // Handle the 'team ability' parameter.
    var teamAbilities = []
    var teamAbilitiesOptions = document.getElementById('searchOptionsTeamAbilitiesSelect').options
    for (var option of setOptions) {
      if (option.selected) {
        teamAbilities.push(option.value)
      }
    }
    if (teamAbilities.length > 0) {
      query['team_ability'] = teamAbilities
    }
    return query
  }
}
