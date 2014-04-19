Bot.register('SpiralBot', function(game_state, player_state, move) {
  var me = game_state.me;
  var board = game_state.board;
  var moves = board.safe_directions(me);
  if (_.contains(moves, me.sharp_left())) {
    move(me.sharp_left());
  } else if (_.contains(moves, me.left())) {
    move(me.left());
  } else if(_.contains(moves, me.straight())) {
    move(me.straight());
  } else if(_.contains(moves, me.right())) {
    move(me.right());
  } else {
    move(me.sharp_right());
  }
});
