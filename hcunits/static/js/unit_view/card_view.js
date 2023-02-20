const CARD_TYPE_INFO = {
  "mystery_card": {
    "name": "Mystery Card",
    "title": "MYSTERY CARD",
    "description": "During force construction, you may include any number of Mystery Cards on your Sideline. All Mystery Cards are UNIQUE.<br><br>Each Mystery Card has a list of keywords and a CLUE EFFECT that allows that card to gain Clue tokens. When a CLUE EFFECT is triggered, place a Clue token on that card. If multiple Mystery Cards have the same named CLUE EFFECT, you may only place a Clue token on one of those cards when that named CLUE EFFECT is triggered.<br><br>Each Mystery Card has effects that may be used while the number of Clue tokens on that card is equal to or greater than the number listed in parenthesis next to that effect. All CLUE EFFECTS and named effects have SIDELINE ACTIVE."
  },
  "tarot_card": {
    "name": "Tarot Card",
    "title": "TAROT CARD",
  },
  // TODO: Add ID cards
};

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