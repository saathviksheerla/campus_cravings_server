// models/User.js
const mongoose = require('mongoose');

// User Schema
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String },
  collegeId: { type: String, unique: true },
  role: { type: String, enum: ['student', 'staff', 'admin'], default: 'student' },
  password: { type: String, required: true },
  balance: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ collegeId: 1 }, { unique: true });

const User = mongoose.model('User', userSchema);

module.exports = User;