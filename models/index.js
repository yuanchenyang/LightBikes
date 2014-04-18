var m = module.exports = {
  Team: require('./team'),
  Submission: require('./submission')
};

m.Team.hasMany(m.Submission, {as: "Submissions"});
m.Submission.belongsTo(m.Team);
