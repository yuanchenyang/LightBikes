window.Board = function(size) {
  this.hexes = [];
};

Board.prototype.get_copy = function() {
  return new Board();
};
