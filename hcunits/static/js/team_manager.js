const MESSAGE_DELAY_MS = 500;
const MAX_RETRIES = 3;

class TeamManager {
  constructor(jsonTeam, csrfToken) {
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
    }

    // Update the UI to reflect the provided team.
    this.draw();
  }
  
  draw() {
    const html = `
      <div id="teamMainForce" class="column">
        ${this.drawMainForce_()}
      </div>
      <div id="teamSideline" class="column">
        ${this.drawSideline_()}
      </div>
      <div id="teamTarotCards" class="column">
        ${this.drawTarotCards_()}
      </div>`;
    $("#teamContainer").html(html);
  }
  
  drawMainForce_() {
    // Always show the "Main Force" label, even if it has no units.
    var html = "<h6><b>Main Force</b></h6><ul>";
    for (var i = 0; i < this.team_.main_force.length; ++i) {
      const unit = this.team_.main_force[i];
      html += "<li class='teamItem'>";
      if (!READ_ONLY) {
        html += `
          <a class="teamItemRemoveButton" href="#" onclick="teamManager.removeUnit('main_force', ${i}); return false;">
            <i class="material-icons">cancel</i>
          </a>`;
      }
      html += `
          <div class="teamItemText">
            <a href="#" class="teamItemUnitLink" onclick="unitManager.showUnit('${unit.unit_id}'); return false;">
              ${unit.name} (${unit.unit_id})
            </a>
            <div class="teamItemPoints">${unit.point_value}</div>
          </div>
        </li>`;
    }
    html += "</ul>";
    return html;
  }
  
  drawSideline_() {
    if (this.team_.sideline.length <= 0) {
      return "";
    }
    var html = "<div class='row'><h6><b>Sideline</b></h6><ul>";
    for (var i = 0; i < this.team_.sideline.length; ++i) {
      const unit = this.team_.sideline[i];
      html += "<li class='teamItem'>";
      if (!READ_ONLY) {
        html += `
          <a class="teamItemRemoveButton" href="#" onclick="teamManager.removeUnit('sideline', ${i}); return false;">
            <i class="material-icons">cancel</i>
          </a>`;
      }
      html += `
          <a href="#" class="teamItemUnitLink" onclick="unitManager.showUnit('${unit.unit_id}'); return false;">
            ${unit.name} (${unit.unit_id})
          </a>
        </li>`;
    }
    html += "</ul></div>";
    return html;
  }

  drawTarotCards_() {
    if (this.team_.tarot_cards.length <= 0) {
      return "";
    }
    var html = "<div class='row'><h6><b>Tarot Deck</b></h6><ul>";
    for (var i = 0; i < this.team_.tarot_cards.length; ++i) {
      const unit = this.team_.tarot_cards[i];
      html += "<li class='teamItem'>";
      if (!READ_ONLY) {
        html += `
          <a class="teamItemRemoveButton" href="#" onclick="teamManager.removeUnit('tarot_cards', ${i}); return false;">
            <i class="material-icons">cancel</i>
          </a>`;
      }
      html += `
          <a href="#" class="teamItemUnitLink" onclick="unitManager.showUnit('${unit.unit_id}'); return false;">
            ${unit.name} (${unit.unit_id})
          </a>
        </li>`;
    }
    html += "</ul></div>";
    return html;
  }

  addUnit(pointValue) {
    const unit = unitManager.getUnit();
    if (pointValue && !unit.point_values.includes(pointValue)) {
      throw new Error(`Error in TeamManager.addUnit '${unit.unit_id}' - does not have a point value of ${pointValue}`);
    }
    const team_unit = {
      'unit_id': unit.unit_id,
      'name': unit.name,
      'point_value': pointValue,
      'type': unit.type,
    };
    switch (unit.type) {
      case "character":
        this.team_.main_force.push(team_unit);
        $('#teamMainForce').html(this.drawMainForce_());
        break;
      case "object":
        this.team_.objects.push(team_unit)
        $('#teamObjects').html(this.drawObjects_());
        break;
      case "map":
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
    const unit = unitManager.getUnit();
    if (unit.type != "character" && unit.type != "mystery_card") {
      throw new Error(`Error in TeamManager.addUnitToSideline '${unit.unit_id}' - unsupported type '${unit.type}'`);
    }
    const team_unit = {
      'unit_id': unit.unit_id,
      'name': unit.name,
      'type': unit.type,
    };
    this.team_['sideline'].push(team_unit);
    $('#teamSideline').html(this.drawSideline_());
    this.updateTeam();
  }
  
  removeUnit(group, position) {
    switch (group) {
      case "main_force":
        this.team_.main_force.splice(position, 1);
        $('#teamMainForce').html(this.drawMainForce_());
        break;
      case "sideline":
        this.team_.sideline.splice(position, 1);
        $('#teamSideline').html(this.drawSideline_());
        break;
      case "object":
        this.team_.objects.splice(position, 1);
        $('#teamObjects').html(this.drawObjects_());
        break;
      case "map":
        this.team_.maps.splice(position, 1);
        $('#teamMaps').html(this.drawMaps_());
        break;
      case "tarot_card":
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
    this.checkArrayFieldUpdate_("sideline", update);
    this.checkArrayFieldUpdate_("objects", update);
    this.checkArrayFieldUpdate_("maps", update);
    this.checkArrayFieldUpdate_("tarot_cards", update);
    
    // Handle main_force separately, since it's a bit more complex due to
    // equipment being attached to units.
    if (!(JSON.stringify(this.team_.main_force) === JSON.stringify(this.serverTeam_.main_force))) {
      // Only send necessary fields.
      console.log("main_force=" + JSON.stringify(this.team_.main_force));
      var main_force = []
      for (const unit of this.team_.main_force) {
        var updated_unit = {
          "unit_id": unit.unit_id,
          "point_value": unit.point_value,
        };
        if (unit.equipment) {
          updated_unit.equipment = unit.equipment.unit_id;
        }
        main_force.push(updated_unit);
      }
      update["main_force"] = main_force;
    }

    console.log(`Update = ${JSON.stringify(update)}`);

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
          for (const key in update ) {
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
    if (!(JSON.stringify(this.team_[field]) === JSON.stringify(this.serverTeam_[field]))) {
      // Only send necessary fields.
      update[field] = []
      for (const unit of this.team_[field]) {
        update[field].push(unit.unit_id);
      }
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
        window.location.href = "/accounts/profile/";
      },
      error: function(xhr, desc, err) {
        alert("Failed to delete this team: " + desc + "; " + err);
  		}
    });
  }
}