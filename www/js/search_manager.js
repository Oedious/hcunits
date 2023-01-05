var SearchManager = function(dataSource) {
  this.dataSource_ = dataSource;
}

SearchManager.prototype.searchBySetId = function(setId) {
	this.dataSource_.searchBySetId(setId,
	    function(searchResults) {
				var units = JSON.parse(searchResults);
				var html = "";
				for (var unit of units) {
					html += `
					    <li class="collection-item avatar">
							  <a href='' onclick='mgr.showUnit("${unit.id}"); return false;'>
							    <i class="material-icons circle">folder</I>
							    <span class="title">${unit.collector_number} - ${unit.name}</span>
							    <p class="searchResultInfo">Points: ${unit.point_value}</p>
							  </a>
							</li>
						`;
					/*
					html += `
						  <a href='' class='collection-item' onclick='mgr.showUnit("${unit.id}"); return false;'>
							  <div>${unit.collector_number} - ${unit.name}</div>
							    <div class='searchResultInfo'>
								    Points: 
									  <span>${unit.point_value}</span>
								</div>
						  </a>
						`;*/
				}
				document.getElementById("searchResults").innerHTML = html;
	    },
			function (xhr, desc, err) {
			  alert("Error in searchBySetId(" + setId + "): " + desc) + " err=" + err;
		});
}
