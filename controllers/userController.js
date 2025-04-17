// controllers/userController.js
const User = require('../models/User');
const NotificationService = require('../services/notificationService');


class UserController {
  // Update user phone number
  static async updatePhone(req, res) {
    try {
      const { phone } = req.body;
      
      if (!phone) {
        return res.status(400).json({ error: 'Phone number is required' });
      }
      
      await User.findByIdAndUpdate(req.user._id, { 
        phone,
        isPhoneVerified: false // Reset verification status when phone is updated
      });
      
      res.status(200).json({ message: 'Phone number updated' });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
  
  // Mark phone as verified after Firebase verification
  static async verifyPhone(req, res) {
    try {
      const { phone, verified } = req.body;
      
      if (verified !== true) {
        return res.status(400).json({ error: 'Verification failed' });
      }
      
      await User.findByIdAndUpdate(req.user._id, { 
        isPhoneVerified: true 
      });
      
      res.status(200).json({ message: 'Phone number verified successfully' });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
  
  // Check verification status
  static async checkStatus(req, res) {
    try {
      const user = await User.findById(req.user._id);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      
      res.status(200).json({ 
        phone: user.phone || '',
        isPhoneVerified: user.isPhoneVerified 
      });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  // Get user profile
  static async getProfile(req, res) {
    try {
      const user = await User.findById(req.user._id).select('-password');
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      
      res.status(200).json({ user });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  // Update username
  static async updateUsername(req, res) {
    try {
      const { username } = req.body;
      
      if (!username) {
        return res.status(400).json({ error: 'Username is required' });
      }
      
      // Check for minimum length
      if (username.length < 3) {
        return res.status(400).json({ error: 'Username must be at least 3 characters long' });
      }
      
      // Check if username already exists
      const existingUser = await User.findOne({ 
        name: username,
        _id: { $ne: req.user._id } // Exclude current user
      });
      
      if (existingUser) {
        return res.status(400).json({ error: 'Username already taken' });
      }
      
      // Update username
      const updatedUser = await User.findByIdAndUpdate(
        req.user._id, 
        { name: username },
        { new: true } // Return the updated document
      ).select('-password');
      
      res.status(200).json({ 
        message: 'Username updated successfully',
        user: updatedUser
      });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  // controllers/userController.js - Add this method
static async saveFCMToken(req, res) {
  try {
    const { token } = req.body;
    
    if (!token) {
      return res.status(400).json({ error: 'Token is required' });
    }
    
    const result = await NotificationService.saveUserToken(req.user._id, token);
    console.log("result = ", result);
    if (result) {
      res.status(200).json({ message: 'Token saved successfully' });
    } else {
      res.status(500).json({ error: 'Failed to save token' });
    }
  } catch (error) {
    console.log("Error in Cath line 132");
    res.status(500).json({ error: error.message });
  }
}
}

module.exports = UserController;