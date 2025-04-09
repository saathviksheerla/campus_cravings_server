// routes/auth.js
const express = require('express');
const router = express.Router();
const passport = require('passport');
const { authenticateToken } = require('../middleware/auth');
const GoogleAuthController = require('../controllers/googleAuthController');

// Google OAuth routes
router.get('/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

router.get('/google/callback',
  passport.authenticate('google', { session: false, failureRedirect: '/login' }),
  GoogleAuthController.googleCallback
);

// Get current user info
router.get('/me', authenticateToken, GoogleAuthController.getCurrentUser);

module.exports = router;