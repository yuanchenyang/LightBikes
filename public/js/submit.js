$(document).ready(function() {
  CodeMirror.fromTextArea(document.getElementById("bot1_code"), {
    lineNumbers: true,
    mode: "text/javascript"
  });
  CodeMirror.fromTextArea(document.getElementById("bot2_code"), {
    lineNumbers: true,
    mode: "text/javascript"
  });
});
