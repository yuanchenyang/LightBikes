window.Player = function(id, name) {
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

    this.circle = new createjs.Shape();
}

Player.prototype.kill = function() {
  this.alive = false;
};
