 const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  user:          { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items: [{
    product:   { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    name:      String,
    emoji:     String,
    price:     Number,
    qty:       Number,
  }],
  status:        { type: String, default: 'placed', enum: ['placed','confirmed','preparing','out_for_delivery','delivered','cancelled'] },
  paymentMethod: { type: String, default: 'cod' },
  paymentStatus: { type: String, default: 'pending' },
  subtotal:      Number,
  deliveryFee:   { type: Number, default: 40 },
  tax:           Number,
  discount:      { type: Number, default: 0 },
  couponCode:    String,
  total:         Number,
  address: {
    line1:   String,
    city:    String,
    pincode: String,
  },
}, { timestamps: true });

module.exports = mongoose.models.Order || mongoose.model('Order', orderSchema);