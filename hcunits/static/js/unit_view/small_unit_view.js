class SmallUnitView extends BaseUnitView {
  
  constructor(unit) {
    super(unit);
    this.extraLines_ = 0;
  }

  getTypeInfo() {
    throw new Error("Derived classes must implement SmallUnitView::getTypeInfo()");
  }
  
  draw() {
    const tokenHtml = this.drawToken_();
    const hasToken = tokenHtml.length > 0;
    const specialPowersHtml = this.drawSpecialPowers_(hasToken);
    var html = `
      <div class='column'>
        <div id='unitCard0' class='smallCard'>
          <div class='smallCardBorders' style='border-top: 70px solid black;'></div>
          <div id='smallCardHeader'>
            <div id='smallCardName'>${escapeHtml(this.unit_.name).toUpperCase()}</div>
            ${this.drawTypeInfo_()}
          </div>
          <div id='smallCardKeyphrases'>
            ${this.drawKeywords_()}
            ${this.drawKeyphrases_()}
          </div>
          <div id='smallCardCollectorNumber'>${this.unit_.collector_number}</div>
          ${tokenHtml}
          ${specialPowersHtml.length >= 1 ? specialPowersHtml[0] : ""}
          ${super.drawPointValues_(30)}
          ${this.drawFooter_()}
        </div>
      </div>`;

    if (specialPowersHtml.length > 1) {
      html += `
        <div class='column'>
          <div class='smallCard'>
            <div class='smallCardBorders' style='border-top: 25px solid black;'></div>
            ${specialPowersHtml.length >= 2 ? specialPowersHtml[1] : ""}
          </div>
        </div>`;
    }
  	$('#unitCardsContainer').html(html);
  }
  
  drawTypeInfo_() {
    var html = "";
    const typeInfo = this.getTypeInfo();
    if (typeInfo && typeInfo.name) {
      if (typeInfo.description) {
        html = `
          <div id='smallCardType'>
            <div class='tooltip'>
              <i>${typeInfo.name}</i>
              <span class='tooltiptext'><b>${typeInfo.name}</b>: ${typeInfo.description}</span>
            </div>
          </div>`;
      } else {
        html = `<div id='smallCardType'><i>${typeInfo.name}</i></div>`;
      }
    }
    return html;
  }
  
  drawKeyphrases_() {
    return "";
  }
  
  drawKeywords_() {
    if (this.unit_.keywords.length == 0) {
      return "";
    }
    var html = "<div><b>KEYWORDS: ";
    for (var i = 0; i < this.unit_.keywords.length; ++i) {
      if (i != 0) {
        html += ", "
      }
  		var escapedKeyword = escapeHtml(this.unit_.keywords[i]);
  		if (READ_ONLY) {
  		  html += escapedKeyword;
  		} else {
  		  html += `<a href='' style='color:black;' onclick='sideNav.showSearchByKeywordResults("${escapedKeyword}"); return false;'>${escapedKeyword.toUpperCase()}</a>`;
  		}
    }
    html += "</b></div>"
    return html;
  }
  
  drawToken_() {
    return "";
  }
  
  drawSpecialPowers_(hasToken) {
    if (!this.unit_.special_powers) {
      return [];
    }
    const CHARS_PER_NAME_LINE_WITH_ICON = 40;
    const CHARS_PER_NAME_LINE_WITHOUT_ICON = 60;
    const CHARS_PER_DESC_LINE_WITH_ICON = 60;
    const CHARS_PER_DESC_LINE_WITHOUT_ICON = 70;
    // The minimum number of lines varies on the whether we show the the token
    // and the "Point Value" bar.
    var card0Lines = 4;
    var hasPointValue = this.unit_.point_values.length > 0
    if (!hasPointValue) {
      card0Lines += 2;
    }
    if (!hasToken) {
      card0Lines += 11;
    }
    const LINES_PER_CARD = [card0Lines, 23];
    var currentLineCount = 0;
    var currentCard = 0;

    var htmlColumns = [];
    var top = hasToken ? 288 : 100;
    var html = `<table id='smallCardSpecialPowersTable0' class='specialPowersTable' style='top:${top}px;'>`;
    for (var i = 0; i < this.unit_.special_powers.length; ++i) {
      var power = this.unit_.special_powers[i];
      var type = power.type;
      var iconHtml = "";
      if (type == "costed_trait") {
        const description = escapeHtml(SPECIAL_POWER_TYPE_LIST[type].description);
        iconHtml = `
          <td class='specialPowerImg'>
            <img class='specialPowerIcon' src='/static/images/sp_${type}.png' alt='' title='${description}'/>
            <div class='specialPowerPointValue'>+${power.point_value} POINTS</div>
          </td>`;
      } else if (type == "location") {
        const description = escapeHtml(SPECIAL_POWER_TYPE_LIST[type].description);
        iconHtml = `
          <td class='specialPowerImg'>
            <i class='material-icons' title='${description}'>add_home_work</i>
            <div class='specialPowerPointValue'>+${power.point_value} POINTS</div>
          </td>`;
      } else if (type == "rally_trait") {
        const description = escapeHtml(SPECIAL_POWER_TYPE_LIST[type].description);
        iconHtml = `
          <td class='specialPowerImg'>
            <div class='specialPowerRally' style='${RALLY_TYPE_TO_STYLE[power.rally_type]}' title='${description}'>
              <img class='specialPowerIcon' src='/static/images/sp_trait.png' alt=''/>
              <img class='specialPowerRallyDie' src='/static/images/d6_${power.rally_die}.png' alt='${power.rally_die}'/>
            </div>
          </td>`;
      } else if (type == "consolation") {
        // Don't use an icon, but add a tag to preserve spacing.
        iconHtml = "<td class='specialPowerImg'></td>";
      } else if (type == "object" || type == "equipment" || type == "mystery_card" || type == "tarot_card") {
        // Don't use an icon and use the full space of the card.
        iconHtml = "";
      } else {
        var combatSymbolType = type;
        if (type != "trait") {
          combatSymbolType = this.unit_[type + "_type"];
        }
        iconHtml = `
          <td class='specialPowerImg'>
            <img class='specialPowerIcon' src='/static/images/sp_${combatSymbolType}.png' alt=''/>
          </td>`;
      }

      const CHARS_PER_NAME_LINE = iconHtml.length == 0 ? CHARS_PER_NAME_LINE_WITHOUT_ICON : CHARS_PER_NAME_LINE_WITH_ICON;
      const CHARS_PER_DESC_LINE = iconHtml.length == 0 ? CHARS_PER_DESC_LINE_WITHOUT_ICON : CHARS_PER_DESC_LINE_WITH_ICON;
      const headerLines = power.name ? Math.ceil(power.name.length / CHARS_PER_NAME_LINE) : 0;
      const descLines = power.description ? Math.ceil(power.description.length / CHARS_PER_DESC_LINE) : 0;
      const lines = headerLines + descLines;

      // If the line count surpasses the max in the current card, move to the
      // next card.
      while (currentLineCount + lines > LINES_PER_CARD[currentCard]) {
        if (currentCard >= 1) {
          throw new Error(`Cannot draw special powers for unit ${this.unit_.unit_id}: text won't fit on 2 cards`);
        }
        html += "</table>";
        htmlColumns.push(html);
        ++currentCard;
        currentLineCount = 0;
        html = `<table id='smallCardSpecialPowersTable${currentCard}' class='specialPowersTable'>`;
      }
      currentLineCount += lines;

      var nameHtml = ""
      if (power.name) {
        nameHtml = `<b>${escapeHtml(power.name.toUpperCase())}</b><br>`
      }
      html += `
        <tr class='specialPowerRow'>
          ${iconHtml}
          <td class='specialPower'>${nameHtml}${escapeHtml(power.description)}</td>
        </tr>`;
    }
    html += "</table>"
    htmlColumns.push(html)
    return htmlColumns;
  }

  // Exists so that child classes (ie MapView) can override to add the footer.
  drawFooter_() {
    return ""
  }
}