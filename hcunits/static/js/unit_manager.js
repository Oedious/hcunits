class UnitManager {
  constructor(dataSource) {
    this.dataSource_ = dataSource;
    this.unitView_ = null;
    this.onShowUnitCallbacks_ = []
  }

  addOnShowUnitCallback(callback) {
    this.onShowUnitCallbacks_.push(callback);
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
      function(unit) {
        unitMgr.showUnit_(unit);
      },
      function(xhr, desc, err) {
        console.log("Error in showUnit(" + unitId + "): " + desc + " err=" + err);
      });
  }

  showUnit_(unit) {
    if (CharacterView.isType(unit.type)) {
      this.unitView_ = new CharacterView(unit);
    } else if (ObjectView.isType(unit.type)) {
      this.unitView_ = new ObjectView(unit);
    } else if (BystanderView.isType(unit.type)) {
      this.unitView_ = new BystanderView(unit);
    } else if (CardView.isType(unit.type)) {
      this.unitView_ = new CardView(unit);
    } else if (MapView.isType(unit.type)) {
      // Need to make a second RPC call to fetch the map layout file.
      var unitMgr = this;
      var unitCopy = unit;
      this.dataSource_.loadMap(unit.map_url,
        function(map) {
          unitMgr.showMap_(unitCopy, map);
        },
        function(xhr, desc, err) {
          console.log("Error loading map_url (" + unitCopy.map_url + "): " + desc + " err=" + err);
        });
      return;
    } else {
      throw new Error(`ViewManager doesn't know how to handle unit type ${unitJson.type}`);
    }
    this.draw();
  }
  
  draw() {
    this.unitView_.draw();
    for (const callback of this.onShowUnitCallbacks_) {
      callback();
    }
    if (READ_ONLY) {
      const unit = this.unitView_.unit_
      updateQueryParams([`set=${unit.set_id}`, `unit=${unit.unit_id}`]);
    }
  }
  
  showMap_(unit, map) {
    this.unitView_ = new MapView(unit, map);
    this.draw();
  }
}
