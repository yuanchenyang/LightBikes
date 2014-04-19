function Hex(x, y) {
  this.x = x;
  this.y = y;
  this.wall = false;
  this.wall_owner = null;
  this.player = null;
}

Hex.prototype.draw = function(stage, radius) {
  var thickness = 1;
  this.hex = new createjs.Shape();
  this.hex.graphics
      .setStrokeStyle(thickness)
      .beginStroke("#000")
      .drawPolyStar(0, 0, radius, 6, 0, 0);

  var side_offset = 2;
  var x = side_offset;
  var h_rad = 0.5*radius;
  var hex_halfheight = Math.sqrt(radius*radius - h_rad*h_rad);
  this.hex.x = this.x * radius * 1.5;
  this.hex.y = (this.y % 2 == 1 ? hex_halfheight : 0) + (radius * this.y);
  stage.addChild(this.hex);
}

Hex.prototype.setWall = function(color) {
    if (!(this.radius && this.thickness)) {
        return;
    }
    var r = this.radius;
    this.hex.graphics.clear()
       .beginFill(color)
       .drawPolyStar(0, 0, r, 6, 0, 0);

    this.wall = true;
}

