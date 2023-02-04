const SEARCH_OPTIONS = [
  SearchByName,
  SearchByRealName,
  SearchBySet,
  SearchByPointValue,
  SearchByType,
  SearchByKeyword,
  SearchByCombatSymbol,
  SearchByCombatValueRange,
  SearchByCombatValueTargets,
  SearchByCombatValueSpeed,
  SearchByCombatValueAttack,
  SearchByCombatValueDefense,
  SearchByCombatValueDamage,
  SearchByPower,
  SearchByImprovedMovement,
  SearchByImprovedTargeting,
  SearchByTeamAbility,
]

class AdvancedSearchPanel extends NavPanel {
  constructor(dataSource) {
    super(dataSource)
    super.title = "Advanced Search"
    this.searchOptionsMap_ = {}
    for (const option of SEARCH_OPTIONS) {
      this.searchOptionsMap_[option.id()] = option
    }
    this.searchOptions_ = []
    this.draw_();
  }
  
  panelName() {
    return "advancedSearchPanel"
  }
  
  nextItem() {
  }
  
  previousItem() {
  }
  
  showPanel() {
    super.showPanel()
    document.getElementById("sideNavFooter").style.visibility = "visible";
  }
  
  hidePanel() {
    super.hidePanel()
    document.getElementById("sideNavFooter").style.visibility = "hidden";
  }

  resetOptions() {
    this.searchOptions_ = []
    document.getElementById("searchOptions").innerHTML = "";
    document.getElementById("addSearchOptionDropdown").innerHTML = this.drawOptionsDropdown_()
  }  
  
  getQuery() {
    var query = {}
    for (var option of this.searchOptions_) {
      option.addOptionToQuery(query)
    }
    return query;
  }

  addSearchOption(optionId) {
    var searchOption = new this.searchOptionsMap_[optionId]()
    this.searchOptions_.push(searchOption)

    var html = `
      <li class='collection-item'>
        <div class='row'>
          ${searchOption.draw()}
        </div>
      </li>
    `
    $("#searchOptions").append(html)
    searchOption.initElement()

    // Hide the option from the selection drop-down.
    document.getElementById(`addSearchOption${optionId}`).remove()
  }

  draw_() {
    var html = `
      <a href='#' id='addSearchOptionButton' class='dropdown-trigger btn-floating btn-large waves-effect waves-light red' data-target='addSearchOptionDropdown'>
        <i class='material-icons'>add</i>
      </a>
      <ul id='addSearchOptionDropdown' class='dropdown-content'>
        ${this.drawOptionsDropdown_()}
      </ul>
      <ul id='searchOptions' class='collection'></ul>
    `
    document.getElementById(this.panelName()).innerHTML = html;

    $('#addSearchOptionButton').dropdown();
  }
  
  drawOptionsDropdown_() {
    var html = ""
    for (const option of SEARCH_OPTIONS) {
      html += `<li id='addSearchOption${option.id()}'><a href='#' onclick='sideNav.addSearchOption("${option.id()}"); return false;'>${option.title()}</a></li>`
    }
    return html
  }

  drawImprovedTargetingSelectHtml_() {
    var html = `
      <div class='input-field col s12'>
        <select id='searchOptionsImprovedTargetingSelect' multiple>`
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
}
