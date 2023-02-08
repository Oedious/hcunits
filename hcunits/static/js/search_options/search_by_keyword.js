class SearchByKeyword extends SearchOption {
  constructor() {
    super()
  }

  static id() {
    return "Keyword"
  }
  
  static title() {
    return "Keyword"
  }
  
  draw() {
    return `
      <div class="input-field col s12 m8">
        <label id="searchOptionsKeywordsLabel">Keywords</label>
        <div id="searchOptionsKeywords" class="chips chips-autocomplete"></div>
      </div>`
  }
  
  initElement() {
    var keywordsChips = {}
    // Add keywords to chips autocomplete.
    for (const [keyword, type] of Object.entries(KEYWORD_LIST)) {
      keywordsChips[keyword] = null
    }
    $('#searchOptionsKeywords').chips({
      placeholder: "Enter a keyword",
      secondaryPlaceholder: "+keyword",
      autocompleteOnly: true,
      autocompleteOptions: {
        data: keywordsChips,
        limit: Infinity,
        minLength: 1
      }
    });
  }
  
  addOptionToQuery(query) {
    var chipsInstance = M.Chips.getInstance(document.getElementById('searchOptionsKeywords'))
    var keywords = []
    for (var chip of chipsInstance.chipsData) {
      var keyword = chip.tag
      if (keyword.length > 0) {
        keywords.push(keyword)
      }
    }
    if (keywords.length > 0) {
      query['keyword'] = keywords
    }
  }
}