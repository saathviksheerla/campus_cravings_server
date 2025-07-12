// controllers/collegeController.js
const College = require('../models/College');
const User = require('../models/User');

class CollegeController {
  // Get all active colleges
  static async getColleges(req, res) {
    try {
      const colleges = await College.find({ isActive: true })
        .sort({ name: 1 });
      
      res.status(200).json({ 
        colleges,
        count: colleges.length 
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // Update user's selected college
  static async updateUserCollege(req, res) {
    try {
      const { collegeId } = req.body;
      
      if (!collegeId) {
        return res.status(400).json({ error: 'College ID is required' });
      }

      // Verify college exists and is active
      const college = await College.findOne({ _id: collegeId, isActive: true });
      if (!college) {
        return res.status(404).json({ error: 'College not found or inactive' });
      }

      // Update user's selected college
      const updatedUser = await User.findByIdAndUpdate(
        req.user._id,
        { selectedCollegeId: collegeId },
        { new: true }
      ).populate('selectedCollegeId');

      res.status(200).json({
        message: 'College updated successfully',
        user: updatedUser
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // Get user's current college
  static async getUserCollege(req, res) {
    try {
      const user = await User.findById(req.user._id)
        .populate('selectedCollegeId');
      
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      res.status(200).json({
        college: user.selectedCollegeId || null
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // Admin: Create new college
  static async createCollege(req, res) {
    try {
      const { name, code, address } = req.body;
      
      if (!name || !code || !address) {
        return res.status(400).json({ 
          error: 'Name, code, and address are required' 
        });
      }

      const college = new College({
        name,
        code: code.toUpperCase(),
        address
      });

      await college.save();
      res.status(201).json({ 
        message: 'College created successfully',
        college 
      });
    } catch (error) {
      if (error.code === 11000) {
        const field = Object.keys(error.keyValue)[0];
        return res.status(400).json({ 
          error: `College ${field} already exists` 
        });
      }
      res.status(500).json({ error: error.message });
    }
  }

  // Admin: Update college
  static async updateCollege(req, res) {
    try {
      const { id } = req.params;
      const { name, code, address, isActive } = req.body;
      
      const college = await College.findByIdAndUpdate(
        id,
        { name, code: code?.toUpperCase(), address, isActive },
        { new: true, runValidators: true }
      );

      if (!college) {
        return res.status(404).json({ error: 'College not found' });
      }

      res.status(200).json({ 
        message: 'College updated successfully',
        college 
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // Admin: Delete college (soft delete by setting isActive to false)
  static async deleteCollege(req, res) {
    try {
      const { id } = req.params;
      
      const college = await College.findByIdAndUpdate(
        id,
        { isActive: false },
        { new: true }
      );

      if (!college) {
        return res.status(404).json({ error: 'College not found' });
      }

      res.status(200).json({ 
        message: 'College deactivated successfully',
        college 
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}

module.exports = CollegeController;