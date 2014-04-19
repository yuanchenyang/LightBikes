window.Game = function(player_names, simulation) {
  this.players = _.map(player_names, function(player_name, i) {
    return new Player(i, player_name);
  });
  this.board = new Board(15);
  this.sim = simulation;
  this.player_states = {};

  if (!this.sim) {
    setAnimationInterval(100);
    drawGrid(15);
  }
};

Game.prototype.run = function(callback) {
  _.each(this.players, function(p) {
    this.player_states[p.name] = {};
  }, this);
  this.rounds = 0;
  this.round(callback);
};

Game.prototype.winner = function() {
  living_players = _.reject(this.players, function(p) { return !p.alive; });
  if (living_players.length == 1) {
    return living_players[0];
  } else if (living_players <= 0) {
    return true;
  } else {
    return false;
  }
};

Game.prototype.round = function(callback) {
  var wp = this.winner();
  if (wp) {
    callback(wp);
  } else if (this.rounds > 1000) {
    callback({
      error: "TOO MANY ROUNDS"
    });
  } else {
    this.rounds++;
    this.next_turn(this.round.bind(this, callback));
  }
};

Game.prototype.setAnimationInterval = function(interval) {
  createjs.Ticker.addEventListener('tick', function() {
    //console.log("Tick");
    stage.update();
  });
  createjs.Ticker.setInterval(interval);
};

/* radius passed in is the radius of the hex polygon */
Game.prototype.drawGrid = function(radius) {
  var id = 0;
  var side_offset = 2;
  var x = side_offset;
  var h_rad = 0.5*radius;
  var hex_halfheight = Math.sqrt(radius*radius - h_rad*h_rad);

  while (x < (stage.canvas.width - 2*radius)) {
    var y = side_offset;
    var idx = this.board.hexes.push([]) - 1;

    if (idx % 2 !== 0) {
      y += hex_halfheight;
    }

    while (y < (stage.canvas.height - 2*radius)) {
      var hex = new Hex(x + radius, y + radius, radius, 1);
      hex.id = id;
      id++;
      this.board.hexes[idx].push(hex);
      y += 2 * hex_halfheight;
    }
    x += 1.5*radius;
  }
};

Game.prototype.placePlayers = function(player_list) {
  for (var i = 0; i < player_list.length; i++) {
    var p = player_list[i];
    this.players.push(new Player(p.id, p.name, p.moveFunction));
    this.players[i].renderOnGrid();
  }
  stage.update();
};

/* direction is an integer from 0 to 5 where 0 is moving to the hex in an
 * upper-right direction, 1 is moving to the hex above the current one, and so
 * on
 *
 * If there is a hex available in that direction for the player to move onto
 * (regardless of whether there is a Trail or another player at that hex) this
 * returns true; otherwise it returns false.
 */
Game.prototype.move_player = function(player, direction) {
  if (!player.alive) {
    console.log("Player " + player.name + " is dead");
    return false;
  }

  var x_cur = player.x;
  var y_cur = player.y;

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

  if (this.board.hexes[x_new] && this.board.hexes[x_new][y_new]) {

    var hex = this.board.hexes[x_new][y_new];

    if (hex.wall) {
      player.kill();
      return false;
    }

    player.walls.push([player.x, player.y]);
    player.x = x_new;
    player.y = y_new;
    return true;
  }

  return false;
};

Game.prototype.next_turn = function(done) {
  var needed_players = _.map(this.players, function(p) { return p.name; });

  var d = function(name) {
    needed_players = _.without(needed_players, name);
    if (needed_players.length === 0) {
      done();
    }
  };

  _.each(this.players, function(p) {
    p.get_next_move(this.board.get_copy(), this.player_states[p.name], _.once(function(move) {
      if (typeof move === 'undefined' || move < 0 || move > 5 || move == (p.last_move + 3) % 6) {
        console.log("Invalid move for player: " + p.name);
        next = p.last_move;
      }
      move = Math.floor(move);
      this.move_player(p, move);
      //p.renderOnGrid();
      d(p.name);
    }.bind(this)));

    // The simulation handles it's own logic for killing
    if (!this.sim)
      _.delay(d, 1000, p.name);
  }, this);
};
