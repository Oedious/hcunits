class MapView extends UnitView {

  static isType(type) {
    return type  == "map";
  }

  constructor(unit, map) {
    super(unit)
    if (this.unit_.type != "map") {
      throw new Error("Mismatched unit type: MapView require type=map");
    }
    this.map_ = new Map(map);
  }
  
  draw() {
    const html = "<div class='characterCard'><canvas id='mapCanvas'></canvas></div>";
  	$('#unitCardsContainer').html(html);

    var canvas = $("#mapCanvas")[0];
    var ctx = canvas.getContext("2d");
    ctx.save();
    canvas.width = this.map_.width * TILE_SIZE;
    canvas.height = this.map_.height * TILE_SIZE;
    this.map_.draw(ctx);
    ctx.restore();
  }
}