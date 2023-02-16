class UnitManager {
    constructor(dataSource) {
      this.dataSource_ = dataSource;
      this.unitView_ = null;
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
      } else if (ObjectView.isType(unitJson.type)) {
          this.unitView_ = new ObjectView(unitJson);
      } else {
        throw new Error(`ViewManager doesn't know how to handle unit type ${unitJson.type}`);
      }
      this.unitView_.draw();
      if (!READ_ONLY) {
        this.updateAddUnitButton_();
      }
    }
    
    updateAddUnitButton_() {
      // First, determine how many options there are. If there are more than one
      // then use a dropdown. Otherwise, have the button directly add the unit.
      var options = [];
      const unit = this.unitView_.unit_;
      if (unit.type == "character" || unit.type == "mystery_card") {
        if (unit.point_values.length > 0) {
          for (const pointValue of unit.point_values) {
            options.push({
              "text": `Add to Main Force (${pointValue} points)`,
              "onclick": `teamManager.addUnit(${pointValue});`
            })
          }
        }
        options.push({
          "text": "Add to Sideline",
          "onclick": `teamManager.addUnitToSideline();`
        })
      } else if (unit.type == "object" || unit.type == "map" || unit.type == "tarot_card") {
        // TODO: Add the option for Equipment to be assigned to a unit in the
        // main force.

        if (unit.point_values.length > 0) {
          for (const pointValue of unit.point_values) {
            options.push({
              "text": `Add to Team (${pointValue} points)`,
              "onclick": `teamManager.addUnit(${pointValue});`
            })
          }
        } else {
          options.push({
            "text": "Add to Team",
            "onclick": `teamManager.addUnit(0);`
          })
        }
      }

      if (options.length == 0) {
        // Remove the button since this unit can't be added to a team.
        $('#addUnitButtonContainer').html("")
      } else {
        if (options.length == 1) {
          // If there's only a single option, just make the button directly do
          // the onclick action.
          var buttonOptions = `onclick='${options[0].onclick} return false;' title='${options[0].text}'`;
          var dropdown = "";
        } else {
          var buttonOptions = "data-target='addUnitButtonDropdown'";
          var dropdown = "<ul id='addUnitButtonDropdown' class='dropdown-content'>"
            for (const option of options) {
              dropdown += `
                <li><a href='#' onclick='${option.onclick} return false;'>
                  ${option.text}
                </a></li>`;
            }
          dropdown += "</ul>"
        }
        var left = $("#card0").width() - 18;
        var top = -12;
        var html = `
            <a href='#' id='addUnitButton' class='dropdown-trigger btn-floating btn-large waves-effect waves-light red' ${buttonOptions}'>
              <i class='material-icons'>add</i>
            </a>
            ${dropdown}`;
        $('#addUnitButtonContainer').html(html).attr('style', `left:${left}px; top:${top}px;`);
        if (dropdown) {
          $('#addUnitButton').dropdown();
        }
      }
    }
}