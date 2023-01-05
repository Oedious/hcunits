var SearchManager = function(dataSource) {
  this.dataSource_ = dataSource;
}

SearchManager.prototype.searchBySetId = function(setId) {
	this.dataSource_.searchBySetId(setId,
	    function(searchResults) {
				var units = JSON.parse(searchResults);
				var html = "<ul>";
				for (var unit of units) {
					html += `
						<li>
						  <span class='searchResultTabOuter'>
						    <div class='searchResultTabInner'>${unit.collector_number}</div>
						    ${unit.point_value}
						  </span>
						  <a href='' onclick='mgr.showUnit("${unit.id}"); return false;'>
						    ${unit.name}
						  </a>
						</li>
						`;
				}
				html += "</ul>";
				document.getElementById("searchResultsContainer").innerHTML = html;
	    },
			function (xhr, desc, err) {
			  alert("Error in searchBySetId(" + setId + "): " + desc) + " err=" + err;
		});
}
