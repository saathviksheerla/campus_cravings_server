// controllers/menuController.js
const Menu = require('../models/Menu');

class MenuController {
  static async getMenuItems(req, res) {
    try {
      const { collegeId } = req.body;
      
      if (!collegeId) {
        return res.status(400).json({ error: 'College ID is required' });
      }

      const menuItems = await Menu.find({ 
        available: true, 
        collegeId: collegeId 
      });
      
      res.json(menuItems);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  static async getCategories(req, res) {
    try {
      res.json(Menu.CATEGORIES);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  static async createMenuItem(req, res) {
    try {
      if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Unauthorized' });
      }

      const { collegeId } = req.body;
      
      if (!collegeId) {
        return res.status(400).json({ error: 'College ID is required' });
      }

      const menuItem = await Menu.create(req.body);
      res.status(201).json(menuItem);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  static async updateMenuItem(req, res) {
    try {
      const { itemId } = req.params;
      const { collegeId } = req.body;
      
      // Verify admin role
      if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Unauthorized' });
      }

      // Verify collegeId is provided
      if (!collegeId) {
        return res.status(400).json({ error: 'College ID is required' });
      }

      // First, find the menu item to verify it belongs to admin's college
      const existingMenuItem = await Menu.findById(itemId);
      if (!existingMenuItem) {
        return res.status(404).json({ error: 'Menu item not found' });
      }

      // Verify the existing menu item belongs to the same college
      if (existingMenuItem.collegeId.toString() !== collegeId) {
        return res.status(403).json({ error: 'Menu item does not belong to your college' });
      }

      const menuItem = await Menu.findByIdAndUpdate(
        itemId,
        { ...req.body, updatedAt: new Date() },
        { new: true }
      );

      res.json(menuItem);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  static async deleteMenuItem(req, res) {
    try {
      const { itemId } = req.params;
      
      // Verify admin role
      if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Unauthorized' });
      }

      // First, find the menu item to verify it belongs to admin's college
      const existingMenuItem = await Menu.findById(itemId);
      if (!existingMenuItem) {
        return res.status(404).json({ error: 'Menu item not found' });
      }

      await Menu.findByIdAndDelete(itemId);
      res.json({ message: 'Menu item deleted successfully' });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
}

module.exports = MenuController;