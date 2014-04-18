var Sequelize = require('sequelize');

var Submission = Sequelize.DB.define('Submission', {
  source: Sequelize.TEXT,
  teamId: Sequelize.BIGINT
});

module.exports = Submission;

