$(document).ready(function() {
  var store = new LocalStorageManager();
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
  var c1, c2, code;
  code = dummy_code;
  if (c1 = store.get('c1')) {
    code = c1;
  }
  win1.setValue(code);

  code = dummy_code;
  if (c2 = store.get('c2')) {
    code = c2;
  }
  win2.setValue(code);

  win1.on('change', _.debounce(function(editor, event) {
    store.set('c1', editor.getValue());
  }, 1000));
  win2.on('change', _.debounce(function(editor, event) {
    store.set('c2', editor.getValue());
  }, 1000));
  b1s.change(function(event) {
    var el = $(win1.getWrapperElement());
    var category = event.target.value;
    el.toggle(category === 'custom');
    if (!_.isEmpty(category)) {
      store.set('d1', category);
    }
  });
  b2s.change(function(event) {
    var el = $(win2.getWrapperElement());
    var category = event.target.value;
    el.toggle(category === 'custom');
    if (!_.isEmpty(category)) {
      store.set('d2', category);
    }
  });
  var option;
  _.each(['custom'].concat(Bot.getAllBots()), function(bot) {
    option = document.createElement("option");
    option.value = bot;
    option.innerHTML = bot;
    b1s.append($(option).clone());
    b2s.append(option);
    var d1 = 'CircleBot';
    var d2 = 'DumbBot';
    if (store.get('d1')) {
      d1 = store.get('d1');
    }
    if (store.get('d2')) {
      d2 = store.get('d2');
    }
    b1s.val(d1).change();
    b2s.val(d2).change();
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
