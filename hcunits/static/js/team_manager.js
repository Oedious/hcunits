const MESSAGE_DELAY_MS = 500;
const MAX_RETRIES = 3;

class TeamManager {
  constructor(unitManager, jsonTeam, csrfToken) {
    this.unitManager_ = unitManager;
    this.team_ = JSON.parse(jsonTeam);
    this.serverTeam_ = JSON.parse(jsonTeam);
    this.csrfToken_ = csrfToken;
    this.teamTimeout_ = null;
    this.retryCount_ = 0;

    if (!READ_ONLY) {
      // Add change handlers so that we update the server when the values change.
      var teamManager = this;
      $("#teamName").keyup(function() {
        teamManager.team_.name = $(this).val();
        teamManager.updateTeam();
      })

      $("#teamDescription").keyup(function() {
        teamManager.team_.description = $(this).val();
        teamManager.updateTeam();
      })

      $("#teamPointLimit").bind('keyup mouseup', function() {
        teamManager.team_.point_limit = $(this).val();
        teamManager.updateTeam();
      })

      $("#teamAge").on('change', function() {
        teamManager.team_.age = $(this).find(":selected").val();
        teamManager.updateTeam();
      })

      $("#teamVisibility").on('change', function() {
        teamManager.team_.visibility = $(this).find(":selected").val();
        teamManager.updateTeam();
      })

      var teamManager = this;
      this.unitManager_.setOnShowUnitCallback(function() {
        teamManager.updateAddUnitButton_();
      })
    }

    // Update the UI to reflect the provided team.
    this.draw();
  }

  draw() {
    const html = `
      <div id="teamColumn0" class="column">
        <div id="teamMainForce" class="teamSection">
          ${this.drawMainForce_()}
        </div>
      </div>
      <div id="teamColumn1" class="column">
        <div id="teamMaps" class="teamSection">
          ${this.drawMaps_()}
        </div>
        <div id="teamSideline" class="teamSection">
          ${this.drawSideline_()}
        </div>
      </div>
      <div id="teamColumn2" class="column">
        <div id="teamObjects" class="teamSection">
          ${this.drawObjects_()}
        </div>
        <div id="teamTarotCards" class="teamSection">
          ${this.drawTarotCards_()}
        </div>
      </div>`;
    $("#teamContainer").html(html);
  
    if (!READ_ONLY) {
      $('.teamSectionHeaderButton').floatingActionButton();
    }
  }

