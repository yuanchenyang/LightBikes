var Sequelize = require('sequelize');

var Submission = Sequelize.DB.define('Submission', {
  source: Sequelize.TEXT,
  TeamId: Sequelize.BIGINT
});

module.exports = Submission;

