function Hex(x, y, radius, thickness) {

    var hex = new createjs.Shape();
    hex.graphics
        .setStrokeStyle(thickness)
        .beginStroke("#000")
        .drawPolyStar(0, 0, radius, 6, 0, 0);
    hex.x = x;
    hex.y = y;
    stage.addChild(hex);

    this._hex = hex;
    this.radius = radius;
    this.thickness = thickness;

    this.wall = false;
}

Hex.prototype.setWall = function(color) {
    if (!(this.radius && this.thickness)) {
        return;
    }
    var r = this.radius;
    this._hex.graphics.clear()
       .beginFill(color)
       .drawPolyStar(0, 0, r, 6, 0, 0);

    this.wall = true;
}