  drawMainForce_() {
    if (READ_ONLY && this.team_.main_force.length <= 0) {
      return "";
    }

    var points = 0;
    for (const unit of this.team_.main_force) {
      points += unit.point_value;
      if (unit.costed_trait) {
        points += unit.costed_trait.point_value;
      }
      if (unit.equipment) {
        points += unit.equipment.point_value;
      }
    }

    var html = "<div class='row'><h6 class='teamSectionHeader'><div><b>Main Force</b></div>";
    if (points) {
      html += `<div class="teamSectionPointTotal"><b>${points}</b></div>`;
    }
    html += "</h6>";
    
    if (!READ_ONLY) {
      html += `
        <div id="teamSectionMainForceButton" class="teamSectionHeaderButton" title="Search for Main Force Units">
          <a class="btn-floating btn-small waves-effect-waves-light blue" onclick="sideNav.showSetList(); return false;">
            <i class="material-symbols-outlined" style="color:white;">group</i>
          </a>
        </div>
        <div id="teamSectionEquipmentButton" class="teamSectionHeaderButton" title="Search for Equipment">
          <a class="btn-floating btn-small waves-effect-waves-light blue" onclick="sideNav.showSearchByTypeResults('equipment'); return false;">
            <i class="material-symbols-outlined" style="color:white;">swords</i>
          </a>
        </div>`;
    }
    html += "<ul>";

    if (this.team_.main_force.length <= 0) {
      html += "<i>Search for units to add to your Main Force...</i>";
    } else {
      for (var i = 0; i < this.team_.main_force.length; ++i) {
        const unit = this.team_.main_force[i];
        html += `
          <li class='teamItem'>
            <div class="teamItemText">
              <a href="#" class="teamItemUnitLink" onclick="unitManager.showUnit('${unit.unit_id}'); return false;">
                ${unit.name} (${unit.unit_id})
              </a>
              <div class="teamItemPoints">${unit.point_value}</div>`;
        if (!READ_ONLY) {
          html += `
            <a class="teamItemRemoveButton" href="#" onclick="teamManager.removeUnit('main_force', ${i}); return false;">
              <i class="material-icons">cancel</i>
            </a>`;
        }
        html += "</div></li>";
        if (unit.costed_trait) {
          const costed_trait = unit.costed_trait;
          html += `
            <li class='teamItem'>
              <div class='teamItemIconCostedTrait'>
                <i class="material-icons" title="Optional Trait">star</i>
              </div>
              <div class="teamItemText">
                <a href="#" class="teamItemUnitLink" onclick="unitManager.showUnit('${unit.unit_id}'); return false;">
                  ${costed_trait.name}
                </a>
              <div>${costed_trait.point_value}</div>
            </div>
          </li>`;
        }
        if (unit.equipment) {
          const equipment = unit.equipment;
          html += `
            <li class='teamItem'>
              <div class='teamItemIcon'>
                <i class="material-symbols-outlined" title="Equipped With">swords</i>
              </div>
              <div class="teamItemText">
                <a href="#" class="teamItemUnitLink" onclick="unitManager.showUnit('${equipment.unit_id}'); return false;">
                  ${equipment.name} (${equipment.unit_id})
                </a>
                <div class="teamItemPoints">${equipment.point_value}</div>`;
          if (!READ_ONLY) {
            html += `
              <a class="teamItemRemoveButton" href="#" onclick="teamManager.removeUnit('equipment', ${i}); return false;">
                <i class="material-icons">cancel</i>
              </a>`;
          }
          html += "</div></li>";
        }
      }
    }
    html += "</ul></div>";
    return html;
  }

  drawSideline_() {
    if (READ_ONLY && this.team_.sideline.length <= 0) {
      return "";
    }
    var html = "<div class='row'><h6><b>Sideline</b></h6>";
    
    if (!READ_ONLY) {
      html += `
        <div id="teamSectionSidelineButton" class="teamSectionHeaderButton" title="Search for Sideline Units">
          <a class="btn-floating btn-small waves-effect-waves-light blue" onclick="sideNav.showSetList(); return false;">
            <i class="material-symbols-outlined" style="color:white;">sync_alt</i>
          </a>
        </div>`;
    }
    html += "<ul>";
    if (this.team_.sideline.length <= 0) {
      html += "<i>Search for units to add to your Sideline...</i>";
    } else {
      for (var i = 0; i < this.team_.sideline.length; ++i) {
        const unit = this.team_.sideline[i];
        html += `
          <li class='teamItem'>
            <div class="teamItemText">
              <a href="#" class="teamItemUnitLink" onclick="unitManager.showUnit('${unit.unit_id}'); return false;">
                ${unit.name} (${unit.unit_id})
              </a>`;
        if (!READ_ONLY) {
          html += `
            <a class="teamItemRemoveButton" href="#" onclick="teamManager.removeUnit('sideline', ${i}); return false;">
              <i class="material-icons">cancel</i>
            </a>`;
        }
        html += "</div></li>";
      }
    }
    html += "</ul></div>";
    return html;
  }

