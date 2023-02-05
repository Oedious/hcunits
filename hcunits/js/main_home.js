//const HOST_NAME = "https://api.hcunits.net"
//var dataSource = new DataSource(HOST_NAME);
var dataSource = new MockDataSource();

var teamListView = new TeamListView(dataSource)

drawSiteHeader("")