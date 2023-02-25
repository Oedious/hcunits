class TeamListManager {
  constructor(jsonUserTeamList, jsonRecentTeamList) {
    this.userTeamList_ = []
    if (jsonUserTeamList && jsonUserTeamList.length > 0) {
      this.userTeamList_ = JSON.parse(jsonUserTeamList);
    }
    this.recentTeamList_ = [];
    if (jsonRecentTeamList && jsonRecentTeamList.length > 0) {
      this.recentTeamList_ = JSON.parse(jsonRecentTeamList);
    }
    this.draw();
  }
  
  draw() {
    var userTeamListHtml = this.drawTeamList(this.userTeamList_, true);
    if (userTeamListHtml) {
      $('#userTeamList').html(userTeamListHtml);
    }

    var recentTeamListHtml = this.drawTeamList(this.recentTeamList_, false);
    if (recentTeamListHtml) {
      $('#recentTeamList').html(recentTeamListHtml);
    }

    // Convert the title color to black so it has better contrast.
    if (userTeamListHtml && recentTeamListHtml) {
      $('#teamListHeaderRecent').css("color", "black")
    }
  }
  
  drawTeamList(teamList, isOwner) {
    if (teamList.length <= 0) {
      return null;
    }
    var html = "";
    if (isOwner) {
      html += `
        <div id="teamListHeaderUser" class="teamListHeader">
          <h5 class="center-align">MY TEAMS</h5>`;
    } else {
      html += `
        <div id="teamListHeaderRecent" class="teamListHeader">
          <h5 class="center-align">NEWEST TEAMS</h5>`;
    }
    html += `
        </div>
        <div class="teamList">`;
    for (const team of teamList) {
      var name = team.name;
      if (!name || name == "") {
        name = "&lt;Unnamed Team&gt;";
      }
      switch (team.age) {
        case "modern":
          var age = "Modern";
          break;
        case "golden":
        default:
          var age = "Golden";
          break;
      }
      
      var descriptionHtml = "";
      if (team.description) {
        descriptionHtml = `
          <div class='teamCardDescriptionContainer'>
            <img class='teamCardDescriptionIcon' src='/static/images/sp/trait.png' alt=''>
            <div class='teamCardDescription'>${team.description}</div>
          </div>
          `;
      }
      var imgUrl = team.img_url;
      if (!imgUrl) {
        imgUrl = "/static/images/misc/unknown.png";
      }
      html += `
        <div class='teamContainer'>
          <a class='teamCard' href='/teams/${team.team_id}'>
            <div class='teamCardBorders'></div>
            <div class='teamCardHeader'>
              <div class='teamCardName'>${name}</div>
            </div>
            <div class='teamCardToken'>
              <img class='teamCardTokenImg' src='${imgUrl}' alt='' onerror="this.style.display='none'">
            </div>
            ${descriptionHtml}
            <div class='teamCardFormat'>${team.point_limit} - ${age}</div>
          </a>`;
      if (isOwner) {
        html += `
          <div class='ownerContainer'>
            <div>Last Updated ${team.displayable_update_time}</div>
          </div>`;
      } else {
        html += `
          <a class='ownerContainer' href='/users/${team.owner}'>
            <div>${team.owner}</div>
            <div>Last Updated ${team.displayable_update_time}</div>
          </a>`;
      }
      html += "</div>";
    }
    html += "</div>"
    return html;
  }
}