  drawMaps_() {
    if (READ_ONLY && this.team_.maps.length <= 0) {
      return "";
    }

    var points = 0;
    for (const unit of this.team_.maps) {
      if (unit.location) {
        points += parseInt(unit.location.point_value);
      }
    }

    var html = `
      <div class='row'>
        <h6 class="teamSectionHeader"><div><b>Maps</b></div>`;
    if (points) {
      html += `<div class="teamSectionPointTotal"><b>${points}</b></div>`;
    }
    html += "</h6>"
    if (!READ_ONLY) {
      html += `
        <div id="teamSectionMapButton" class="teamSectionHeaderButton" title="Search for Maps">
          <a class="btn-floating btn-small waves-effect-waves-light blue" onclick="sideNav.showSearchByTypeResults('map'); return false;">
            <i class="material-symbols-outlined" style="color:white;">map</i>
          </a>
        </div>`;
    }
    html += "<ul>";
    if (this.team_.maps.length <= 0) {
      html += "<i>Add up to 3 Maps...</i>";
    } else {
      for (var i = 0; i < this.team_.maps.length; ++i) {
        const unit = this.team_.maps[i];
        html += 
          `<li class='teamItem'>
            <div class="teamItemText">
              <a href="#" class="teamItemUnitLink" onclick="unitManager.showUnit('${unit.unit_id}'); return false;">
                ${unit.name} (${unit.unit_id})
              </a>`;
        if (unit.point_value) {
          html += `<div class="teamItemPoints">${unit.point_value}</div>`;
        }
        if (!READ_ONLY) {
          html += `
            <a class="teamItemRemoveButton" href="#" onclick="teamManager.removeUnit('maps', ${i}); return false;">
              <i class="material-icons">cancel</i>
            </a>`;
        }
        html += "</div></li>";
        if (unit.location) {
          const location = unit.location;
          html += `
            <li class='teamItem'>
              <div class='teamItemIcon'>
                <i class="material-symbols-outlined" title="Location">home_work</i>
              </div>
              <div class="teamItemText">
                <a href="#" class="teamItemUnitLink" onclick="unitManager.showUnit('${unit.unit_id}'); return false;">
                  ${location.name}
                </a>
              <div>${location.point_value}</div>
            </div>
          </li>`;
        }
      }
    }
    html += "</ul></div>";
    return html;
  }

  drawTarotCards_() {
    if (READ_ONLY && this.team_.tarot_cards.length <= 0) {
      return "";
    }
    var html = "<div class='row'><h6><b>Tarot Deck</b></h6>";
    if (!READ_ONLY) {
      html += `
        <div id="teamSectionTarotCardButton" class="teamSectionHeaderButton" title="Search for Tarot Cards">
          <a class="btn-floating btn-small waves-effect-waves-light blue" onclick="sideNav.showSearchByTypeResults('tarot_card'); return false;">
            <i class="material-symbols-outlined" style="color:white;">content_copy</i>
          </a>
        </div>`;
    }
    html += "<ul>";
    if (this.team_.tarot_cards.length <= 0) {
      html += "<i>Add up to 10 Tarot Cards...</i>";
    } else {
      for (var i = 0; i < this.team_.tarot_cards.length; ++i) {
        const unit = this.team_.tarot_cards[i];
        html +=
          `<li class='teamItem'>
            <div class="teamItemText">
              <a href="#" class="teamItemUnitLink" onclick="unitManager.showUnit('${unit.unit_id}'); return false;">
                ${unit.name} (${unit.unit_id})
              </a>`;
        if (!READ_ONLY) {
          html += `
            <a class="teamItemRemoveButton" href="#" onclick="teamManager.removeUnit('tarot_cards', ${i}); return false;">
              <i class="material-icons">cancel</i>
            </a>`;
        }
        html += "</div></li>";
      }
    }
    html += "</ul></div>";
    return html;
  }

  drawObjects_() {
    if (READ_ONLY && this.team_.objects.length <= 0) {
      return "";
    }

    var points = 0;
    for (const unit of this.team_.objects) {
      if (unit.point_value) {
        points += unit.point_value;
      }
    }

    var html = "<div class='row'><h6 class='teamSectionHeader'><div><b>Objects</b></div>";
    if (points) {
      html += `<div class="teamSectionPointTotal"><b>${points}</b></div>`;
    }
    html += "</h6>";
    if (!READ_ONLY) {
      html += `
        <div id="teamSectionObjectsButton" class="teamSectionHeaderButton" title="Search for Objects">
          <a class="btn-floating btn-small waves-effect-waves-light blue" onclick="sideNav.showSearchByTypeResults('object'); return false;">
            <i class="material-symbols-outlined" style="color:white;">cookie</i>
          </a>
        </div>`;
    }
    html += "<ul>";
    if (this.team_.objects.length <= 0) {
      html += "<i>Add up to 3 Objects...</i>";
    } else {
      for (var i = 0; i < this.team_.objects.length; ++i) {
        const unit = this.team_.objects[i];
        html +=
          `<li class='teamItem'>
            <div class="teamItemText">
              <a href="#" class="teamItemUnitLink" onclick="unitManager.showUnit('${unit.unit_id}'); return false;">
                ${unit.name} (${unit.unit_id})
              </a>`;
        if (unit.point_value) {
          html += `<div class="teamItemPoints">${unit.point_value}</div>`;
        }
        if (!READ_ONLY) {
          html += `
            <a class="teamItemRemoveButton" href="#" onclick="teamManager.removeUnit('objects', ${i}); return false;">
              <i class="material-icons">cancel</i>
            </a>`;
        }
        html += "</div></li>";
      }
    }
    html += "</ul></div>";
    return html;
  }

