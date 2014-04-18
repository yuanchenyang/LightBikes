var Team = require('../models/team');
var _ = require('underscore');

module.exports = {
  register_group: function(app, prefix, tree) {
    _.each(tree, function(value, key) {
      if (_.contains(['get', 'post', 'put', 'delete'], key)) {
        console.log("Registering " + key + " -> " + prefix);
        app[key](prefix, value);
      } else {
        this.register_group(app, prefix + '/' + key, value);
      }
    }, this);
  },

  register: function(app) {
    this.register_group(app, "/api", this.api);
  },

  api: {
    teams: {
      get: list_teams,
      post: create_team,
      ":id": {
        get: list_team,
        submissions: {
          get: list_submissions,
          ":submission_id": {
            get: list_submission,
            "submission.js": {
              get: get_submission_js
            }
          }
        }
      }
    }
  }
};

function list_teams(req, res) {
  Team.findAll().success(function(teams) {
    res.json(teams);
  });
}

function list_team(req, res) {
  Team.find(req.params.id).success(function(team) {
    res.json(team);
  });
}

function create_team(req, res) {
  res.json(req.params);
}

function list_submissions(req, res) {
  Team.find(req.params.id).success(function(team) {
    team.getSubmissions().success(function(submissions) {
      res.json(submissions);
    });
  });
}

function list_submission(req, res) {
  Team.find(req.params.id).success(function(team) {
    team.getSubmissions({where: ["id = ?", req.params.submission_id]}).success(function(submissions) {
      res.json(submissions[0]);
    });
  });
}

function get_submission_js(req, res) {
  Team.find(req.params.id).success(function(team) {
    team.getSubmissions({where: ["id = ?", req.params.submission_id]}).success(function(submissions) {
      res.set({
        "Content-Type": "application/javascript"
      });
      res.send(submissions[0].source);
    });
  });
}
