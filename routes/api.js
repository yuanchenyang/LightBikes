var Team = require('../models/team');
var _ = require('lodash-node');
var request = require('request');

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

var ghre = /^([A-Za-z0-9-_]+)\/([A-Za-z0-9-_]+)$/;
function create_team(req, res) {
  var p = req.body;
  if (ghre.test(p.github)) {
    mat = p.github.match(ghre);

    url = "https://api.github.com/users/" + mat[1];
    headers = {
      'User-Agent': 'Cisco-Meraki-CFG/LightBikes'
    };

    console.log(url);
    request({
      url: url,
      headers: headers
    }, function(error, response, body) {
      resp = JSON.parse(body);

      if (resp.message === "Not Found") {
        res.json({
          error: "not a real github user",
          original_error: resp
        });
      } else {
        url = "https://api.github.com/repos/" + mat[1] + "/" + mat[2];
        request({
          url: url,
          headers: headers
        }, function(error, response, body) {
          resp = JSON.parse(body);
          if (resp.message === 'Not Found') {
            res.json({
              error: "not a real github repo",
              original_error: resp
            });
          } else {
            Team.create({
              name: p.group_name,
              gh_uname: mat[1],
              gh_repo: mat[2]
            }).success(function(team) {
              res.json(team);
            }).error(function(error) {
              res.json({
                error: "Group Name or Github Username already in use",
                orig: error
              });
            });
          }
        });
      }
    });
  } else {
    res.json({
      error: "bad github"
    });
  }
}
