class SearchByImprovedTargeting extends SearchOption {
  constructor() {
    super()
  }

  static id() {
    return "ImprovedTargeting"
  }
  
  static title() {
    return "Improved Targeting"
  }
  
  draw() {
    var html = `
      <div class='input-field col s12'>
        <select id='searchOptionsImprovedTargetingSelect' multiple>
          <option value="" disabled>Select Improved Targeting Type(s)</option>
        `
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
  
  initElement() {
    // Initialize Materialize search options select inputs.
    $(document).ready(function(){
      $('#searchOptionsImprovedTargetingSelect').formSelect();
    });
  }
  
  addOptionToQuery(query) {
    var improvedTargeting = []
    var improvedTargetingOptions = document.getElementById('searchOptionsImprovedTargetingSelect').options
    for (var option of improvedTargetingOptions) {
      if (option.selected) {
        improvedTargeting.push(option.value)
      }
    }
    if (improvedTargeting.length > 0) {
      query['improved_targeting'] = improvedTargeting
    }
  }
}