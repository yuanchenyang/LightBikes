Bot.register("CircleBot", function(game_state, my_state, move) {
  my_state.direction = ((my_state.direction || 0) + 1) % 6;
  move(my_state.direction);
});
