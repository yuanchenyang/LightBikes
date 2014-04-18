var db = require('./db');
var models = require('./models');
var q = require('q');
var _ = require('underscore');

console.log("Loading participants...");

var participants = {};

models.Team.findAll()
.then(function(teams) {
  return q.all(_.map(teams, function(team) {
    console.log(team.name + " -> " + team.repo);
    participants[team.id] = {
      name: team.name,
      repo: team.repo
    };

    var def = q.defer();

    team.getSubmissions().success(function(submissions) {
      def.resolve(_.max(submissions, function(s) { return s.id; }));
    });

    return def.promise;
  }));
})
.then(function(submissions) {
  var def = q.defer();

  _.each(submissions, function(submission) {
    participants[submission.TeamId].submission = submission.source;
  });

  def.resolve(participants);

  return def.promise;
}).then(function(participants) {
  console.log(participants);
})
;
