window.Game = function(player_names, simulation) {
  this.board = new Board(52, 25);
  this.sim = simulation;
  this.players = _.map(player_names, function(player_name, i) {
    var player = new Player(i, player_name);
    this.board.get_hex_at(player.x, player.y).setPlayer(player);
    if (!this.sim) {
      player.circle = new createjs.Shape();
    }
    return player;
  }, this);
  this.player_states = {};
  _.each(this.players, function(p, i) {
    this.player_states[i] = {};
  }, this);

  if (!this.sim) {
    this.stage = new createjs.Stage("main_canvas");
    this.setAnimationInterval(100);
  }
};

Game.prototype.run = function(callback) {
  this.rounds = 0;
  this.round(callback);
};

Game.prototype.winner = function() {
  a = _.map(this.players, function(p) { return p.alive; });
  if (a[0] && a[1]) {
    return false;
  } else if (a[0]) {
    return [1, 0];
  } else if (a[1]) {
    return [0, 1];
  } else {
    return [0.5, 0.5];
  }
};

Game.prototype.round = function(callback) {
  var wp = this.winner();
  if (wp) {
    callback(wp);
  } else {
    this.rounds++;
    if (!this.sim) {
      _.delay(function() {
        this.next_turn(this.round.bind(this, callback));
      }.bind(this), 500);
    } else {
      this.next_turn(this.round.bind(this, callback));
    }
  }
};

Game.prototype.render = function() {
  var width_radius = (this.stage.canvas.width - 4) / (1.5 * this.board.width);
  var height_radius = (this.stage.canvas.height - 4) / ((this.board.height + 0.5) * Math.sqrt(3));
  var radius = Math.min(width_radius, height_radius);

  _.each(this.board.hexes, function(row) {
    _.each(row, function(hex) {
      hex.draw(this.stage, radius);
    }, this);
  }, this);
  this.stage.update();
};

Game.prototype.setAnimationInterval = function(interval) {
  createjs.Ticker.addEventListener('tick', function() {
    this.render();
  }.bind(this));
  createjs.Ticker.setInterval(interval);
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
Game.prototype.move_player = function(player, dir) {
  if (!player.alive) {
    console.log("Player " + player.id + " is dead");
    return false;
  }
  var coord = this.board.new_coords_from_dir(player.x, player.y, dir);
  if (_.isNull(coord)) return false;

  var hex = this.board.get_hex_at(coord.x, coord.y);
  if (_.isNull(hex) || !_.isNull(hex.player)) {
    player.kill();
  } else {
    hex.player = player;
  }
  player.walls.push([player.x, player.y]);
  this.board.get_hex_at(player.x, player.y).wall = true;
  player.x = coord.x;
  player.y = coord.y;
  return true;
};

Game.prototype.next_turn = function(done) {
  var needed_players = _.map(this.players, function(p) { return p.id; });
  var odone = _.once(done);

  var d = function(id) {
    needed_players = _.without(needed_players, id);
    if (needed_players.length === 0) {
      odone();
    }
  };

  _.each(this.players, function(p, i) {
    p.get_next_move(this.hash_state(p), this.player_states[i], _.once(function(move) {
      if (typeof move === 'undefined' || move < 0 || move > 5 || move == (p.last_move + 3) % 6) {
        next = p.last_move;
      }
      move = Math.floor(move);
      this.move_player(p, move);
      d(p.id);
    }.bind(this)));

    // The simulation handles it's own logic for killing
    if (!this.sim)
      _.delay(d, 1000, p.id);
  }, this);
};

Game.prototype.hash_state = function(player) {
  var new_board = this.board.get_copy();
  var me = player.hash_state();
  var them = _.reject(this.players, function(p) {
    return player.name == p.name;
  })[0].hash_state();
  return { board: new_board, me: me, them: them};
};
