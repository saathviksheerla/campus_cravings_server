// models/Menu.js
const mongoose = require('mongoose');

const menuItemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  price: { type: Number, required: true },
  category: { type: String, required: true },
  imageUrl: { type: String },
  available: { type: Boolean, default: true },
  preparationTime: { type: Number },
  updatedAt: { type: Date, default: Date.now }
});

menuItemSchema.index({ category: 1 });

const Menu = mongoose.model('Menu', menuItemSchema)

module.exports = Menu;