const MESSAGE_DELAY_MS = 500;
const MAX_RETRIES = 3;

class TeamManager {
  constructor(jsonTeam, csrfToken) {
    this.team_ = JSON.parse(jsonTeam);
    this.serverTeam_ = JSON.parse(jsonTeam);
    this.csrfToken_ = csrfToken;
    this.teamTimeout_ = null;
    this.retryCount_ = 0;

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

    // Iterate through the fields in the team object and if it's different
    // than the server, then add it to the update list.
    for (const field in this.team_) {
      if (this.team_[field] != this.serverTeam_[field]) {
        update[field] = this.team_[field]
      }
    }

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
          console.log(`Error updating team '${teamManager.team_.team_id}'`);
          if (teamManager.retryCount_ < MAX_RETRIES) {
            ++teamManager.retryCount_;
            teamManager.updateTeam_()
          }
    		}
      });
    }
  }
}