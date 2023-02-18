class DataSource {
  constructor() {
  }

  searchBySetId(setId, onSuccess, onError) {
    jQuery.get({
      url: `/api/v1/sets/${setId}/`,
      dataType: 'text',
      success: function(searchResults) {
        onSuccess(JSON.parse(searchResults));
      },
      error: onError
    });
  }

  searchByUnitId(unitId, onSuccess, onError) {
    jQuery.get({
      url: `/api/v1/units/${unitId}/`,
      dataType: 'text',
      success: function(searchResults) {
        onSuccess(JSON.parse(searchResults));
      },
      error: onError
    });
  }

  quickSearch(query, onSuccess, onError) {
    jQuery.get({
      url: `/api/v1/units/?search=${encodeURIComponent(query)}`,
      dataType: 'text',
      success: function(searchResults) {
        onSuccess(JSON.parse(searchResults));
      },
      error: onError
    });
  }

  advancedSearch(query, onSuccess, onError) {
    jQuery.post({
      url: `/api/v1/search/`,
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
