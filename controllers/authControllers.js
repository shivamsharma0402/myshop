const User = require("../models/user");
const bcrypt=require("bcryptjs");
const crypto=require("crypto");
const { validationResult } = require('express-validator/check');



const nodeMailer=require('nodemailer');
const sendgridTransport = require('nodemailer-sendgrid-transport');
const { SchemaTypeOptions } = require("mongoose");
const user = require("../models/user");
const { error } = require("console");

const transporter = nodeMailer.createTransport(sendgridTransport({
  auth: {
    api_key:'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'
  }
}));

exports.getLogin = (req,res,next)=>{
  let message = req.flash('error');
  if(message.length<=0)
    message=null;
  res.render('auth/login',{
    pageTitle: 'Login Page',
    path: '/login',
    isAuthenticated: req.session.isLoggedIn,
    errorMessage: message
  });
};

exports.postLogin = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  console.log('email=>',email);
  if(email==='shivam.sharma9515@gmail.com')
  console.log('password=>',password);

  User.findOne({ Email: email })
  .then((user) => {
    if (!user) {
      req.flash('error','Invalid Email or Passsword...');
      return res.redirect("/login");
    }
    console.log('user found for email');
    bcrypt
    .compare(password, user.password)
    .then((matched) => {
      if (matched) {
        console.log('password matched with db');
        req.session.isLoggedIn = true;
        req.session.user = user;
        return req.session.save((err) => {
          console.log('session started');
          console.log(err);
          res.redirect("/");
        });
      }
      req.flash('error','Invalid Email or Passsword.');
      res.redirect("/login");
    });
  });
};

exports.getSignUp = (req,res,next)=>{
  let message = req.flash('error');
  if(message.length<=0)
    message=null;
  res.render('auth/signup',{
    pageTitle: 'SignUp Page',
    path: '/signup',
    isAuthenticated: req.session.isLoggedIn,
    errorMessage:message,
    oldDetails: {email: '', password: '', confirmPassword: '' },
    validationErrors: []
  });
};

exports.postSignUp = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;

  console.log('email signup=>',email);
  console.log('password signup=>',password);

  const confirmPassword = req.body.confirmPassword;
  const errors = validationResult(req);
  if(!errors.isEmpty()){
  console.log(errors.array());
  // console.log(errors.array()[0].msg);
    return res.status(422).render('auth/signup',{
      pageTitle: 'SignUp Page',
      path: '/signup',
      isAuthenticated: req.session.isLoggedIn,
      errorMessage:errors.array()[0].msg,
      oldDetails: {email: email, password: password, confirmPassword: confirmPassword },
      validationErrors: errors.array(),
    });
    }

      bcrypt
      .hash(password, 12)
      .then((encryptedPassword) => {
        console.log('password hashed');
        const user = new User({
          Email: email,
          password: encryptedPassword,
          cart: { items: [] },
        });
        
        return user.save();
    })
    .then(() => {
      console.log('user stored in db');
      console.log('Sign Up Success');
      req.flash('error','Sign Up Successful!');
      res.redirect("/login");
      return transporter.sendMail({
        to: email,
        from: 'er.shivam.webdev@gmail.com',
        subject: 'Signup Succeeded!',
        html: '<h2>You Successfully Signed Up!'
      });
    });
};

exports.postLogout = (req,res,next)=>{
  req.session.destroy(err=>{
    console.log('session deleted in db');
    console.log(err);
    res.redirect('/');
  });
};

exports.getResetPassword = (req,res,next)=>{
  let message = req.flash('error');
  if(message.length<=0)
    message=null;
  res.render('auth/reset',{
    pageTitle: 'Reset Password Page',
    path: '/resetPassword',
    isAuthenticated: req.session.isLoggedIn,
    errorMessage:message,
  });
};

exports.getResetYourPassword = (req,res,next)=>{
  const token = req.params.token;
  console.log('token here=>',token);

  let message = req.flash('error');
  if(message.length<=0)
    message=null;
  User.findOne({resetToken: token, resetTokenExpiry: { $gt: Date.now()}})
  .then(user=>{
    console.log('user here=>',user);
    const email = user.Email;
    res.render('auth/resetyourpassword',{
      pageTitle: 'Reset Your Password Page',
      path: '/resetyourpassword',
      userId: user._id.toString(),
      email: email,
      passwordToken: token,
      validationErrors: [],
      isAuthenticated: req.session.isLoggedIn,
      errorMessage:message,
  })
  });
};

exports.postResetPassword = (req, res, next) => {
  const email = req.body.email;
  crypto.randomBytes(32, (err, buffer)=>{
    if(err){
      console.log(err);
      return res.redirect('/resetPassword'); 
    }
    console.log('token generated');
    const token = buffer.toString('hex');
    console.log(token);
    const resetLink = `http://localhost:3000/reset/${token}`;

    User.findOne({ Email: email })
      .then((user) => {
        if (!user) {
          req.flash('error','No Account exist with this Email');
          return res.redirect("/resetPassword");
        }
        console.log('user found with mail');
        user.resetToken = token;
        console.log(token);
        
        user.resetTokenExpiry = Date.now() + 3600000;
        return user.save();
        }).then(()=>{
          console.log('password updated in db');
          req.flash('error','password reset link sent to your mail');

          res.redirect('/login');
          return transporter.sendMail({
          to: email,
          from: 'er.shivam.webdev@gmail.com',
          subject: 'Your Password Reset Link',
          html: `<h2>Password Reset Link: </h2>
          <a href="${resetLink}">${resetLink}
          </a>`,
        }).then(result=>{
          console.log('password reset mail sent');
        });
      }).catch(err=>{
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(err);
      });
  });  
};

exports.postResetYourPassword = (req, res, next) => {
  const userId = req.body.userId;
  const passwordToken = req.body.passwordToken;
  const password = req.body.password;
  let resetUser;
  
  User.findOne({resetToken: passwordToken, resetTokenExpiry: {$gt: Date.now()},_id: userId} )
    .then(user => {
      const errors = validationResult(req);
      if(!errors.isEmpty()){
      console.log(errors.array());
      // console.log(errors.array()[0].msg);
      return res.status(422).render('auth/resetyourpassword',{
      pageTitle: 'reset your password Page',
      path: '/reset',
      email: user.Email,
      isAuthenticated: req.session.isLoggedIn,
      errorMessage:errors.array()[0].msg,
      validationErrors: errors.array(),
      userId: user._id.toString(),
      passwordToken: passwordToken,
      });
      }
      resetUser= user;
      email = user.Email;
      console.log('user found!');
      return bcrypt.hash(password, 12)
      .then((encryptedPassword) => {
        console.log('password hashed!');
        resetUser.password=encryptedPassword;
        resetUser.resetToken=undefined;
        resetUser.resetTokenExpiry=undefined;
        return resetUser.save();
      }).then(()=>{
        transporter.sendMail({
          to: email,
          from: 'er.shivam.webdev@gmail.com',
          subject: 'Password Reset Success',
          html: `<h2>Password Reset Successfully! </h2>`
        }).then(()=>console.log('Reset Confirmation Mail Sent!'));
        req.flash('error','Password Reset Successfully!');
        return  res.redirect("/login").then(()=>console.log('redirected'));
      })
    }).catch(err=>{
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(err);
    });
};
    
