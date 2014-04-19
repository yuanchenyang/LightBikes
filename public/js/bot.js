window.Bot = (function() {
  var registrants = {};

  return {
    register: function(name, callback) {
      if ((name in registrants)) {
        name = _.uniqueId(name);
      }

      registrants[name] = callback;

      return name;
    },
    getBot: function(name) {
      return registrants[name].bind({});
    },
    getAllBots: function() {
      return _.keys(registrants);
    }
  };
})();
