// models/Menu.js
const mongoose = require('mongoose');

const CATEGORIES = [
  'Appetizers',
  'Breakfast',
  'Lunch',
  'Dinner',
  'Desserts',
  'Beverages',
  'Specials',
  'Vegetarian',
  'Non-Vegetarian',
  'Vegan',
  'Sides'
];

const menuItemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  price: { type: Number, required: true },
  category: { 
    type: String, 
    enum: [...CATEGORIES, ''], // Allow empty string for backward compatibility
    default: ''
  },
  imageUrl: { type: String },
  available: { type: Boolean, default: true },
  preparationTime: { type: Number },
  updatedAt: { type: Date, default: Date.now }
});

// Export CATEGORIES to be used elsewhere in the application
menuItemSchema.statics.CATEGORIES = CATEGORIES;

menuItemSchema.index({ category: 1 });

const Menu = mongoose.model('Menu', menuItemSchema);

module.exports = Menu;