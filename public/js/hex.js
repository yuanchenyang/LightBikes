window.Hex = function(x, y) {
  this.x = x;
  this.y = y;
  this.wall = false;
  this.player = null;
}

Hex.prototype.draw = function(stage, radius) {
  var thickness = 1;
  if (_.isUndefined(this.hex)) {
    this.hex = new createjs.Shape();
  }
  var color = 'white';
  if (this.wall) {
    color = this.player.wall_color;
  }
  this.hex.graphics
      .clear()
      .setStrokeStyle(thickness)
      .beginStroke("#000")
      .beginFill(color)
      .drawPolyStar(0, 0, radius, 6, 0, 0);

  var padding = 2;
  var h_rad = 0.5*radius;
  var hex_halfheight = Math.sqrt(radius*radius - h_rad*h_rad);
  this.hex.x = padding + radius + (this.x * radius * 1.5);
  this.hex.y = padding + hex_halfheight + (2*hex_halfheight * this.y) + (this.x % 2 == 0 ? hex_halfheight : 0);
  stage.addChild(this.hex);

  if (this.player && !this.wall) {
    this.player.circle.x = this.hex.x;    
    this.player.circle.y = this.hex.y;    
    this.player.circle.graphics.beginFill(this.player.color)
                   .drawCircle(0, 0, hex_halfheight / 2);
    stage.addChild(this.player.circle);
  }
}

Hex.prototype.setPlayer = function(p) {
  this.player = p;
}

Hex.prototype.setWall = function() {
  this.wall = true;
}

