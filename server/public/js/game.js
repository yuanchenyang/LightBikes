$(document).ready(function() {
  var stage = new createjs.Stage("main_canvas");

  var Hexes = [];
  Players = [];

  var p1 = null;
  var p2 = null;
  var p3 = null;
  var p4 = null;

  var player_colors = ["red", "blue", "green", "orange", "purple", "black"];
  var start_positions = [{x:0,y:0}, {x:5,y:5}, {x:10,y:10}, {x:15,y:15}, {x:16,y:16}, {x:20,y:16}];

  function Player(id, name, move_function) {
      this.x = start_positions[id].x;
      this.y = start_positions[id].y;

      this.name = name;
      this.color = player_colors[id];
      this.alive = true;
      this.get_next_move = move_function;
  }

  Player.prototype.getCurrentHex = function() {
      return Hexes[this.x][this.y];
  };

  Player.prototype.renderOnGrid = function() {

    var hex = this.getCurrentHex();

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
  };

  /* direction is an integer from 0 to 5 where 0 is moving to the hex in an
   * upper-right direction, 1 is moving to the hex above the current one, and so
   * on
   *
   * If there is a hex available in that direction for the player to move onto
   * (regardless of whether there is a Trail or another player at that hex) this
   * returns true; otherwise it returns false.
   */
  Player.prototype.move = function(direction) {
    if (!this.alive) {
      return false;
    }

    var x_cur = this.x;
    var y_cur = this.y;

    var x_new;
    var y_new;

    var even_col = x_cur % 2 === 0;

    switch (direction) {
      case 0:
        x_new = x_cur + 1;
        y_new = even_col ? y_cur - 1 : y_cur;
        break;

      case 1:
        y_new = y_cur - 1;
        x_new = x_cur;
        break;

      case 2:
        x_new = x_cur - 1;
        y_new = even_col ? y_cur - 1: y_cur;
        break;

      case 3:
        x_new = x_cur - 1;
        y_new = even_col ? y_cur: y_cur + 1;
        break;

      case 4:
        y_new = y_cur + 1;
        x_new = x_cur;
        break;

      case 5:
        x_new = x_cur + 1;
        y_new = even_col ? y_cur : y_cur + 1;
        break;

      default:
        return false;
    }

    if (Hexes[x_new] && Hexes[x_new][y_new]) {
      this.x = x_new;
      this.y = y_new;
      return true;
    }

    return false;
  };

  Player.prototype.kill = function() {
    this.alive = false;
  };

  function setAnimationInterval(interval) {

      createjs.Ticker.addEventListener('tick', function() {
          //console.log("Tick");

          stage.update();
      });

      createjs.Ticker.setInterval(interval);
  }

  /* radius passed in is the radius of the hex polygon */
  function drawGrid(radius) {

      var id = 0;
      var side_offset = 2;

      var x = side_offset;

      var h_rad = 0.5*radius;
      var hex_halfheight = Math.sqrt(radius*radius - h_rad*h_rad);

      while (x < (stage.canvas.width - 2*radius)) {

        var y = side_offset;
        var idx = Hexes.push([]) - 1;

        if (idx % 2 !== 0) {
          y += hex_halfheight;
        }

        while (y < (stage.canvas.height - 2*radius)) {
          var hex = new Hex(x + radius, y + radius, radius, 1);
          hex.id = id;
          id++;
          Hexes[idx].push(hex);
          y += 2 * hex_halfheight;
        }
        x += 1.5*radius;
      }
  }

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
  }

  Hex.prototype.changeHexColor = function(color) {
      if (!(this.radius && this.thickness)) {
          return;
      }
      var r = this.radius;
      this._hex.graphics.clear()
         .beginFill(color)
         .drawPolyStar(0, 0, r, 6, 0, 0);
  }

  function placePlayers(player_list) {
      for (var i = 0; i < player_list.length; i++) {
          var p = player_list[i];
          Players.push(new Player(p.id, p.name, p.moveFunction));
          Players[i].renderOnGrid();
      }

      stage.update();
  }

  function init() {
      setAnimationInterval(100);
      drawGrid(15);
      placePlayers([{id:0, name: "Alpha", moveFunction: function() { return 5; }}]);
  }

  init();
});
