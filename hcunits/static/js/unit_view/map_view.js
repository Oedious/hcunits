class MapView extends SmallUnitView {

  static isType(type) {
    return type  == "map";
  }

  constructor(unit, map) {
    super(unit);
    if (!MapView.isType(this.unit_.type)) {
      throw new Error("Mismatched unit type: MapView require type='map'");
    }
    this.map_ = new Map(map);
  }

  getTypeInfo() {
    return {
      "name": "Map"
    };
  }  

  draw() {
    super.draw();
    const html = `
      <div class='column'>
        <div class='largeCard'>
          <canvas id='mapCanvas'></canvas>
        </div>
      </div>`;
  	$('#unitCardsContainer').append(html);

    const card = $(".largeCard");
    var width = card.width();
    var height = card.height();
    const card_aspect_ratio = width / height;
    const map_aspect_ratio = this.map_.width / this.map_.height;
    if (map_aspect_ratio > card_aspect_ratio) {
      // Pin to width; reduce the height of the card.
      height = this.map_.height / this.map_.width * width
      card.height(height);
    } else {
      // Pin to height; reduce the width of the card.
      width = this.map_.width / this.map_.height * height
      card.width(width);
    }
    var canvas = $("#mapCanvas")[0];
    const sx = width / (this.map_.width * TILE_SIZE)
    const sy = height / (this.map_.height * TILE_SIZE)
    const scale = sx < sy ? sx : sy;
    var ctx = canvas.getContext("2d");
    ctx.save();
    canvas.width = Math.max(scale * this.map_.width * TILE_SIZE, 1);
    canvas.height = Math.max(scale * this.map_.height * TILE_SIZE, 1);
    ctx.scale(scale, scale);
    this.map_.draw(ctx);
    ctx.restore();
  }

  drawFooter_() {
    var html = `
      <div class='smallCardFooter'>
        <a href='https://hcmaps.net/index.html?m=${this.unit_.unit_id}' target="_blank">
          View in HCMaps.net (external)
        </a>
      </div>
    `;
    return html
  }
}