function quickSearch() {
}

function searchBySetId(setId) {
	jQuery.ajax({
		url: ajaxurl,
		type: 'post',
		dataType: 'text',
		data: {
			action: 'search_by_set',
			set_id: setId
		},
		success: function(searchResults) {
			showSearchResultsBySet(searchResults);
		},
		error: function (xhr, desc, err) {
			alert("Error in searchBySetId(" + setId + "): " + desc) + " err=" + err;
		}
	});
}

function showSearchResultsBySet(searchResults) {
	var units = JSON.parse(searchResults);
	var html = "<ul>";
	for (var unit of units) {
		html += "<li class='searchResult>";
		html += "<a href='' " +
			"onclick='showUnit(\"" + unit.id + "\"); return false;'>" +
			unit.name + "</a></li>";
	}
	html += "</ul>";
	document.getElementById("searchResultsContainer").innerHTML = html;
}