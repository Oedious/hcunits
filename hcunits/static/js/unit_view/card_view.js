class CardView extends SmallUnitView {
  
  static isType(type) {
    return type == "id_card" ||
           type == "mystery_card" ||
           type == "tarot_card" ||
           type == "attachment" ||
           type == "battlefield_condition" ||
           type == "feat";
  }

  constructor(unit) {
    super(unit);
    if (!CardView.isType(this.unit_.type)) {
      throw new Error("Mismatched unit type: CardView require type='id_card', 'mystery_card', 'tarot_card', 'battlefield_condition', 'feat' or 'attachment'");
    }
  }

  getTypeInfo() {
    if (this.unit_.type == "attachment") {
      return ATTACHMENT_TYPE_INFO[this.unit_.attachment_type];
    }
    return CARD_TYPE_INFO[this.unit_.type];
  }
}