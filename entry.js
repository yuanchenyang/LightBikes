Bot.register("cy-bot", function(game_state, my_state, done) {
    var floodfill = function(board, curr_pos) {
        var queue = [curr_pos];
        var count = 0;
        board = board.get_copy();
        console.log(curr_pos);
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
    var move = _.max(safe_dirs, function(e) {
        return floodfill(board, board.new_coords_from_dir(me, e));
    });
    done(move);
})
