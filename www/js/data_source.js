var DataSource = function(setList) {
  this._setList = setList;
}

DataSource.prototype.getSetList = function() {
  return this._setList;
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
    success: onSuccess,
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
    success: onSuccess,
    error: onError
  });
}