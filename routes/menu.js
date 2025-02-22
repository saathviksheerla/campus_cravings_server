// routes/menu.js
const express = require('express');
const router = express.Router();
const MenuController = require('../controllers/menuController');
const { authenticateToken, isAdmin } = require('../middleware/auth');

router.get('/', MenuController.getMenuItems);
router.post('/', authenticateToken, isAdmin, MenuController.createMenuItem);

module.exports = router;