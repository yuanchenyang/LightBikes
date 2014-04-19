Bot.register("FollowBot", function(game_state, my_state, done) {
  var me = game_state.me;
  var safe_dirs = game_state.board.safe_directions(me);
  var dists = _.map(safe_dirs, function(dir) {
    return game_state.board.get_dist(game_state.board.new_coords_from_dir(me, dir), game_state.them);
  });
  done(safe_dirs[dists.indexOf(Math.min.apply(null, dists))]);
});
