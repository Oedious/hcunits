class SearchByType extends SearchOption {
  constructor() {
    super()
  }

  static id() {
    return "Type"
  }
  
  static title() {
    return "Unit Type"
  }
  
  draw() {
    var html = `
      <div class='input-field col s12'>
        <select id='searchOptionsTypeSelect' multiple>
          <option value="" disabled>Select Unit Type(s)</option>
        `
    for (var typeId in TYPE_LIST) {
      var typeItem = TYPE_LIST[typeId];
      html += `<option value='${typeId}'>${typeItem.name}</option>`
    }
    html += `
        </select>
      <label>>${SearchByType.title()}</label>
    </div>`
    return html;
  }
  
  initElement() {
    // Initialize Materialize search options select inputs.
    $(document).ready(function(){
      $('#searchOptionsTypeSelect').formSelect();
    });
  }
  
  addOptionToQuery(query) {
    var typeIds = []
    var typeOptions = document.getElementById('searchOptionsTypeSelect').options
    for (var option of typeOptions) {
      if (option.selected) {
        typeIds.push(option.value)
      }
    }
    if (typeIds.length > 0) {
      query['type'] = typeIds
    }
  }
}