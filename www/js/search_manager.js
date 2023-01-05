var SearchManager = function(dataSource) {
  this.dataSource_ = dataSource;
}

SearchManager.prototype.searchBySetId = function(setId) {
	this.dataSource_.searchBySetId(setId,
	    function(searchResults) {
				var units = JSON.parse(searchResults);
				var html = "";
				for (var unit of units) {
					var color = RARITY_TO_COLOR[unit.rarity];
					html += `
					    <li class="collection-item avatar">
							  <a href='' onclick='mgr.showUnit("${unit.id}"); return false;'>
							    <i class="material-icons circle" style="font-size: 36px; color:${color};">account_circle</I>
							    <span class="title">${unit.collector_number} - ${unit.name}</span>
							    <p class="searchResultInfo">Points: ${unit.point_value}</p>
							  </a>
							</li>
						`;
				}
				document.getElementById("searchResults").innerHTML = html;
	    },
			function (xhr, desc, err) {
			  alert("Error in searchBySetId(" + setId + "): " + desc) + " err=" + err;
		});
}
