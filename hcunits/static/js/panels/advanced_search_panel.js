// Nulls in the list are where dividers where appear
// TODO:
// - Allow search by wildcard team abilities
// - Allow search by special type (prime, unique, etc)
// - Allow search by age (modern, etc)
// - Allow search by rarity
// - Allow search for special power type (rally, costed traits, etc)
// - Allow search by object type or object keyphrase
const SEARCH_OPTIONS = [
  SearchByName,
  SearchByRealName,
  SearchBySet,
  SearchByPointValue,
  SearchByType,
  SearchByKeyword,
  null,
  SearchByCombatSymbol,
  SearchByCombatValueRange,
  SearchByCombatValueTargets,
  SearchByCombatValueSpeed,
  SearchByCombatValueAttack,
  SearchByCombatValueDefense,
  SearchByCombatValueDamage,
  null,
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
      if (option) {
        this.searchOptionsMap_[option.id()] = option
      }
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
    $("#searchOptions").html("");
    $("#addSearchOptionDropdown").html(this.drawOptionsDropdown_())
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
    const panelName = "#" + this.panelName()
    $(panelName).html(html);

    $('#addSearchOptionButton').dropdown();
  }
  
  drawOptionsDropdown_() {
    var html = ""
    var i = 0;
    for (const option of SEARCH_OPTIONS) {
      if (option) {
        html += `
          <li id='addSearchOption${option.id()}'>
            <a href='#' onclick='sideNav.addSearchOption("${option.id()}"); return false;'>${option.title()}</a>
          </li>`
      } else {
        html += "<li class='divider'></li>"
      }
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
