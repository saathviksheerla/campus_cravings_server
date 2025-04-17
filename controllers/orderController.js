// controllers/orderController.js - modified version
const Order = require('../models/Order');
const Menu = require('../models/Menu');
const NotificationService = require('../services/notificationService');

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

      const pickupCode = Math.floor(100000 + Math.random() * 900000); // Always 6 digits


      const order = await Order.create({
        userId: req.user._id,
        items: orderItems,
        totalAmount,
        pickupCode,
        status: 'pending'
      });

      // Send notification for order creation
      await NotificationService.sendOrderNotification(
        req.user._id,
        'Order Received',
        `Your order #${pickupCode} has been received and is being processed.`,
        { 
          orderId: order._id.toString(),
          status: 'pending',
          pickupCode
        }
      );

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

      // Get notification message based on status
      let title, message;
      switch (status) {
        case 'confirmed':
          title = 'Order Confirmed';
          message = `Your order #${order.pickupCode} has been confirmed and will be prepared soon.`;
          break;
        case 'ready':
          title = 'Order Ready for Pickup';
          message = `Your order #${order.pickupCode} is ready! Please come to the counter.`;
          break;
        case 'completed':
          title = 'Order Completed';
          message = `Thank you for picking up your order #${order.pickupCode}. Enjoy your meal!`;
          break;
        case 'cancelled':
          title = 'Order Cancelled';
          message = `Your order #${order.pickupCode} has been cancelled.`;
          break;
        default:
          title = 'Order Update';
          message = `Your order #${order.pickupCode} status: ${status}`;
      }

      // Send notification
      await NotificationService.sendOrderNotification(
        order.userId,
        title,
        message,
        { 
          orderId: order._id.toString(),
          status,
          pickupCode: order.pickupCode
        }
      );

      res.json(order);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
}

module.exports = OrderController;