module.exports  = (req,res,next)=>{
  if(!req.session.isLoggedIn) {
    return res.redirect('/login')
  }
  console.log('authentication passed');
  next();
};