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

Board.prototype.get_hex_at = function(x, y) {
  if (this.hexes[y] && this.hexes[y][x]) {
    return this.hexes[y][x];
  } else {
    return null;
  }
};

Board.prototype.get_copy = function() {
  return new Board();
};
