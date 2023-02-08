class FavoritesPanel extends UnitListPanel {
  constructor(dataSource) {
    super(dataSource)
    super.title = "Favorites"
  }
  
  panelName() {
    return "favoritesPanel"
  }
  
  // TODO: Populate this panel from the user settings.
}
