// models/College.js
const mongoose = require('mongoose');

const collegeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  code: {
    type: String,
    required: true,
    unique: true,
    uppercase: true
  },
  address: {
    type: String,
    required: true,
    default: ''
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

collegeSchema.index({ code: 1 }, { unique: true });
collegeSchema.index({ name: 1 }, { unique: true });

const College = mongoose.model('College', collegeSchema);

module.exports = College;