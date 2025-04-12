// routes/user.js
const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const UserController = require('../controllers/userController');

// Phone verification routes
router.post('/update', authenticateToken, UserController.updatePhone);
router.post('/verify', authenticateToken, UserController.verifyPhone);
router.get('/status', authenticateToken, UserController.checkStatus);

// Profile routes
router.get('/profile', authenticateToken, UserController.getProfile);
router.post('/update-username', authenticateToken, UserController.updateUsername);

module.exports = router;