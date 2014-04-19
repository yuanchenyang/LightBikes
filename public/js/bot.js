window.Bot = (function() {
  var registrants = {};

  return {
    register: function(name, callback) {
      registrants[name] = callback;
    },
    getBot: function(name) {
      return registrants[name];
    },
    getAllBots: function() {
      return _.keys(registrants);
    }
  };
})();
