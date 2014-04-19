window.Player = function(id, name) {
    var player_colors = ["darkred", "blue"];
    var wall_colors = ["red", "lightblue"];
    var start_positions = [{x:10,y:7}, {x:19,y:7}];
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
    this.id = _.uniqueId(name);

    this.kill = function() {
      this.alive = false;
    };

    this.hash_state = function() {
      return _.extend({
        walls: _.cloneDeep(this.walls),
        last_move: this.last_move,
        x: this.x,
        y: this.y,
        color: this.color
      }, Player.prototype);
    };
};

Player.prototype = {
  straight: function() {
    return this.last_move;
  },

  left: function() {
    return (this.last_move + 1) % 6;
  },

  sharp_left: function() {
    return (this.last_move + 2) % 6;
  },

  right: function() {
    return (this.last_move + 5) % 6;
  },

  sharp_right: function() {
    return (this.last_move + 4) % 6;
  },
};

