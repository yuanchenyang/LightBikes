var Sequelize = require('sequelize');

Sequelize.DB = new Sequelize('database', 'username', 'password', {
  dialect: 'sqlite',
  storage: 'db.sqlite',
  logging: false
});

require('./models');

Sequelize.DB.authenticate();
