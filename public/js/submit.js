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
    var el = $(win2.getWrapperElement());
    var category = event.target.value;
    if (category !== "custom") {
      el.addClass("not_custom_bot");
    } else {
      el.removeClass("not_custom_bot");
    }
  });
  b2s.change(function(event) {
    var el = $(win2.getWrapperElement());
    var category = event.target.value;
    if (category !== "custom") {
      el.addClass("not_custom_bot");
    } else {
      el.removeClass("not_custom_bot");
    }
  });
  var option;
  _.each(['custom'].concat(Bot.getAllBots()), function(bot) {
    option = document.createElement("option");
    option.value = bot;
    option.innerHTML = bot;
    b1s.append($(option).clone());
    b2s.append(option);
  });
});
