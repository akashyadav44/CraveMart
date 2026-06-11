 const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name:          { type: String, required: true },
  description:   { type: String, required: true },
  price:         { type: Number, required: true },
  originalPrice: { type: Number, default: null },
  emoji:         { type: String, default: '🍽️' },
  category:      { type: String, required: true, enum: ['indian','pizza','burger','sushi','dessert','drinks','other'] },
  badge:         { type: String, default: null },
  isAvailable:   { type: Boolean, default: true },
  isVeg:         { type: Boolean, default: false },
  rating:        { type: Number, default: 0 },
  numReviews:    { type: Number, default: 0 },
  prepTime:      { type: Number, default: 20 },
  calories:      { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.models.Product || mongoose.model('Product', productSchema);