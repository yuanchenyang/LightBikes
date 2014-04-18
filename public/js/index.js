$document.ready(function() {
  var game = new Game(["bot1", "bot2"], false);
  game.start(function(results) {
    //Display results
    console.log(results);
  });
}
