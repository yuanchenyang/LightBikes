window.Board = function(x_size, y_size) {
  this.width = x_size;
  this.height = y_size;
  this.hexes = [];
  var i = 0;
  while (i < y_size) {
    var j = 0;
    this.hexes.push([]);
    while (j < x_size) {
      var hex = new Hex(j, i);
      this.hexes[i].push(hex);
      j++;
    }
    i++;
  }
};

Board.prototype.get_hex_at = function(coord) {
  var x = coord.x;
  var y = coord.y;
  if (this.hexes[y] && this.hexes[y][x]) {
    return this.hexes[y][x];
  } else {
    return null;
  }
};

Board.prototype.get_copy = function() {
  var new_board = new Board(this.width, this.height);
  _.each(this.hexes, function(row) {
    _.each(row, function(hex) {
      var new_hex = new_board.get_hex_at(hex);
      if (!_.isNull(hex.player)) {
        new_hex.player = {
          x: hex.player.x,
          y: hex.player.y,
          color: hex.player.color
        };
      } else {
        new_hex.player = null;
      }
      new_hex.wall = hex.wall;
    }, this);
  }, this);
  return new_board;
};

Board.prototype.new_coords_from_dir = function(coord, dir) {
  var x = coord.x;
  var y = coord.y;
  var even_col = x % 2 === 1;
  switch (dir) {
    case 0:
      x_new = x + 1;
      y_new = even_col ? y - 1 : y;
      break;
    case 1:
      x_new = x;
      y_new = y - 1;
      break;
    case 2:
      x_new = x - 1;
      y_new = even_col ? y - 1: y;
      break;
    case 3:
      x_new = x - 1;
      y_new = even_col ? y : y + 1;
      break;
    case 4:
      y_new = y + 1;
      x_new = x;
      break;
    case 5:
      x_new = x + 1;
      y_new = even_col ? y : y + 1;
      break;
    default:
      return null;
  }
  return {x: x_new, y: y_new};
};

Board.prototype.surrounding_tiles = function(c) {
  return _.map([0, 1, 2, 3, 4, 5], function(dir) {
    var coord = this.new_coords_from_dir(c, dir);
    return coord;
  }, this);
};

Board.prototype.safe_surrounding_tiles = function(c) {
  return _.reject(this.surrounding_tiles(c), function(coord) {
    var hex = this.get_hex_at(coord);
    return (_.isNull(hex) || !_.isNull(hex.player));
  }, this);
};

Board.prototype.safe_directions = function(c) {
  return _.reject([0, 1, 2, 3, 4, 5], function(dir) {
    var coord = this.new_coords_from_dir(c, dir);
    var hex = this.get_hex_at(coord);
    return (_.isNull(hex) || !_.isNull(hex.player));
  }, this);
};

Board.prototype.transform_coord = function(coord) {
  var new_y = coord.y + Math.floor(coord.x / 2);
  var calc_z = -(coord.x + new_y);
  return {x: coord.x, y: new_y, z: calc_z};
};

Board.prototype.get_dist = function(c1, c2) {
  var t_c1 = this.transform_coord(c1);
  var t_c2 = this.transform_coord(c2);
  return Math.max(t_c2.x - t_c1.x, t_c2.y - t_c1.y, t_c2.z - t_c1.z);
};
