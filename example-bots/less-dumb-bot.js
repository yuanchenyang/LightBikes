Bot.register("LessDumbBot", function(game_state, my_state, done) {
  var me = game_state.me;
  var safe_dirs = game_state.board.safe_directions(me.x, me.y);
  done(safe_dirs[Math.floor(Math.random() * safe_dirs.length)]);
});
