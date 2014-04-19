$(document).ready(function() {
  var game = new Game(["CircleBot", "DumbBot"], false);
  game.run(function(results) {
    //Display results
    console.log(results);
  });
});
