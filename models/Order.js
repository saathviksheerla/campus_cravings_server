// models/Order.js
const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items: [{
    menuItemId: { type: mongoose.Schema.Types.ObjectId, ref: 'MenuItem' },
    quantity: { type: Number, required: true },
    price: { type: Number, required: true },
    name: { type: String, required: true } // Denormalized for order history
  }],
  totalAmount: { type: Number, required: true },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'preparing', 'ready', 'completed', 'cancelled'],
    default: 'pending'
  },
  pickupCode: { type: String, unique: true },
  orderDate: { type: Date, default: Date.now },
  preparationTime: { type: Number },
  completionTime: { type: Date }
});

orderSchema.index({ userId: 1 });
orderSchema.index({ status: 1 });
orderSchema.index({ pickupCode: 1 }, { unique: true });

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;