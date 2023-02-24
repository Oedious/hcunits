class SideNav {
  constructor(dataSource, unitManager, favoritesPanel) {
    this.dataSource_ = dataSource;
    this.setListPanel_ = new SetListPanel();
    this.favoritesPanel_ = favoritesPanel;
    this.advancedSearchPanel_ = new AdvancedSearchPanel();
    this.unitManager_ = unitManager;
    this.unitListPanel_ = new UnitListPanel(unitManager, null);
    this.panelStack_ = [this.setListPanel_];
    this.updateTitle(false);
    this.setupHotkeys_();
  }

  setupHotkeys_() {
    var sideNav = this;
    document.onkeydown = function onKeyDown(event) {
      var KEY_LEFT = '37';
      var KEY_UP = '38';
      var KEY_RIGHT = '39';
      var KEY_DOWN = '40';
      event = event || window.event;
      if (event.keyCode == KEY_LEFT || event.keyCode == KEY_UP) {
        sideNav.previousItem();
        event.preventDefault();
      }
      else if (event.keyCode == KEY_RIGHT || event.keyCode == KEY_DOWN) {
        sideNav.nextItem();
        event.preventDefault();
      }
    }
  }

  getTopPanel() {
    return this.panelStack_[this.panelStack_.length - 1];
  }

  nextItem() {
    this.getTopPanel().nextItem();
  }

  previousItem() {
    this.getTopPanel().previousItem();
  }

  // Reset the stack so that it's only this panel.
  setPanel(navPanel) {
    if (navPanel) {
      while (this.panelStack_.length > 0) {
        this.getTopPanel().hidePanel();
        this.panelStack_.pop();
      }
      this.panelStack_ = [navPanel];
      this.getTopPanel().showPanel();
      this.updateTitle(false);
    }
  }

  pushPanel(navPanel) {
    if (navPanel && this.getTopPanel() != navPanel) {
      this.getTopPanel().hidePanel();
      this.panelStack_.push(navPanel);
      this.getTopPanel().showPanel();
      this.updateTitle(false);
    }
  }

  popPanel() {
    if (this.panelStack_.length > 1) {
      this.getTopPanel().hidePanel();
      this.panelStack_.pop();
      this.getTopPanel().showPanel();
      this.updateTitle(false);
    }
  }

  updateTitle(showNumItems) {
    var html = "";
    var title = this.getTopPanel().title;
    if (title) {
      if (showNumItems && this.getTopPanel() == this.unitListPanel_) {
        const numItems = this.unitListPanel_.numItems();
        title +=  " (" + numItems + " units)";
      }
    }
    $("#sideNavPanelTitle").html(title);
    const backButtonVisibility =
        this.panelStack_.length > 1 ? "visible" : "hidden";
    $("#sideNavBackButton").css("visibility", backButtonVisibility);
    
    const sortOrderButtonVisibility =
        this.getTopPanel() == this.unitListPanel_ ||
        this.getTopPanel() == this.favoritesPanel_ ? "visible" : "hidden";
    $("#sideNavSortOrderButton").css("visibility", sortOrderButtonVisibility);
  }

  showSetList() {
    this.setPanel(this.setListPanel_);
    this.getTopPanel().showPanel();
  }

  showUnitList(setId) {
    var unitListPanel = this.unitListPanel_;
    unitListPanel.resetList();
    unitListPanel.setSortOrder("unit_id")
    unitListPanel.hideSetTitles = true;
    unitListPanel.title = SET_LIST[setId].name;
    this.pushPanel(unitListPanel);
    if (READ_ONLY) {
      updateQueryParams(["set=" + setId]);
    }
    this.dataSource_.searchBySetId(setId,
      function(unitList) {
        unitListPanel.setUnitList(unitList);
        unitListPanel.draw();
      },
      function(xhr, desc, err) {
        alert("Error in showUnitList(" + setId + "): " + desc) + " err=" + err;
      });
  }

  showFavorites() {
    if (!this.favoritesPanel_) {
      return;
    }
    this.setPanel(this.favoritesPanel_);
    this.getTopPanel().showPanel()
  }

  showAdvancedSearch() {
    this.setPanel(this.advancedSearchPanel_);
    this.getTopPanel().showPanel();
  }

  addSearchOption(optionId) {
    this.advancedSearchPanel_.addSearchOption(optionId);
  }

  resetAdvancedSearch() {
    this.advancedSearchPanel_.resetOptions();
  }

  showAdvancedSearchResults() {
    var query = this.advancedSearchPanel_.getQuery();
    if (jQuery.isEmptyObject(query)) {
      return;
    }
    this.pushPanel(this.unitListPanel_);
    this.showSearchResults_(query, "Search Results")
  }

  showSearchByKeywordResults(keyword) {
    if (keyword == "") {
      return;
    }
    const query = {"keyword": [keyword]};
    const title = `'${keyword}' Results`;
    this.setPanel(this.unitListPanel_);
    this.showSearchResults_(query, title);
  }
  
  showSearchByTypeResults(type) {
    if (type == "") {
      return;
    }
    const query = {"type": type};
    const title = `'${TYPE_LIST[type].name}' Results`;
    var unitListPanel = this.unitListPanel_;
    if (type == "tarot_card") {
      // Create a temporary panel so that it has its own sort settings.
      unitListPanel = new UnitListPanel(this.unitManager_, "tarot_cards");
    }
    this.setPanel(unitListPanel);
    this.showSearchResults_(query, title, unitListPanel);
  }
  
  showSearchResults_(query, title, unitListPanel) {
    unitListPanel.resetList();
    unitListPanel.title = title;
    unitListPanel.hideSetTitles = false;
    this.dataSource_.advancedSearch(query,
      function(unitList) {
        unitListPanel.setUnitList(unitList);
        unitListPanel.draw();
      },
      function(xhr, desc, err) {
        alert("Error in showSearchResults_(" + query + "): " + desc) + " err=" + err;
      });
  }

  showQuickSearchResults() {
    if (document.getElementById("quickSearch").value == "") {
      return;
    }
    var unitListPanel = this.unitListPanel_;
    unitListPanel.resetList();
    unitListPanel.title = "Quick Search Results";
    unitListPanel.hideSetTitles = false;
    this.setPanel(this.unitListPanel_);

    var query = document.getElementById("quickSearch").value;
    this.dataSource_.quickSearch(query,
      function(unitList) {
        unitListPanel.setUnitList(unitList);
        unitListPanel.draw();
      },
      function(xhr, desc, err) {
        alert("Error in showQuickSearchResults(" + query + "): " + desc) + " err=" + err;
      });
  }
  
  clearQuickSearch() {
    document.getElementById("quickSearch").value = "";
  }

  setUnit(unitId) {
    this.unitListPanel_.setCurrentIndexByUnit(unitId);
    this.unitManager_.showUnit(unitId);
  }
  
  setSortOrder(sortType) {
    this.getTopPanel().setSortOrder(sortType);
  }
}