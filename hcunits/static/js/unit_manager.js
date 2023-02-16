class UnitManager {
  constructor(dataSource) {
    this.dataSource_ = dataSource;
    this.unitView_ = null;
    this.onShowUnitCallback_ = null
  }

  setOnShowUnitCallback(callback) {
    this.onShowUnitCallback_ = callback;    
  }

  getUnit() {
    if (!this.unitView_) {
      return null;
    }
    return this.unitView_.unit_;
  }

  showUnit(unitId) {
    var unitMgr = this;
    this.dataSource_.searchByUnitId(unitId,
      function(unitJson) {
        unitMgr.showUnit_(unitJson);
      },
      function(xhr, desc, err) {
        console.log("Error in showUnit(" + unitId + "): " + desc + " err=" + err);
      });
  }

  showUnit_(unitJson) {
    if (CharacterView.isType(unitJson.type)) {
      this.unitView_ = new CharacterView(unitJson);
    }
    else if (ObjectView.isType(unitJson.type)) {
      this.unitView_ = new ObjectView(unitJson);
    }
    else {
      throw new Error(`ViewManager doesn't know how to handle unit type ${unitJson.type}`);
    }
    this.unitView_.draw();
    if (this.onShowUnitCallback_) {
      this.onShowUnitCallback_();
    }
  }
}
