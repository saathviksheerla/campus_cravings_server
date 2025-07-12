// routes/orders.js
const express = require('express');
const router = express.Router();
const OrderController = require('../controllers/orderController');
const { authenticateToken } = require('../middleware/auth');
const { isAdmin } = require('../middleware/auth');

router.post('/', authenticateToken, OrderController.getOrders);
router.post('/add', authenticateToken, OrderController.createOrder);
router.post('/admin/all', authenticateToken, isAdmin, OrderController.getAdminOrders);
router.put('/admin/:orderId/status', authenticateToken, isAdmin, OrderController.updateOrderStatus);

module.exports = router;