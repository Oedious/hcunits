class DataSource {
  constructor(hostName) {
    this.hostName_ = hostName
  }

  searchBySetId(setId, onSuccess, onError) {
    jQuery.get({
      url: `${this.hostName_}/sets/${setId}/`,
      dataType: 'text',
      success: function(searchResults) {
        onSuccess(JSON.parse(searchResults));
      },
      error: onError
    });
  }

  searchByUnitId(unitId, onSuccess, onError) {
    jQuery.get({
      url: `${this.hostName_}/units/${unitId}/`,
      dataType: 'text',
      success: function(searchResults) {
        onSuccess(JSON.parse(searchResults));
      },
      error: onError
    });
  }

  quickSearch(query, onSuccess, onError) {
    jQuery.get({
      url: `${this.hostName_}/units/?search=${encodeURIComponent(query)}`,
      dataType: 'text',
      success: function(searchResults) {
        onSuccess(JSON.parse(searchResults));
      },
      error: onError
    });
  }

  advancedSearch(query, onSuccess, onError) {
    jQuery.post({
      url: `${this.hostName_}/search/`,
      data: JSON.stringify(query),
      dataType: 'text',
      contentType: 'application/json',
      success: function(searchResults) {
        onSuccess(JSON.parse(searchResults));
      },
      error: onError
    });
  }
}
