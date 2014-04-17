$(document).ready(function() {
  var stage = new createjs.Stage("main_canvas");

  var Hexes = [];

  var p1 = null;
  var p2 = null;
  var p3 = null;
  var p4 = null;

  function Player(_x, _y) {
      this.x = _x;
      this.y = _y;

      this.name = "";
      this.color = "black";
      this.alive = true;
  }

  Player.prototype.getCurrentHex = function() {
      return Hexes[this.x][this.y];
  };

  Player.prototype.renderOnGrid = function() {

    var hex = this.getCurrentHex();

    if (this.circle) {
      this.circle.x = hex.x;
      this.circle.y = hex.y;
    } else {
      var circ_rad = hex.myprops.radius * 0.4;
      var circle = new createjs.Shape();
      circle.graphics.beginFill(this.color)
                     .drawCircle(0, 0, circ_rad);
      circle.x = hex.x;
      circle.y = hex.y;
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
          var hex = drawHex(x + radius, y + radius, radius, 1);
          hex.myprops.id = id;
          id++;
          Hexes[idx].push(hex);
          y += 2 * hex_halfheight;
        }
        x += 1.5*radius;
      }
  }

  function drawHex(x, y, radius, thickness) {

      var hex = new createjs.Shape();
      hex.graphics
          .setStrokeStyle(thickness)
          .beginStroke("#000")
          .drawPolyStar(0, 0, radius, 6, 0, 0);
      hex.x = x;
      hex.y = y;
      stage.addChild(hex);

      hex.myprops = {};
      hex.myprops.radius = radius;
      hex.myprops.thickness = thickness;

      return hex;
  }

  function changeHexColor(hex, color) {
      if (!(hex.myprops && hex.myprops.radius && hex.myprops.thickness)) {
          return;
      }
      var r = hex.myprops.radius;
      hex.graphics.clear()
         .beginFill(color)
         .drawPolyStar(0, 0, r, 6, 0, 0);

      return hex;
  }

  /* each player starts out at one corner of the board
   * and has a name so we know who they are. if there
   * are fewer than 4 players for a round, we just pass
   * in null for that player */
  function placePlayers(a, b, c, d) {

      if (a) {
          p1 = new Player(0, 0);
          p1.name = a;
          p1.color = "red";
          p1.renderOnGrid();
      }

      if (b) {
          p2 = new Player(Hexes.length-1, 0);
          p2.name = b;
          p2.color = "green";
          p2.renderOnGrid();
      }

      if (c) {
          p3 = new Player(0, Hexes[0].length-1);
          p3.name = c;
          p3.color = "blue";
          p3.renderOnGrid();
      }

      if (d) {
          p4 = new Player(Hexes.length -1, Hexes[Hexes.length-1].length-1);
          p4.name = d;
          p4.color = "orange";
          p4.renderOnGrid();
      }

      stage.update();
  }

  function init() {
      setAnimationInterval(100);
      drawGrid(15);
      placePlayers("Alpha", "Beta", "Gamma", "Delta");
  }

  init();
});
