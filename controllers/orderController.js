// controllers/orderController.js
const Order = require('../models/Order');
const Menu = require('../models/Menu');

class OrderController {

  static async getOrders(req, res) {
    try {
      const orders = await Order.find({ userId: req.user._id })
        .sort({ orderDate: -1 }); // Most recent first
      res.json(orders);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  static async createOrder(req, res) {
    try {
      const { items } = req.body;
      let totalAmount = 0;
      
      const orderItems = await Promise.all(items.map(async (item) => {
        const menuItem = await Menu.findById(item.menuItemId);
        if (!menuItem || !menuItem.available) {
          throw new Error(`Item ${menuItem?.name || 'unknown'} is not available`);
        }
        totalAmount += menuItem.price * item.quantity;
        return {
          menuItemId: menuItem._id,
          quantity: item.quantity,
          price: menuItem.price,
          name: menuItem.name
        };
      }));

      const pickupCode = Math.random().toString(36).substr(2, 6).toUpperCase();

      const order = await Order.create({
        userId: req.user._id,
        items: orderItems,
        totalAmount,
        pickupCode,
        status: 'pending'
      });

      res.status(201).json(order);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  static async getAdminOrders(req, res) {
    try {
      if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Unauthorized' });
      }
      
      const orders = await Order.find()
        .populate('userId', 'name email')
        .sort({ orderDate: -1 });
      res.json(orders);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  static async updateOrderStatus(req, res) {
    try {
      const { orderId } = req.params;
      const { status } = req.body;
      
      // Verify admin role
      if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Unauthorized' });
      }

      // Update order status and set completion time if completed
      const order = await Order.findByIdAndUpdate(
        orderId,
        { 
          status,
          ...(status === 'completed' ? { completionTime: new Date() } : {})
        },
        { new: true }
      );

      if (!order) {
        return res.status(404).json({ error: 'Order not found' });
      }

      res.json(order);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
}

module.exports = OrderController;