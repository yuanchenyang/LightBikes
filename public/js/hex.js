window.Hex = function(x, y) {
  this.x = x;
  this.y = y;
  this.wall = false;
  this.crash_site = false;
  this.player = null;
  this.hex = new createjs.Shape();
  this.text = new createjs.Text(this.to_string(), "8px Arial", "black");
}

Hex.prototype.transform = function() {
  var new_y = this.y + Math.floor(this.x / 2.0);
  var calc_z = -(-this.x + new_y);
  return {x: -this.x, y: new_y, z: calc_z};
};

Hex.prototype.to_string = function() {
  var trans = this.transform();
  return "  " + String(this.x) + ", " + String(this.y) + '\n' +
    trans.x + ',' + trans.y + ',' + trans.z;
};

Hex.prototype.draw = function(stage, radius) {
  var thickness = 1;
  var color = 'white';
  if (this.wall) {
    color = this.player.wall_color;
  }
  if (this.crash_site) {
    color = "orange";
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

  if (this.player && !this.wall && !this.crash_site) {
    this.player.circle.x = this.hex.x;    
    this.player.circle.y = this.hex.y;    
    this.player.circle.graphics.beginFill(this.player.color)
                   .drawCircle(0, 0, hex_halfheight / 2);
    stage.addChild(this.player.circle);
  }
  this.text.x = this.hex.x - (0.7 * radius);
  this.text.y = this.hex.y - (radius * .6);
  this.textAlign = "center";
  stage.addChild(this.text);
}

Hex.prototype.setPlayer = function(p) {
  this.player = p;
}

Hex.prototype.setWall = function() {
  this.wall = true;
}

