const fs=require('fs');
const path=require('path');

const Product = require("../models/product");
const Order = require("../models/order");

const PDFDoucment=require('pdfkit');



exports.getProduct=(req,res,next)=>{

  const prodId = req.params.productId;
  Product.findById(prodId)
  .then(products=>{
    res.render('shop/product-detail', { 
      pageTitle: 'Shop Products',
        prods: new Array(products), 
        docTitle: 'shop',
        path:'/products',
        isAuthenticated: req.session.isLoggedIn,
    });
    }).catch(err=>{
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(err);
  });
};

exports.getProducts=(req,res,next)=>{
  
  Product.find()
  .then(products=>{
    res.render('shop', { 
      pageTitle: 'Shop Products',
        prods: products, 
        docTitle: 'shop',
        path:'/products',
        isAuthenticated: req.session.isLoggedIn,
    });
    }).catch(err=>{
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(err);
  });
};

exports.getCart = (req, res, next) => {
  req.user
    .populate('cart.items.ProductId')
    // .execPopulate()
    .then(user => {
      const products = user.cart.items;
      res.render('shop/cart', {
        pageTitle: 'Cart Products',
        path: '/cart',
        pageTitle: 'Your Cart',
        products: products,
        isAuthenticated: req.session.isLoggedIn,
      });
    })
    .catch(err =>{
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(err);
    });
};

exports.getDeleteCart=(req,res,next)=>{
  const prodId = req.params.cartItemId;
  req.user.deleteFromCart(prodId)
  .then(product=>{
    res.redirect('/cart');
    });
};

exports.postCreateOrder=(req,res,next)=>{
  req.user
    .populate('cart.items.ProductId')
    // .execPopulate()
    .then(user => {
      console.log('user here*****=>',user);
      const products = user.cart.items.map(i=>{
        return {product:{ ...i.ProductId._doc}, quantity: i.quantity};
      });
      const order=new Order({
        products: products,
        user: { userId: user._id}
      });
      return order.save();
    })
    .then(result=>{
      return req.user.clearCart();
    })
    .then(()=>res.redirect('/orders'));
};

exports.getOrders = (req,res,next)=>{
  Order.find({"user.userId":req.user._id})
  .then(orders=>{
    res.render('shop/orders',{
      pageTitle: 'Orders',
      path:'/orders',
      orders: orders,
      pageTitle:'Your Orders',
      isAuthenticated: req.session.isLoggedIn,
    })
  }).catch(err=>{
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(err);
  });
};

exports.postCart=(req,res,next)=>{
  const prodId = req.params.productId;
  Product.findById(prodId)
  .then(product=>{
    return req.user.addToCart(product);
    })
    .then(result=>{
      res.redirect('/cart');
    });
};

exports.getInvoice=(req,res,next)=>{
  const orderId=req.params.orderId;
  Order.findById(orderId).then(order=>{
    if(!order){
      return next(new Error('No order found.'));
    }
    if(order.user.userId.toString() !== req.user._id.toString()){
      return next(new Error('Unauthorized'));
    }
    const invoiceName='invoice-'+orderId.trim()+'.pdf';
    const invoicePath=path.join('data','invoices',invoiceName);
    const PDFDoc=new PDFDoucment();
    res.setHeader('Content-Type','application/pdf');
    res.setHeader('Content-Disposition','inline; filename="' + invoiceName + '"');
    PDFDoc.pipe(fs.createWriteStream(invoicePath));
    PDFDoc.pipe(res);
    PDFDoc.fontSize(26).text('Invoice',{
      underline: true
    });
    PDFDoc.text('----------------------------');
    let totalPrice=0;
    order.products.forEach(prod=>{
      totalPrice+= prod.quantity * prod.product.price;
    PDFDoc.fontSize(16).text(
      prod.product.title+' - '+prod.quantity+' X '
      + prod.product.price
    )
  });
  PDFDoc.text('------------');

    PDFDoc.fontSize(20).text('Total Price (Rs) - ' + totalPrice);
    PDFDoc.end();
    // fs.readFile(invoicePath,(err,data)=>{
    //   if(err){
    //     return next(err);
    //   }
    //   res.setHeader('Content-Type','application/pdf');
    //   res.setHeader('Content-Disposition','inline; filename="' + invoiceName + '"');
    //   res.send(data);
    // });
    // const file=fs.createReadStream(invoicePath);
    
    // file.pipe(res);
  
  }).catch(err=> next(err));

};

