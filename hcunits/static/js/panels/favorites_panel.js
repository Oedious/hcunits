class FavoritesPanel extends UnitListPanel {
  constructor(unitManager, jsonFavorites, csrfToken) {
    super(unitManager)
    this.title = "Favorites"
    this.sortType_ = "unit_id";
    this.setUnitList(JSON.parse(jsonFavorites));
    this.csrfToken_ = csrfToken;
    if (!READ_ONLY) {
      var favoritesPanel = this;
      this.unitManager_.addOnShowUnitCallback(function() {
        favoritesPanel.updateFavoriteButton_();
      })
    }
  }
  
  panelName() {
    return "favoritesPanel";
  }

  showPanel() {
    this.draw();
    super.showPanel();
  }

  addFavorite(unitId) {
    if (!unitId || unitId == "" || this.isFavorite(unitId)) {
      console.log(`Cannot add invalid favorite '${unitId}'`);
      return;
    }
    
    const unit = this.unitManager_.getUnit();
    if (!unit || unitId != unit.unit_id) {
      console.log(`Failed to add unit '${unitId}' - mismatch from UnitManager '${unit.unit_id}'`);
    }
    
    // TODO: copy over only the parts that matter rather than the whole Unit.

    var favoritesPanel = this;
    $.ajax({
      url: `/favorites/${unitId}/`,
      type: 'PUT',
      headers: { "X-CSRFToken": this.csrfToken_ },
      success: function(response) {
        favoritesPanel.unitList_.push(unit);
        favoritesPanel.draw();
        favoritesPanel.updateFavoriteButton_();
      },
      error: function(xhr, desc, err) {
        console.log(`Error adding favorite '${unitId}'`);
      }
    })
  }

  removeFavorite(unitId) {
    if (!unitId || unitId == "") {
      console.log(`Cannot remove invalid favorite '${unitId}'`);
      return;
    }
    
    const index = this.findFavorite(unitId);
    if (index < 0) {
      console.log(`Cannot remove unknown favorite '${unitId}'`);
      return;
    }

    var favoritesPanel = this;
    $.ajax({
      url: `/favorites/${unitId}/`,
      type: 'DELETE',
      headers: { "X-CSRFToken": this.csrfToken_ },
      success: function(response) {
        favoritesPanel.unitList_.splice(index, 1);
        favoritesPanel.draw();
        favoritesPanel.updateFavoriteButton_();
      },
      error: function(xhr, desc, err) {
        console.log(`Error deleting favorite '${unitId}'`);
      }
    })
  }

  updateFavoriteButton_() {
    const unit = this.unitManager_.getUnit();
    if (!unit) {
      $('#favoriteButtonContainer').html("");
      return;
    }
    var html = "";
    const unitId = unit.unit_id;
    if (this.isFavorite(unitId)) {
      html = `
        <a href='#' id='removeFavoriteButton' class='btn-floating btn-medium waves-effect waves-light'
           onclick='favoritesPanel.removeFavorite("${unitId}"); return false;'
           title='Remove from Favorites'>
          <i id='removeFavoriteButtonIcon' class='material-icons'>star</i>
        </a>`;
    } else {
      html = `
        <a href='#' id='addFavoriteButton' class='btn-floating btn-medium waves-effect waves-light'
           onclick='favoritesPanel.addFavorite("${unitId}"); return false;'
           title='Add to Favorites'>
          <i id='addFavoriteButtonIcon' class='material-symbols-outlined'>star</i>
        </a>`;
    }
    $('#favoriteButtonContainer').html(html);
  }
  
  findFavorite(unitId) {
    for (var i = 0; i < this.unitList_.length; ++i) {
      if (this.unitList_[i].unit_id == unitId) {
        return i;
      }
    }
    return -1;
  }

  isFavorite(unitId) {
    return this.findFavorite(unitId) >= 0;
  }
}
