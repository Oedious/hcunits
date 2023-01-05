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
			action: 'search_by_set',
			set_id: setId
		},
		success: onSuccess(searchResults),
		error: onError
	});
}