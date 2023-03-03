class CardView extends SmallUnitView {
  
  static isType(type) {
    return type == "id_card" ||
           type == "mystery_card" ||
           type == "tarot_card" ||
           type == "comic_panel";
  }

  constructor(unit) {
    super(unit);
    if (!CardView.isType(this.unit_.type)) {
      throw new Error("Mismatched unit type: CardView require type='id_card', 'mystery_card', 'tarot_card' or 'comic_panel'");
    }
  }

  getTypeInfo() {
    return CARD_TYPE_INFO[this.unit_.type];
  }
}