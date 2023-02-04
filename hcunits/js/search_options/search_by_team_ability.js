class SearchByTeamAbility extends SearchOption {
  constructor() {
    super()
  }

  static id() {
    return "TeamAbility"
  }
  
  static title() {
    return "Team Ability"
  }
  
  draw() {
    var html = `
      <div class='input-field col s12'>
        <select id='searchOptionsTeamAbilitySelect' multiple>
          <option value="" disabled>Select Team Ability(s)</option>
        `
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
  
  initElement() {
    // Initialize Materialize search options select inputs.
    $(document).ready(function(){
      $('#searchOptionsTeamAbilitySelect').formSelect();
    });
  }
  
  addOptionToQuery(query) {
    var teamAbilities = []
    var teamAbilitiesOptions = document.getElementById('searchOptionsTeamAbilitySelect').options
    for (var option of teamAbilitiesOptions) {
      if (option.selected) {
        teamAbilities.push(option.value)
      }
    }
    if (teamAbilities.length > 0) {
      query['team_ability'] = teamAbilities
    }
  }
}