  addUnit(pointValue, specialPowerIndex) {
    const unit = this.unitManager_.getUnit();
    if (pointValue && !unit.point_values.includes(pointValue)) {
      throw new Error(`Error in TeamManager.addUnit '${unit.unit_id}' - does not have a point value of ${pointValue}`);
    }
    var specialPower = null;
    if (specialPowerIndex >= 0) {
      if (specialPowerIndex < unit.special_powers.length) {
        specialPower = unit.special_powers[specialPowerIndex];
      } else {
        throw new Error(`Error in TeamManager.addUnit '${unit.unit_id}' - does not have a special power at index ${specialPowerIndex}`);
      }
    }
    const team_unit = {
      'unit_id': unit.unit_id,
      'name': unit.name,
      'point_value': pointValue,
      'properties': unit.properties,
    };
    switch (unit.type) {
      case "character":
        // A point value indicates that the unit has an optional costed trait.
        if (specialPower) {
          team_unit.costed_trait = {
            'name': specialPower.name,
            'point_value': specialPower.point_value,
            'special_power_index': specialPowerIndex,
          }
        }
      // .. Fall through intended ..
      case "bystander":
        this.team_.main_force.push(team_unit);
        $('#teamMainForce').html(this.drawMainForce_());
        break;
      case "object":
        this.team_.objects.push(team_unit)
        $('#teamObjects').html(this.drawObjects_());
        break;
      case "map":
        // A point value indicates that map is added with a location bonus.
        if (specialPower) {
          team_unit.location = {
            'name': specialPower.name,
            'point_value': specialPower.point_value,
            'special_power_index': specialPowerIndex,
          }
        }
        this.team_.maps.push(team_unit)
        $('#teamMaps').html(this.drawMaps_());
        break;
      case "tarot_card":
        this.team_.tarot_cards.push(team_unit)
        $('#teamTarotCards').html(this.drawTarotCards_());
        break;
      default:
        throw new Error(`Error in TeamManager.addUnit '${unit.unit_id}' - unsupported type '${unit.type}'`);
    }
    this.updateTeam();
  }

  addUnitToSideline() {
    const unit = this.unitManager_.getUnit();
    if (!(unit.type == "character" ||
         (unit.type == "bystander" && unit.point_values.length > 0) ||
         unit.type == "equipment" ||
         unit.type == "mystery_card")) {
      throw new Error(`Error in TeamManager.addUnitToSideline '${unit.unit_id}' - unsupported type '${unit.type}'`);
    }
    const team_unit = {
      'unit_id': unit.unit_id,
      'name': unit.name,
      'properties': unit.properties,
    };
    this.team_.sideline.push(team_unit);
    $('#teamSideline').html(this.drawSideline_());
    this.updateTeam();
  }

  addEquipment(mainForceIndex) {
    const unit = this.unitManager_.getUnit();
    if (unit.type != "equipment") {
      throw new Error(`Error in TeamManager.addEquipment '${unit.unit_id}' - type '${unit.type} is not equipment`);
    }
    if (mainForceIndex >= this.team_.main_force.length) {
      throw new Error(`Error in TeamManager.addEquipment '${unit.unit_id}' - index '${mainForceIndex}' is invalid`);
    }
    const pointValue = unit.point_values.length > 0 ? unit.point_values[0] : 0;
    const equipment = {
      'unit_id': unit.unit_id,
      'name': unit.name,
      'point_value': pointValue,
    };
    this.team_.main_force[mainForceIndex].equipment = equipment;
    $('#teamMainForce').html(this.drawMainForce_());
    this.updateTeam();
  }

