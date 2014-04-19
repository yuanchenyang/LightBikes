Bot.register('AvoidBot', function(game_state, player_state, move) {
  move(game_state.board.safe_directions(game_state.me)[0]);
});
