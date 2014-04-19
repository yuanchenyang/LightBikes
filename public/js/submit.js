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

  dummy_code = [
    "Bot.register('DummyBot', function(board_state, player_state, move) {",
    "  // Bot code, then call move!",
    "})"
  ].join("\n");

  win1.setValue(dummy_code);
  win2.setValue(dummy_code);

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
    wait = 0;
    var a,b;
    if (b1s.val() === 'custom') {
      injectJS(win1.getValue(), function(v) {
        a = v;
        tryRun();
      });
    } else {
      a = b1s.val();
    }
    if (b2s.val() === 'custom') {
      injectJS(win2.getValue(), function(v) {
        b = v;
        tryRun();
      });
    } else {
      b = b2s.val();
    }

    function injectJS(str, cb) {
      var gcb = _.uniqueId("__JS_CB");

      window[gcb] = function(n) {
        cb(n);
        delete window[gcb];
      };

      str = gcb + "(" + str + ");";
      var s = document.createElement('script');
      s.type = 'text/javascript';
      try {
        s.appendChild(document.createTextNode(str));
        document.body.appendChild(s);
      } catch (e) {
        s.text = str;
        document.body.appendChild(s);
      }
    }

    tryRun();

    function tryRun() {
      if (a && b) {
        run();
      }
    }

    function run() {
      botNames = [a, b];
      var game = new Game(botNames, false);
      game.run(function(result) {
        _.delay(function() {
          if (result[0] == 0.5) {
            alert("Tie");
          } else if (result[0] == 1) {
            alert("Red Wins");
          } else {
            alert("Blue Wins");
          }
        }, 500);
      });
    }
  });

});
