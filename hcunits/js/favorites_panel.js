class FavoritesPanel extends UnitListPanel {
  constructor(dataSource) {
    super(dataSource)
    super.title = "Browse Favorites"
  }
  
  panelName() {
    return "favoritesPanel"
  }
  
  // TODO: Populate this panel from the user settings.
}
