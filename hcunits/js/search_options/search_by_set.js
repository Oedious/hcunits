class SearchBySet extends SearchOption {
  constructor() {
    super()
  }

  static id() {
    return "Set"
  }
  
  static title() {
    return "Set"
  }
  
  draw() {
    var html = `
      <div class='input-field col s12'>
        <select id='searchOptionsSetSelect' multiple>
          <option value="" disabled>Select Set(s)</option>
        `
    for (var setId in SET_LIST) {
      var setItem = SET_LIST[setId];
      html += `<option value='${setId}'>${setItem.name}</option>`
    }
    html += `
        </select>
      <label>${SearchBySet.title()}</label>
    </div>`
    return html;
  }
  
  initElement() {
    // Initialize Materialize search options select inputs.
    $(document).ready(function(){
      $('#searchOptionsSetSelect').formSelect();
    });
  }
  
  addOptionToQuery(query) {
    var setIds = []
    var setOptions = document.getElementById('searchOptionsSetSelect').options
    for (var option of setOptions) {
      if (option.selected && !option.disabled) {
        setIds.push(option.value)
      }
    }
    if (setIds.length > 0) {
      query['set_id'] = setIds
    }
  }
}