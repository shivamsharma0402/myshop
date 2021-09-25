const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const userSchema = new Schema({
  Email: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  resetToken: String,
  resetTokenExpiry: Date,
  cart: {
    items: [
    {
      ProductId: {
        type: Schema.Types.ObjectId,
        ref: 'Product',
        required: true
      },
      quantity: {
        type: Number,
        required: true
      },

    }
  ]
}
});

userSchema.methods.clearCart=function(product){
  this.cart={items:[]};
  return this.save();
};

userSchema.methods.addToCart=function(product){
  const cartProductIndex = this.cart.items.findIndex(cp=>{
    return cp.ProductId.toString()===product._id.toString();
  });
  let newQuantity = 1;
  const updatedCartItems= [...this.cart.items];
  if(cartProductIndex>=0){
    newQuantity = this.cart.items[cartProductIndex].quantity + 1;
    updatedCartItems[cartProductIndex].quantity = newQuantity;

  }
  else{
    updatedCartItems.push({
      ProductId: product._id,
      quantity: newQuantity
    });
  }
  const updatedCart = {
    items: updatedCartItems
  }
  this.cart = updatedCart;
  return this.save();

};


userSchema.methods.deleteFromCart=function(productId){
  const updatedCartItems = this.cart.items.filter(cp=>{
  console.log('#################',cp.ProductId.toString(),'######################');

    return cp.ProductId.toString() !== productId.toString();
  });
  console.log('updatedCartItems=>>>>>>>>>>>>>>>>>>',updatedCartItems,'<<<<<<<<<<<<<<<<<<<<<<<<<<<');
  this.cart.items = updatedCartItems;
  return this.save();
  };


module.exports = mongoose.model('User',userSchema);