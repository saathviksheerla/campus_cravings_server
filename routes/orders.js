// routes/orders.js
const express = require('express');
const router = express.Router();
const OrderController = require('../controllers/orderController');
const { authenticateToken } = require('../middleware/auth');

router.get('/', authenticateToken, OrderController.getOrders);
router.post('/', authenticateToken, OrderController.createOrder);

module.exports = router;