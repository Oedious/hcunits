const TEAM_CARD_WIDTH = 340;
const MARGIN_X = 50;
const TEAM_CARD_HEIGHT = 200;

class TeamListView {
  constructor(dataSource) {
    this.dataSource_ = dataSource
    this.teamList_ = []
    this.showNewestTeams()
    
    // Redraw the list when the window is resized.
    var view = this;
    $(window).resize(function() {
      view.draw()
    })
  }
  
  draw() {
    var element = document.getElementById("teamList")
    var rect = element.getBoundingClientRect()
    var numCols = Math.min(4, Math.max(1, Math.floor((rect.width + MARGIN_X) / (TEAM_CARD_WIDTH + MARGIN_X))))

    var html = "<div class='teamListRow'>"
    var col = 0
    for (const team of this.teamList_) {
      if (col >= numCols) {
        html += "</div><div class='teamListRow'>"
        col = 0
      }
      html += `
      <a class='teamCard' href='/teams/'>
        <div class='teamCardBorders'></div>
        <div class='teamCardHeader'>
          <div class='teamCardName'>${team.name}</div>
        </div>
        <div class='teamCardTokenCircle'></div>
        <div class='teamCardType'>${team.team_type}</div>
      </a>
      `
      ++col;
    }
    html += "</div>"
    element.innerHTML = html
  }
  
  showNewestTeams() {
    var view = this
    this.dataSource_.getNewestTeams(
      function(teamList) {
        view.teamList_ = teamList
        view.draw()
      },
      function(xhr, desc, err) {
        alert("Error in showNewestTeams(): " + desc + " err=" + err);
      })
  }

}