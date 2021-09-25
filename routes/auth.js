const express = require('express');
const router = express.Router();
const authControllers= require('../controllers/authControllers');
const { check, body } = require('express-validator/check');
const User = require('../models/user')
router.get('/login',authControllers.getLogin);

router.post('/login',authControllers.postLogin);

router.post('/logout',authControllers.postLogout);

router.get('/signup',authControllers.getSignUp);

router.post('/signup', 
[ check('email')
.isEmail()
.withMessage('Please enter a valid email')
.custom((value, {req})=>{
  // if(value === 'test@test.com')
  //   throw new Error('this email value is forbidden');
  // return true;
  return User.findOne({ Email: value })
    .then((DocUser) => {
      if (DocUser) {
        return Promise.reject('Email already exist, try with a new one');
      }
      console.log('checked for existing user');
 });
}), 
body('password','Password length should be atleast 5 characters and use numbers only')
.isLength({min:5})
.isAlphanumeric(),

body('confirmPassword').custom((value, {req})=>{
  if(value!==req.body.password)
    throw new Error('Confirm password should be same as password');
  return true;
}) ],
authControllers.postSignUp);

router.get('/resetPassword',authControllers.getResetPassword);

router.post('/resetPassword',authControllers.postResetPassword);

router.get('/reset/:token',authControllers.getResetYourPassword);

router.post('/reset/',[body('password','Password length should be atleast 5 characters and use numbers only')
.isLength({min:5})
.isAlphanumeric(),

body('confirmPassword').custom((value, {req})=>{
  if(value!==req.body.password)
    throw new Error('Confirm password should be same as password');
  return true;
}) ],authControllers.postResetYourPassword);


module.exports=router;