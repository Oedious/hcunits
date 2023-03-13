const SORT_ORDERS = {
  "set_id": {
    "name": "Sort by Set",
    "showSortOption": true,
    "showSetTitles": true,
    "sortFunction": function(u1, u2) {
      const s1 = SET_LIST[u1.set_id];
      const s2 = SET_LIST[u2.set_id];
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
    },
  },
  "unit_id": {
    "name": "Sort by Unit ID",
    "showSortOption": true,
    "showSetTitles": true,
    "sortFunction": function(u1, u2) {
      if (u1.unit_id > u2.unit_id) {
        return 1;
      }
      if (u1.unit_id < u2.unit_id) {
        return -1;
      }
      return 0;
    },
  },
  "unit_name": {
    "name": "Sort by Name",
    "showSetTitles": false,
    "showSortOption": true,
    "sortFunction": function(u1, u2) {
      if (u1.name > u2.name) {
        return 1;
      }
      if (u1.name < u2.name) {
        return -1;
      }
      return 0;
    },
  },
  "unit_type": {
    "name": "Sort by Type",
    "showSetTitles": false,
    "showSortOption": true,
    "sortFunction": function(u1, u2) {
      if (u1.type > u2.type) {
        return 1;
      }
      if (u1.type < u2.type) {
        return -1;
      }
      return 0;
    },
  },
  "point_value_high": {
    "name": "Sort by Points (High)",
    "showSetTitles": false,
    "showSortOption": true,
    "sortFunction": function(u1, u2) {
      const pv1 = u1.point_values.length > 0 ? u1.point_values[0] : 0;
      const pv2 = u2.point_values.length > 0 ? u2.point_values[0] : 0;
      if (pv1 > pv2) {
        return 1;
      }
      if (pv1 < pv2) {
        return -1;
      }
      return 0;
    },
  },
  "point_value_low": {
    "name": "Sort by Points (Low)",
    "showSetTitles": false,
    "showSortOption": true,
    "sortFunction": function(u1, u2) {
      const pv1 = u1.point_values.length > 0 ? u1.point_values[u1.point_values.length - 1] : 0;
      const pv2 = u2.point_values.length > 0 ? u2.point_values[u2.point_values.length - 1] : 0;
      if (pv1 > pv2) {
        return 1;
      }
      if (pv1 < pv2) {
        return -1;
      }
      return 0;
    },
  },
  "tarot_cards": {
    "name": "Tarot Card Type",
    "showSetTitles": false,
    "showSortOption": false,
    "sortFunction": function(u1, u2) {
      if (u1.collector_number > u2.collector_number) {
        return 1;
      }
      if (u1.collector_number < u2.collector_number) {
        return -1
      }
    },
  }
}

class UnitListPanel extends ListPanel {
  constructor(unitManager, sortType) {
    super();
    this.unitManager_ = unitManager;
    // A unit list should always be in the form of an JSON array of units from
    // the database.
    this.unitList_ = null;
    this.sortAscending_ = true;
    this.hideSetTitles_ = false;
    if (sortType) {
      this.sortType_ = sortType;
    } else {
      this.sortType_ = Object.keys(SORT_ORDERS)[0];
      this.updateSortOrderDropdown_();
    }
  }

  panelName() {
    return "unitListPanel";
  }

  numItems() {
    if (this.unitList_) {
      return this.unitList_.length;
    }
    return 0;
  }
  
  // If true, set titles will always be hidden. Otherwise, whether they
  // are shown depends on the sort type (see SORT_ORDERS above).
  set hideSetTitles(hideSetTitles) {
    this.hideSetTitles_ = hideSetTitles;
  }

  resetList() {
    this.unitList_ = null;
    super.currentIndex = 0;
    const panelName = "#" + this.panelName();
    $(panelName).html("");
  }

