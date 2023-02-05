class ViewManager {
    constructor(dataSource) {
      this.dataSource_ = dataSource;
      this.unitView_ = null;
    }

    showUnit(unitId) {
      var viewMgr = this;
    	this.dataSource_.searchByUnitId(unitId,
    		function(unitJson) {
    			viewMgr.showUnit_(unitJson);
    		},
    		function(xhr, desc, err) {
    			alert("Error in showUnit(" + unitId + "): " + desc + " err=" + err);
    		});
    }
    
    showUnit_(unitJson) {
      if (CharacterView.isType(unitJson.type)) {
          this.unitView_ = new CharacterView(unitJson);
      } else if (ObjectView.isType(unitJson.type)) {
          this.unitView_ = new ObjectView(unitJson);
      } else {
        throw new Error(`ViewManager doesn't know how to handle unit type ${unitJson.type}`);
      }
      this.unitView_.draw();
    }
}