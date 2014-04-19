function Board(x_size, y_size) {
  this.hexes = [];
  var i = 0;
  while (i < x_size) {
    var j = 0;
    this.hexes.push([]);
    while (j < y_size) {
      var hex = new Hex(i, j);
      this.hexes[i].push(hex);
      j++;
    }
    i++;
  }
}
