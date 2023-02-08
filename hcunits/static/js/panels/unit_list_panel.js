class UnitListPanel extends ListPanel {
  constructor(dataSource) {
    super();
    this.dataSource_ = dataSource;
    // A unit list should always be in the form of an JSON array of units from
    // the database.
    this.unitList_ = null;
    this.drawSetTitles_ = false;
  }

  panelName() {
    return "unitListPanel"
  }

  numItems() {
    if (this.unitList_) {
      return this.unitList_.length;
    }
    return 0;
  }
  
  resetList() {
    this.unitList_ = null;
    super.currentIndex = 0;
    const panelName = "#" + this.panelName()
    $(panelName).html("");
  }

  activateCurrentItem() {
    if (this.unitList_ && super.currentIndex < this.unitList_.length) {
      mgr.showUnit(this.unitList_[super.currentIndex].unit_id);
      document.getElementById("unitListItem_" + super.currentIndex).focus();
    }
  }

  setCurrentIndexByUnit(unitId) {
    if (this.unitList_) {
      for (var i = 0; i < this.unitList_.length; ++i) {
        if (unitId == this.unitList_[i].unit_id) {
          super.currentIndex = i
        }
      }
    }
  }

  showSet(setId) {
    this.resetList()
    this.drawSetTitles_ = false;
    var unitListPanel = this;
    this.dataSource_.searchBySetId(setId,
      function(unitList) {
        unitListPanel.handleSearchResults_(unitList);
      },
      function(xhr, desc, err) {
        alert("Error in searchBySetId(" + setId + "): " + desc) + " err=" + err;
      });
  }

  showQuickSearchResults() {
    this.resetList()
    this.drawSetTitles_ = true;
    var query = document.getElementById("quickSearch").value
    var unitListPanel = this;
    this.dataSource_.quickSearch(query,
      function(unitList) {
        unitListPanel.handleSearchResults_(unitList);
      },
      function(xhr, desc, err) {
        alert("Error in showQuickSearchResults(" + query + "): " + desc) + " err=" + err;
      });
  }

  showAdvancedSearchResults(query) {
    this.resetList()
    this.drawSetTitles_ = true;
    var unitListPanel = this;
    this.dataSource_.advancedSearch(query,
      function(unitList) {
        unitListPanel.handleSearchResults_(unitList);
      },
      function(xhr, desc, err) {
        alert("Error in showAdvancedSearchResults(" + query + "): " + desc) + " err=" + err;
      });
  }

  handleSearchResults_(unitList) {
    this.setUnitList_(unitList);
    var currentSetId = null
    var html = ""
    if (this.unitList_ && this.unitList_.length > 0) {
      var setName = SET_LIST[this.unitList_[0].set_id].name;
      html = "<ul class='collection with-header'>";
      for (var i = 0; i < this.unitList_.length; ++i) {
        var unit = this.unitList_[i];
        if (currentSetId != unit.set_id && this.drawSetTitles_) {
          var setId = unit.set_id
          var setItem = SET_LIST[setId]
          html += `
            <li class='collection-header blue-grey lighten-4'>
              <div class='listPanelImageDiv'>
                <img class='listPanelImage' src='/static/images/set_${setId}.png' alt='${setId}' title='${setItem.name}'>
              </div>
              <div class='listPanelInfo'>${setItem.name}</div>
            </li>`
          currentSetId = setId
        }

        var color = RARITY_TO_COLOR[unit.rarity];
        var pointValues = "";
        if (unit.point_values.length == 0) {
          pointValues = "0";
        }
        else {
          for (var j = 0; j < unit.point_values.length; ++j) {
            if (j != 0) {
              pointValues += "/";
            }
            pointValues += unit.point_values[j];
          }
        }
        html += `
            <li class='collection-item avatar'>
              <a id='unitListItem_${i}' class='unitListItem' href='' onclick='sideNav.setUnit("${unit.unit_id}"); return false;'>
                <div class='listPanelImageDiv'>
                  <i class='material-icons circle' style='font-size: 36px; color:${color}; left:-5px;'>account_circle</i>
                </div>
                <div class='listPanelInfo'>
                  <span class='title'>${unit.collector_number} - ${unit.name}</span>
                  <p class='listPanelMinorInfo'>${pointValues} points</p>
                </div>
              </a>
            </li>`;
      }
      html += "</ul>";
    }
    const panelName = "#" + this.panelName()
    $(panelName).html(html);
    super.currentIndex = 0;

    this.title = "Search Results (" + unitList.length + " items)"
    sideNav.updateTitle()
  }

  setUnitList_(unitList) {
    // Sort the list descending by set release date, then collector number.
    if (unitList) {
      unitList.sort((u1, u2) => {
        var s1 = SET_LIST[u1.set_id];
        var s2 = SET_LIST[u2.set_id]
        // First prioritize set release date.
        if (s1.release_date < s2.release_date) {
          return 1;
        }
        if (s1.release_date > s2.release_date) {
          return -1
        }
        // Then prioritize set name length (so that Fast Forces are below main sets)
        if (s1.name.length > s2.name.length) {
          return 1;
        }
        if (s1.name.length < s2.name.length) {
          return -1;
        }
        if (u1.collector_number > u2.collector_number) {
          return 1;
        }
        if (u1.collector_number < u2.collector_number) {
          return -1
        }
        return 0;
      })
    }
    this.unitList_ = unitList
  }
}
