// models/User.js - modified version
const mongoose = require('mongoose');

// User Schema
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String },
  isPhoneVerified: { type: Boolean, default: false },
  role: { type: String, enum: ['client', 'admin'], default: 'client' },
  googleId: { type: String },
  password: { type: String }, // No longer required for Google auth
  fcmTokens: [{ type: String, default: null }], // Array to store multiple device tokens
  balance: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

userSchema.index({ email: 1 }, { unique: true });

const User = mongoose.model('User', userSchema);

module.exports = User;