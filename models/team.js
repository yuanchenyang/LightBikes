var Sequelize = require('sequelize');

var Team = Sequelize.DB.define('Team', {
  name:     { type: Sequelize.STRING, unique: true},
  gh_uname: { type: Sequelize.STRING, unique: true},
  gh_repo:  Sequelize.STRING,
});

module.exports = Team;
