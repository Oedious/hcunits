class CardView extends SmallUnitView {
  
  static isType(type) {
    return type == "id_card" ||
           type == "mystery_card" ||
           type == "tarot_card";
  }

  constructor(unit) {
    super(unit);
    if (!CardView.isType(this.unit_.type)) {
      throw new Error("Mismatched unit type: CardView require type='id_card', 'mystery_card' or 'tarot_card'");
    }
  }

  getTypeInfo() {
    return CARD_TYPE_INFO[this.unit_.type];
  }
}