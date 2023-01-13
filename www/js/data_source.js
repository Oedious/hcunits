var DataSource = function() {
}

DataSource.prototype.searchBySetId = function(setId, onSuccess, onError) {
    jQuery.ajax({
        url: ajaxurl,
        type: 'post',
        dataType: 'text',
        data: {
            action: 'search_by_set_id',
            set_id: setId
        },
        success: function(searchResults) {
            onSuccess(JSON.parse(searchResults));
        },
        error: onError
    });
}

DataSource.prototype.searchByUnitId = function(unitId, onSuccess, onError) {
    jQuery.ajax({
        url: ajaxurl,
        type: 'post',
        dataType: 'text',
        data: {
            action: 'search_by_unit_id',
            unit_id: unitId
        },
        success: function(searchResults) {
            onSuccess(JSON.parse(searchResults));
        },
        error: onError
    });
}
