const mongoose = require('mongoose');

const menuItemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  price: {
    type: Number,
    required: true
  },
  description: {
    type: String,
    trim: true
  },
  dailyQuantity: {
    type: Number,
    required: true
  }
}, { timestamps: true });

module.exports = mongoose.model('MenuItem', menuItemSchema); 