  updateAddUnitButton_() {
    // First, determine how many options there are. If there are more than one
    // then use a dropdown. Otherwise, have the button directly add the unit.
    var options = [];
    const unit = this.unitManager_.getUnit();
    if ((unit.type == "character" ||
         (unit.type == "bystander" && unit.point_values.length > 0) ||
         unit.type == "mystery_card")) {
      for (const pointValue of unit.point_values) {
        options.push({
          "text": `Add to Main Force (${pointValue} points)`,
          "onclick": `teamManager.addUnit(${pointValue}, -1);`
        })
        // See if there are any costed traits that should be presented as options.
        for (var i = 0; i < unit.special_powers.length; ++i) {
          const sp = unit.special_powers[i];
          if (sp.point_value) {
            options.push({
              "text": `Add to Main Force (${pointValue} points) with ${sp.name} (${sp.point_value})`,
              "onclick": `teamManager.addUnit(${pointValue}, ${i});`
            })
          }
        }
      }
      options.push({
        "text": "Add to Sideline",
        "onclick": `teamManager.addUnitToSideline();`
      })
    } else if (unit.type == "equipment") {
      for (var i = 0; i < this.team_.main_force.length; ++i) {
        const unit = this.team_.main_force[i];
        if (!unit.equipment) {
          options.push({
            "text": `Equip to ${unit.name}`,
            "onclick": `teamManager.addEquipment(${i});`
          })
        }
      }
      options.push({
        "text": "Add to Sideline",
        "onclick": `teamManager.addUnitToSideline();`
      })
    } else if (unit.type == "map") {
      options.push({
        "text": "Add to Maps",
        "onclick": `teamManager.addUnit(0, -1);`
      })
      for (var i = 0; i < unit.special_powers.length; ++i) {
        const sp = unit.special_powers[i];
        if (sp.point_value && sp.point_value > 0) {
          options.push({
            "text": `Add Location "${sp.name}" (${sp.point_value} points)`,
            "onclick": `teamManager.addUnit(0, ${i});`
          })
        }
      }
    } else {
      const UNIT_TYPE_TO_SECTION = {
        "object": "Objects",
        "tarot_card": "Tarot Cards",
      };
      const section = UNIT_TYPE_TO_SECTION[unit.type];
      if (section) {
        if (unit.point_values.length > 0) {
          for (const pointValue of unit.point_values) {
            options.push({
              "text": `Add to ${section} (${pointValue} points)`,
              "onclick": `teamManager.addUnit(${pointValue}, -1);`
            })
          }
        } else {
          options.push({
            "text": "Add to ${section}",
            "onclick": `teamManager.addUnit(0, -1);`
          })
        }
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
      }
      else {
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
      var left = $("#unitCard0").width() - 18;
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

  removeUnit(type, position) {
    switch (type) {
      case "main_force":
        this.team_.main_force.splice(position, 1);
        $('#teamMainForce').html(this.drawMainForce_());
        break;
      case "equipment":
        delete this.team_.main_force[position].equipment;
        $('#teamMainForce').html(this.drawMainForce_());
        break;
      case "sideline":
        this.team_.sideline.splice(position, 1);
        $('#teamSideline').html(this.drawSideline_());
        break;
      case "objects":
        this.team_.objects.splice(position, 1);
        $('#teamObjects').html(this.drawObjects_());
        break;
      case "maps":
        this.team_.maps.splice(position, 1);
        $('#teamMaps').html(this.drawMaps_());
        break;
      case "tarot_cards":
        this.team_.tarot_cards.splice(position, 1);
        $('#teamTarotCards').html(this.drawTarotCards_());
        break;
      default:
    }
    this.updateTeam();
  }

  updateTeam() {
    this.retryCount_ = 0;
    this.updateTeam_();
  }

  updateTeam_() {
    // Start a timer, which, when it triggers, will send the updates to the
    // server. If a timeout is already set, just wait for that timeout to
    // trigger and batch the requests together to avoid server overload.
    if (!this.teamTimeout_) {
      var teamManager = this;
      this.teamTimeout_ = setTimeout(function() {
          teamManager.teamTimeout_ = null;
          teamManager.sendServerUpdate_();
        },
        // Set the timer based on number of retries, with exponential backoff.
        MESSAGE_DELAY_MS * Math.pow(2, this.retryCount_));
    }
  }

  sendServerUpdate_() {
    var update = {};

    // For each of the fields in the team object, check if it's different
    // than the server, then add it to the update list.
    this.checkFieldUpdate_("name", update);
    this.checkFieldUpdate_("description", update);
    this.checkFieldUpdate_("point_limit", update);
    this.checkFieldUpdate_("age", update);
    this.checkFieldUpdate_("visibility", update);
    this.checkArrayFieldUpdate_("main_force", update);
    this.checkArrayFieldUpdate_("sideline", update);
    this.checkArrayFieldUpdate_("objects", update);
    this.checkArrayFieldUpdate_("maps", update);
    this.checkArrayFieldUpdate_("tarot_cards", update);

    if (!$.isEmptyObject(update)) {
      var teamManager = this;
      $.ajax({
        url: `/teams/${this.team_.team_id}/`,
        type: 'PUT',
        headers: { "X-CSRFToken": this.csrfToken_ },
        data: JSON.stringify(update),
        dataType: 'text',
        contentType: 'application/json',
        success: function(response) {
          // Update the local copy of the server team object, knowing that it
          // was successfully updated on the server.
          for (const key in update) {
            teamManager.serverTeam_[key] = update[key];
          }
          // Reset the retry count upon success.
          teamManager.retryCount_ = 0;
        },
        error: function(xhr, desc, err) {
          // The server failed to update, so keep don't update the serverTeam_,
          // but instead just try again.
          console.log(`Error updating team '${teamManager.team_.team_id}'. Update: ${JSON.stringify(update)}`);
          if (teamManager.retryCount_ < MAX_RETRIES) {
            ++teamManager.retryCount_;
            teamManager.updateTeam_()
          }
        }
      });
    }
  }

  checkFieldUpdate_(field, update) {
    if (!(this.team_[field] === this.serverTeam_[field])) {
      update[field] = this.team_[field];
    }
  }

  checkArrayFieldUpdate_(field, update) {
    // Only send an update for the field if some part of it changed.
    if (!(JSON.stringify(this.team_[field]) === JSON.stringify(this.serverTeam_[field]))) {
      var field_update = [];
      for (const unit of this.team_[field]) {
        var updated_unit = {
          "unit_id": unit.unit_id,
        };
        if (unit.point_value) {
          updated_unit.point_value = unit.point_value;
        }
        // Main force pieces can have equipment attached to them.
        if (field == "main_force") {
          if (unit.costed_trait) {
            updated_unit.costed_trait_index = unit.costed_trait.special_power_index
          }
          if (unit.equipment) {
            updated_unit.equipment_id = unit.equipment.unit_id
          }
        }
        // Map units can have locations attached to them.
        if (field == "maps" && unit.location) {
          updated_unit.location_index = unit.location.special_power_index
        }
        field_update.push(updated_unit);
      }
      update[field] = field_update;
    }
  }

  deleteTeam() {
    var proceed = confirm("Deleting a Team is a permanent action that cannot be undone. Are you really sure you want to delete this team?");
    if (!proceed) {
      return;
    }

    var teamManager = this;
    $.ajax({
      url: `/teams/${this.team_.team_id}/`,
      type: 'DELETE',
      headers: { "X-CSRFToken": this.csrfToken_ },
      success: function(response) {
        // Navigate back to the home page.
        window.location.href = "/";
      },
      error: function(xhr, desc, err) {
        alert("Failed to delete this team: " + desc + "; " + err);
      }
    });
  }
}
