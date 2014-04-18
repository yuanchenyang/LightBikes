function Player(id, name) {
    var player_colors = ["darkred", "blue"];
    var wall_colors = ["red", "lightblue"];
    var start_positions = [{x:0,y:0}, {x:5,y:5}];
    var initial_directions = [0, 3];

    this.x = start_positions[id].x;
    this.y = start_positions[id].y;

    this.name = name;
    this.color = player_colors[id];
    this.alive = true;
    this.walls = [];
    this.wall_color = wall_colors[id];
    this.last_move = initial_directions[id];
    this.get_next_move = Bot.getBot(name);
}

Player.prototype.renderOnGrid = function(grid) {
  var self = this;
  var hex = grid.hexes[this.x][this.y];

  if (this.circle) {
    this.circle.x = hex._hex.x;
    this.circle.y = hex._hex.y;
  } else {
    var circ_rad = hex.radius * 0.4;
    var circle = new createjs.Shape();
    circle.graphics.beginFill(this.color)
                   .drawCircle(0, 0, circ_rad);
    circle.x = hex._hex.x;
    circle.y = hex._hex.y;
    this.circle = circle;
    stage.addChild(this.circle);
  }
  _.each(this.walls, function(wall) {
    var hexAtWall = grid.hexes[wall[0]][wall[1]];
    hexAtWall.setWall(self.wall_color);
  });
};

Player.prototype.kill = function() {
  this.getCurrentHex().setWall("black");
  this.alive = false;
};
