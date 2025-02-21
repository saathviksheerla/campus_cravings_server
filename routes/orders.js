const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Menu = require('../models/Menu');

// Get all orders (with filters for staff/admin)
router.get('/', async (req, res) => {
  try {
    const { status, date } = req.query;
    let query = {};
    
    // If user is student, only show their orders
    if (req.user.role === 'student') {
      query.userId = req.user._id;
    }
    
    // Filter by status if provided
    if (status) {
      query.status = status;
    }
    
    // Filter by date if provided
    if (date) {
      const startOfDay = new Date(date);
      const endOfDay = new Date(date);
      endOfDay.setDate(endOfDay.getDate() + 1);
      query.orderDate = { $gte: startOfDay, $lt: endOfDay };
    }

    const orders = await Order.find(query)
      .sort({ orderDate: -1 })
      .populate('userId', 'name email collegeId');
      
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get specific order by ID
router.get('/:id', async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('userId', 'name email collegeId');
    
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Check if user has permission to view this order
    if (req.user.role === 'student' && order.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update order status
router.patch('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    
    // Only staff and admin can update order status
    if (req.user.role === 'student') {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    order.status = status;
    if (status === 'completed') {
      order.completionTime = new Date();
    }

    await order.save();
    res.json(order);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Cancel order
router.patch('/:id/cancel', async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Only allow cancellation if order is pending
    if (order.status !== 'pending') {
      return res.status(400).json({ error: 'Can only cancel pending orders' });
    }

    // Students can only cancel their own orders
    if (req.user.role === 'student' && order.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    order.status = 'cancelled';
    await order.save();
    res.json(order);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;