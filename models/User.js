// models/User.js
const mongoose = require('mongoose');

// User Schema
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String },
  role: { type: String, enum: ['client', 'admin'], default: 'client' },
  googleId: { type: String },
  password: { type: String }, // No longer required for Google auth
  balance: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

userSchema.index({ email: 1 }, { unique: true });

const User = mongoose.model('User', userSchema);

module.exports = User;