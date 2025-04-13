// controllers/googleAuthController.js
const User = require('../models/User');
const jwt = require('jsonwebtoken');
require('dotenv').config();

class GoogleAuthController {
  static async googleCallback(req, res) {
    try {
      // User is already authenticated by Passport at this point
      const user = req.user;
      
      // Generate JWT token
      const token = jwt.sign(
        { _id: user._id, role: user.role },
        process.env.JWT_SECRET
      );

      // Redirect to frontend with token as query parameter
      // You'll handle this on the frontend to extract the token
      res.redirect(`${process.env.FRONTEND_URL}/auth/google/callback?token=${token}`);
    } catch (error) {
      res.redirect(`${process.env.FRONTEND_URL}/login?error=${error.message}`);
    }
  }

  // This endpoint can be used to get user details after authentication
  static async getCurrentUser(req, res) {
    try {
      const user = await User.findById(req.user._id).select('-password');
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      
      res.json({
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          isPhoneVerified: user.isPhoneVerified,
          role: user.role,
        }
      });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
}

module.exports = GoogleAuthController;