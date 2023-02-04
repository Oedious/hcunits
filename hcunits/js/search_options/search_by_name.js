class SearchByName extends SearchOption {
  constructor() {
    super()
  }

  static id() {
    return "Name"
  }
  
  static title() {
    return "Name"
  }
  
  draw() {
    return `
      <div class='input-field col s12 m4'>
        <select id='searchOptionsNameSelect'>
          <option value='has'>Has</option>
          <option value='is'>Is</option>
          <option value='begins'>Begins</option>
          <option value='ends'>Ends</option>
        </select>
        <label>${SearchByName.title()}</label>
      </div>
      <div class='input-field col s12 m8'>
        <input id='searchOptionsName' type='text' placeholder='${SearchByName.title()}' class='validate'>
      </div>
    `
  }
  
  initElement() {
    $(document).ready(function(){
      $('#searchOptionsNameSelect').formSelect();
    });
  }
  
  addOptionToQuery(query) {
    var value = document.getElementById('searchOptionsName').value
    if (value) {
      var select = document.getElementById('searchOptionsNameSelect').value
      query['name_' + select] = value
    }
  }
}