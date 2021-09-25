const express = require('express');
const router = express.Router();
const adminControllers= require('../controllers/adminControllers');
const isAuth = require('../middleware/is-auth');
const { check, body } = require('express-validator/check');


router.get('/add-product', isAuth, adminControllers.getAddProduct);
router.post(
  "/add-product",
  [
    body(
      "title",
      "title can be maximum 20 characters long"
    ).trim().isLength({ max: 20 }),
    body(
      "description",
      "maximum 100 characters allowed for description"
    ).trim().isLength({ max: 100 }),
    body(
      "price",
      "price should be in numbers only"
    ).trim().isNumeric(),
  ],
  isAuth,
  adminControllers.postAddProduct
);
router.get('/adminProduct',isAuth, adminControllers.getAdminProducts);

router.get('/productsEdit/:productId',isAuth, adminControllers.getEditProduct);
router.post('/updateDB',[
  body(
    "title",
    "title can be maximum 20 characters long"
  ).trim().isLength({ max: 20 }),
  body(
    "description",
    "maximum 100 characters allowed for description"
  ).trim().isLength({ max: 100 }),
  body(
    "price",
    "price should be in numbers only"
  ).trim().isNumeric(),
],isAuth, adminControllers.updateDB);


router.get('/productsDelete/:productId',isAuth, adminControllers.getDeleteProduct);



module.exports=router;
