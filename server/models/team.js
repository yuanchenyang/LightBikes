var Sequelize = require('sequelize');

var Team = Sequelize.DB.define('Team', {
  name: Sequelize.STRING,
  repo: Sequelize.STRING,
});

module.exports = Team;
