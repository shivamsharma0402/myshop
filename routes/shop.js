const express=require('express');
const isAuth = require('../middleware/is-auth');

const controllers=require('../controllers/shopControllers')
const router= express.Router();

router.get('/',controllers.getProducts);

router.get('/products/:productId',controllers.getProduct);

router.get('/cart', isAuth, controllers.getCart);

router.get('/products/addToCart/:productId', isAuth, controllers.postCart);

router.get('/cart-delete-item/:cartItemId', isAuth, controllers.getDeleteCart);

router.post('/create-order', isAuth, controllers.postCreateOrder);

router.get('/orders', isAuth, controllers.getOrders);

router.get('/orders/:orderId', isAuth, controllers.getInvoice);



module.exports=router;
