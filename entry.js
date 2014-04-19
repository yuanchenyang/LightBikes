Bot.register("cy-bot", function(game_state, my_state, done) {
    var floodfill = function(board, curr_pos) {
        var queue = [curr_pos];
        var count = 0;
        board = board.get_copy();
        while (queue.length > 0) {
            var curr = queue.pop();
            board.hexes[curr.y][curr.x].player = true;
            var safe = board.safe_surrounding_tiles(curr);
            for (var i = 0; i < safe.length; i++) {
                queue.push(safe[i]);
                count++;
            }
        }
        return count;
    };

    var me = game_state.me;
    var board = game_state.board;
    var safe_dirs = board.safe_directions(me);
    var nums = [];
    var num_mapping = [];

    for (var i = 0; i < safe_dirs.length; i++) {
        var e = safe_dirs[i];
        var n = floodfill(board, board.new_coords_from_dir(me, e));
        nums.push(n);
        num_mapping.push([n, e]);
    }
    var max_n = _.max(nums);

    var moves = _.filter(num_mapping, function(e) {
        return e[0] == max_n;
    });

    var move = _.min(moves, function(dir) {
        return game_state.board.get_dist(game_state.board.new_coords_from_dir(me, dir[1]),
                                         game_state.them);
    });

    //var move = _.sample(moves)[1];
    done(move[1]);
})
