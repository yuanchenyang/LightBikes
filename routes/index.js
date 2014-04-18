/*
 * GET home page.
 */

exports.index = function(req, res){
  res.render('index', {
    title: ''
  });
};

exports.submit = function(req, res) {
  res.render('register', {
    title: 'Submit Entry'
  });
};
