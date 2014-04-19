$(document).ready(function() {
  win1 = CodeMirror.fromTextArea(document.getElementById("bot1_code"), {
    lineNumbers: true,
    mode: "text/javascript"
  });
  win2 = CodeMirror.fromTextArea(document.getElementById("bot2_code"), {
    lineNumbers: true,
    mode: "text/javascript"
  });
  var b1s = $("#bot1_select");
  var b2s = $("#bot2_select");
  b1s.change(function(event) {
    var el = $(win1.getWrapperElement());
    var category = event.target.value;
    el.toggle(category === 'custom');
  });
  b2s.change(function(event) {
    var el = $(win2.getWrapperElement());
    var category = event.target.value;
    el.toggle(category === 'custom');
  });
  var option;
  _.each(['custom'].concat(Bot.getAllBots()), function(bot) {
    option = document.createElement("option");
    option.value = bot;
    option.innerHTML = bot;
    b1s.append($(option).clone());
    b2s.append(option);
    b1s.val('CircleBot').change();
    b2s.val('DumbBot').change();
  });

  var subm = $('#start_game_btn');
  subm.click(function(event) {
    botNames = [b1s.val(), b2s.val()];
    var game = new Game(botNames, false);
    game.run(function(result) {
      console.log(result);
    });
  });
});