  activateCurrentItem() {
    if (this.unitList_ && super.currentIndex < this.unitList_.length) {
      this.unitManager_.showUnit(this.unitList_[super.currentIndex].unit_id);
      document.getElementById(this.panelName() + "Item_" + super.currentIndex).focus();
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

  setUnitList(unitList) {
    this.unitList_ = unitList;
    this.sortUnitList_();
  }

  setSortOrder(sortType) {
    if (this.sortType_ == sortType) {
      this.sortAscending_ = !this.sortAscending_;
    } else {
      this.sortType_ = sortType;
    }
    this.sortUnitList_();
    this.updateSortOrderDropdown_();
    this.draw();
  }

  sortUnitList_() {
    // Sort the list descending by set release date, then collector number.
    if (!this.unitList_) {
      return;
    }

    const sortFunction = SORT_ORDERS[this.sortType_].sortFunction;
    if (sortFunction) {
      if (this.sortAscending_) {
        this.unitList_.sort(sortFunction);
      } else {
        // Reverse the sort function.
        this.unitList_.sort(function(u1, u2) {
          return sortFunction(u2, u1);
        });
      }
    }
  }

  draw() {
    var currentSetId = null;
    var html = "";
    if (this.unitList_ && this.unitList_.length > 0) {
      const setName = SET_LIST[this.unitList_[0].set_id].name;
      const showSetTitles = !this.hideSetTitles_ &&
                            SORT_ORDERS[this.sortType_].showSetTitles;
      html = "<ul class='collection with-header'>";
      for (var i = 0; i < this.unitList_.length; ++i) {
        const unit = this.unitList_[i];
        if (showSetTitles && currentSetId != unit.set_id) {
          var setId = unit.set_id;
          var setItem = SET_LIST[setId];
          html += `
            <li class='collection-header blue-grey lighten-4'>
              <div class='listPanelImageDiv'>
                <img class='listPanelImage' src='/static/images/set/${setId}/icon.png' alt='${setId}' title='${setItem.name}'>
              </div>
              <div class='listPanelInfo'>${setItem.name}</div>
            </li>`;
          currentSetId = setId;
        }

        var color;
        if (unit.rarity) {
          color = RARITY_TO_COLOR[unit.rarity].color;
        } else {
          color = RARITY_COMMON_COLOR;
        }
        var minorInfo = "";
        var icon = null;
        // If the point is zero, just show the type.
        var typeInfo = null;
        if (unit.type == "object") {
          typeInfo = OBJECT_TYPE_INFO[unit.object_type];
        } else if (unit.type == "bystander") {
          typeInfo = BYSTANDER_TYPE_INFO[unit.bystander_type];
        } else if (unit.type == "attachment") {
          typeInfo = ATTACHMENT_TYPE_INFO[unit.attachment_type];
        } else {
          typeInfo = TYPE_LIST[unit.type];
          if (!typeInfo || !typeInfo.name) {
            throw new Error(`Unit '{unit.unit_id}' has unknown type '${unit.type}'`)
          }
        }
        if (unit.type != "character") {
          minorInfo = typeInfo.name;
          if (unit.point_values.length > 0) {
            minorInfo += " - ";
          }
        }
        if (unit.point_values.length > 0) {
          for (var j = 0; j < unit.point_values.length; ++j) {
            if (j != 0) {
              minorInfo += "/";
            }
            minorInfo += unit.point_values[j];
          }
          minorInfo += " points";
        }
        html += `
            <li class='collection-item avatar'>
              <a id='${this.panelName()}Item_${i}' class='unitListItem' href='' onclick='sideNav.setUnit("${unit.unit_id}"); return false;'>
                <div class='listPanelImageDiv'>
                  <i class='material-symbols-outlined' style='color:${color}'>${typeInfo.icon}</i>
                </div>
                <div class='listPanelInfo'>
                  <span class='title'>${unit.collector_number} - ${unit.name}</span>
                  <p class='listPanelMinorInfo'>${minorInfo}</p>
                </div>
              </a>
            </li>`;
      }
      html += "</ul>";
    }
    const panelName = "#" + this.panelName();
    $(panelName).html(html);
    super.currentIndex = 0;
    sideNav.updateTitle(true);
  }

  updateSortOrderDropdown_() {
    // Initialize the sort order dropdown list.
    var html = "";
    for (const sortType in SORT_ORDERS) {
      if (!SORT_ORDERS[sortType].showSortOption) {
        continue;
      }
      const sortTypeName = SORT_ORDERS[sortType].name;
      var icon = "";
      if (sortType == this.sortType_) {
        if (this.sortAscending_) {
          icon = "<i class='material-icons'>arrow_downward</i>";
        } else {
          icon = "<i class='material-icons'>arrow_upward</i>";
        }
      }
      html += `
        <li>
          <a href='#' onclick='sideNav.setSortOrder("${sortType}"); return false;'>
            ${sortTypeName}
            ${icon}
          </a>
        </li>`;
    }
    $("#sideNavSortOrderDropdown").html(html);
  }
}
