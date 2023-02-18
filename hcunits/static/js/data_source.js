class DataSource {
  constructor() {
    this.HOST_NAME = "https://api.hcunits.net";
  }

  searchBySetId(setId, onSuccess, onError) {
    jQuery.get({
      url: `${this.HOST_NAME}/sets/${setId}/`,
      dataType: 'text',
      success: function(searchResults) {
        onSuccess(JSON.parse(searchResults));
      },
      error: onError
    });
  }

  searchByUnitId(unitId, onSuccess, onError) {
    jQuery.get({
      url: `${this.HOST_NAME}/units/${unitId}/`,
      dataType: 'text',
      success: function(searchResults) {
        onSuccess(JSON.parse(searchResults));
      },
      error: onError
    });
  }

  quickSearch(query, onSuccess, onError) {
    jQuery.get({
      url: `${this.HOST_NAME}/units/?search=${encodeURIComponent(query)}`,
      dataType: 'text',
      success: function(searchResults) {
        onSuccess(JSON.parse(searchResults));
      },
      error: onError
    });
  }

  advancedSearch(query, onSuccess, onError) {
    jQuery.post({
      url: `${this.HOST_NAME}/search/`,
      data: JSON.stringify(query),
      dataType: 'text',
      contentType: 'application/json',
      success: function(searchResults) {
        onSuccess(JSON.parse(searchResults));
      },
      error: onError
    });
  }

  loadMap(map_url, onSuccess, onError) {
    jQuery.get({
      url: map_url,
      dataType: 'text',
      success: function(searchResults) {
        onSuccess(JSON.parse(searchResults));
      },
      error: onError
    });
  }
}
