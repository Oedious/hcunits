class SearchByPointValue extends SearchOption {
  constructor() {
    super()
  }

  static id() {
    return "PointValue"
  }
  
  static title() {
    return "Point Value"
  }
  
  draw() {
    return `
      <div class="input-field col s12 m5">
        <select id="searchOptionsPointValueSelect">
          <option value="equals">Equals</option>
          <option value="less_than">Less Than</option>
          <option value="greater_than">Greater Than</option>
          <option value="from">From</option>
        </select>
        <label>${SearchByPointValue.title()}</label>
      </div>
      <div class="input-field col s12 m3">
        <input id="searchOptionsPointValue1" type="number" min="0" max="9999">
      </div>
      <div class="valign-wrapper col s12 m1" style="height: 70px">
        <h6 id="searchOptionsPointValue2Label" style="display:none;">to</h6>
      </div>
      <div class="input-field col s12 m3">
        <input id="searchOptionsPointValue2" type="number" min="0" max="9999" style="display:none;">
      </div>`;
  }
  
  initElement() {
    $(document).ready(function(){
      $('#searchOptionsPointValueSelect').formSelect();
    });

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
  }
  
  addOptionToQuery(query) {
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
  }
}