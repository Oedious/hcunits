class UnitListPanel extends ListPanel {
  constructor(dataSource) {
    super();
    this.dataSource_ = dataSource;
    // A unit list should always be in the form of an JSON array of units from
    // the database.
    this.unitList_ = null;
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

  activateCurrentItem() {
    mgr.showUnit(this.unitList_[super.currentIndex].unit_id);
    document.getElementById("unitListItem_" + super.currentIndex).focus();
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

  handleSearchResults_(unitList) {
    this.unitList_ = unitList;
    var html = ""
    if (this.unitList_ && this.unitList_.length > 0) {
      var setName = SET_LIST[this.unitList_[0].set_id].name;
      html = "<ul class='collection with-header'>";
      for (var i = 0; i < this.unitList_.length; ++i) {
        var unit = this.unitList_[i];
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
    document.getElementById(this.panelName()).innerHTML = html;
    super.currentIndex = 0;
    this.activateCurrentItem();
  }
}
