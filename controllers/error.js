exports.get404 = (req, res, next) => {
  res.render('error404',{ pageTitle: 'errorPage', 
  isAuthenticated: req.session.isLoggedIn,
});
};

exports.get500 = (req, res, next) => {
  res.render('error500',{ pageTitle: 'errorPage', 
  isAuthenticated: req.session.isLoggedIn,
});
};