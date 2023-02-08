class SearchByImprovedMovement extends SearchOption {
  constructor() {
    super()
  }

  static id() {
    return "ImprovedMovement"
  }
  
  static title() {
    return "Improved Movement"
  }
  
  draw() {
    var html = `
      <div class='input-field col s12'>
        <select id='searchOptionsImprovedMovementSelect' multiple>
          <option value="" disabled>Select Improved Movement Type(s)</option>
        `
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
  
  initElement() {
    // Initialize Materialize search options select inputs.
    $(document).ready(function(){
      $('#searchOptionsImprovedMovementSelect').formSelect();
    });
  }
  
  addOptionToQuery(query) {
    var improvedMovement = []
    var improvedMovementOptions = document.getElementById('searchOptionsImprovedMovementSelect').options
    for (var option of improvedMovementOptions) {
      if (option.selected) {
        improvedMovement.push(option.value)
      }
    }
    if (improvedMovement.length > 0) {
      query['improved_movement'] = improvedMovement
    }
  }
}