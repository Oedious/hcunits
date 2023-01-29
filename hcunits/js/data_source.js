var DataSource = function() {
}

DataSource.prototype.searchBySetId = function(setId, onSuccess, onError) {
    jQuery.get({
        url: `https://api.hcunits.net/sets/${setId}/`,
        dataType: 'text',
        success: function(searchResults) {
            onSuccess(JSON.parse(searchResults));
        },
        error: onError
    });
}

DataSource.prototype.searchByUnitId = function(unitId, onSuccess, onError) {
    jQuery.get({
        url: `https://api.hcunits.net/units/${unitId}/`,
        dataType: 'text',
        success: function(searchResults) {
            onSuccess(JSON.parse(searchResults));
        },
        error: onError
    });
}
