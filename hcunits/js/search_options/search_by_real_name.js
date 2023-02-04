class SearchByRealName extends SearchOption {
  constructor() {
    super()
  }

  static id() {
    return "RealName"
  }
  
  static title() {
    return "Real Name"
  }
  
  draw() {
    return `
      <div class='input-field col s12 m4'>
        <select id='searchOptionsRealNameSelect'>
          <option value='has'>Has</option>
          <option value='is'>Is</option>
          <option value='begins'>Begins</option>
          <option value='ends'>Ends</option>
        </select>
        <label>${SearchByRealName.title()}</label>
      </div>
      <div class='input-field col s12 m8'>
        <input id='searchOptionsRealName' type='text' placeholder='${SearchByRealName.title()}' class='validate'>
      </div>
    `
  }
  
  initElement() {
    $(document).ready(function(){
      $('#searchOptionsRealNameSelect').formSelect();
    });
  }
  
  addOptionToQuery(query) {
    var value = document.getElementById('searchOptionsRealName').value
    if (value) {
      var select = document.getElementById('searchOptionsRealNameSelect').value
      query['real_name_' + select] = value
    }
  }
}