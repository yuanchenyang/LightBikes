/*
 * GET home page.
 */

exports.index = function(req, res){
  res.render('index', {
    title: 'Light Bikes'
  });
};

exports.submit = function(req, res) {
  res.render('submit', {
    title: 'Light Bikes - Submit Entry'
  });
};
