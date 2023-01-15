var SearchManager = function(dataSource) {
  this.dataSource_ = dataSource;
  // Search Results should always be in the form of an JSON array of units from
  // the database.
  this.searchResults_ = null;
  this.index_ = 20;
}

SearchManager.prototype.searchBySetId = function(setId) {
  var searchMgr = this;
  this.dataSource_.searchBySetId(setId,
    function(searchResults) {
      searchMgr.handleSearchResults_(searchResults);
    },
    function(xhr, desc, err) {
      alert("Error in searchBySetId(" + setId + "): " + desc) + " err=" + err;
    });
}

SearchManager.prototype.handleSearchResults_ = function(searchResults) {
  this.searchResults_ = searchResults;
  var element = document.getElementById("searchResults");
  if (this.searchResults_ && this.searchResults_.length > 0) {
    var html = "";
    for (var i = 0; i < this.searchResults_.length; ++i) {
      var unit = this.searchResults_[i];
      var color = RARITY_TO_COLOR[unit.rarity];
      html += `
        <li class='collection-item avatar'>
          <a id='searchResult_${i}' href='' onclick='mgr.showUnit("${unit.unit_id}"); return false;'>
            <i class='material-icons circle' style='font-size: 36px; color:${color};'>account_circle</i>
            <div class='searchResultInfo'>
              <span class='title'>${unit.collector_number} - ${unit.name}</span>
              <p class='searchResultPoints'>${unit.point_value} points</p>
            </div>
          </a>
        </li>`;
    }
    element.innerHTML = html;
    this.index_ = 0;
    this.showCurrentUnit_();
  } else {
    element.innerHTML = '';
    this.index_ = null;
  }
}

SearchManager.prototype.showCurrentUnit_= function() {
  mgr.showUnit(this.searchResults_[this.index_].unit_id);
  document.getElementById("searchResult_" + this.index_).focus();
}

SearchManager.prototype.previousUnit = function() {
  if (this.searchResults_) {
    --this.index_;
    if (this.index_ < 0) {
      this.index_ = this.searchResults_.length - 1;
    }
    this.showCurrentUnit_();
  }
}

SearchManager.prototype.nextUnit = function() {
  if (this.searchResults_) {
    ++this.index_;
    if (this.index_ >= this.searchResults_.length) {
      this.index_ = 0;
    }
    this.showCurrentUnit_();
  }
}

SearchManager.prototype.setCurrentUnit = function(unitId) {
  if (this.searchResults_) {
    for (var i = 0; i < this.searchResults_.length; ++i) {
      if (unitId == this.searchResults_[i].unit_id) {
        this.index_ = i;
        break;
      }
    }
  }
}

