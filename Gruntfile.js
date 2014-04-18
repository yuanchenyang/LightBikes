module.exports = function(grunt) {
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
  });

  grunt.task.registerTask('init-db', "Initializes the database", function() {
    console.log('--- Creating Database');
    var done = this.async();
    var db = require('./db');
    require('sequelize').DB
      .sync({force: true})
      .complete(function() {
        done();
        console.log('--- Done');
      });
  });
};
