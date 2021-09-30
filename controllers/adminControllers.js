const { rawListeners } = require("../models/product");
const Product = require("../models/product");
const { validationResult } = require('express-validator/check');
const fileHelper = require("../util/file");

exports.getEditProduct = (req,res,next)=>{
  
  const prodId = req.params.productId;
  Product.findById(prodId)
  .then(product=>{
    res.render('admin/editProduct', { 
      pageTitle: 'Edit Product',
      editing: true,
      prod: product, 
      docTitle: 'shop',
      path:'/products',
      isAuthenticated: req.session.isLoggedIn,
      activeAddProduct: true,
      errorMessage:[],
      oldDetails: {title: product.title, price: product.price, description: product.description, },
      validationErrors: [],
    });
  }).catch(err=>{
    const error = new Error(err);
    console.log(err);
    error.httpStatusCode = 500;
    return next(err);
  });
};

exports.getAdminProducts=(req,res,next)=>{
  
  Product.find({UserId: req.user._id})
  .then(products=>{
    res.render('admin/adminProduct', { 
      pageTitle: 'Admin Products',
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

exports.updateDB= (req,res,next)=>{
  const updatedtitle= req.body.title;
  const image= req.file;
  const updatedPrice= req.body.price;
  const updatedDescription=req.body.description;
  const updatedDateOfAdding = new Date();
  const prodId = req.body.productId;
  console.log('prodId=====>', prodId);

  const errors = validationResult(req);
  if(!errors.isEmpty()){
    console.log(errors.array());  
// console.log(errors.array()[0].msg);
  return res.status(422).render('admin/editProduct',{
    pageTitle: 'Update Products',
    editing: true,
    pageTitle: 'SHOP',
    path: '/products', 
    prod: prodId,
    isAuthenticated: req.session.isLoggedIn,
    activeAddProduct: true,
    errorMessage:errors.array(),
    oldDetails: {title: updatedtitle, price: updatedPrice, description: updatedDescription, },
    validationErrors: errors.array(),
  });
}

Product.findOne({_id: prodId, UserId: req.user._id})
.then(product=>{
    if(product.UserId.toString() !== req.user._id.toString())
      return res.redirect('/');
    console.log('it works');
    product.title = updatedtitle;
    if(image){
      fileHelper.deleteFile(product.imageURL);
      product.imageURL = image.path;
    }
    product.price = updatedPrice;
    product.description = updatedDescription;
    product.Date = updatedDateOfAdding;
    return product.save()
})
  .then((result) => {
    console.log("Product Updated Successfully!!!");
    res.redirect('/admin/adminProduct');
  })
  .catch( err => {
    const error = new Error(err);
      error.httpStatusCode = 500;
      return next(err);
  });

};

exports.getDeleteProduct = (req,res,next)=>{

  prodId = req.params.productId;
  Product.findById(prodId).then(product=>{
    if(!product)
      return next(new Error('Product not found.'));
    console.log(product.imageURL);
    fileHelper.deleteFile(product.imageURL);
    return Product.deleteOne({_id: prodId, UserId: req.user._id})

  })
  .then(result=>{
    console.log('Product Removed Successfully!!!');
    res.redirect('/admin/adminProduct');
  }).catch(err=>{
    const error = new Error(err);
      error.httpStatusCode = 500;
      return next(err);
  });
};
  
exports.getAddProduct = (req,res,next)=>{

  res.render('admin/editProduct', {
    pageTitle: 'Add Product',
    path: '/admin/editProduct',
    editing: false,
    isAuthenticated: req.session.isLoggedIn,
    errorMessage: [],
    oldDetails: {title: '', price: '', description: '', },
    validationErrors: []
  });
};

exports.postAddProduct= (req,res,next)=>{
const title= req.body.title;
const image= req.file;
const price= req.body.price;
const description=req.body.description;
const dateOfAdding = new Date();
console.log(image);
if(!image){
  return res.status(422).render('admin/editProduct',{
    pageTitle: 'add product Page',
    path: '/add-product',
    editing: false,
    isAuthenticated: req.session.isLoggedIn,
    activeAddProduct: true,
    errorMessage:['Attached file is not an image'],
    oldDetails: {title: title, price: price, description: description, },
    validationErrors: ['Attached file is not an image'],
  });


}
console.log(title, price, description, dateOfAdding);
const errors = validationResult(req);
console.log("errors=>>>>>>", errors);
if(!errors.isEmpty()){
console.log(errors.array());
// console.log(errors.array()[0].msg);
  return res.status(422).render('admin/editProduct',{
    pageTitle: 'add product Page',
    path: '/add-product',
    editing: false,
    isAuthenticated: req.session.isLoggedIn,
    activeAddProduct: true,
    errorMessage:[errors.array()[0].msg],
    oldDetails: {title: title, imageURL: image, price: price, description: description, },
    validationErrors: errors.array(),
  });
}
const imageURL=image.path;
const products=new Product({
  title: title,
  imageURL: imageURL,
  price: price,
  description: description,
  Date: dateOfAdding,
  UserId: req.user._id,
})
.save()
.then((result) => {
  console.log("Product Added Successfully!!!");
  res.redirect('/');   
})
.catch((err) => {
  console.log(err);
  const error = new Error(err);
  console.log(err);
  error.httpStatusCode = 500;
  return next(err);
});
};

















