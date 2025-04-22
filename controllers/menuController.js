// controllers/menuController.js
const Menu = require('../models/Menu');

class MenuController {
  static async getMenuItems(req, res) {
    try {
      const menuItems = await Menu.find({ available: true });
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
      const menuItem = await Menu.create(req.body);
      res.status(201).json(menuItem);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  static async updateMenuItem(req, res) {
    try {
      const { itemId } = req.params;
      
      // Verify admin role
      if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Unauthorized' });
      }

      const menuItem = await Menu.findByIdAndUpdate(
        itemId,
        { ...req.body, updatedAt: new Date() },
        { new: true }
      );

      if (!menuItem) {
        return res.status(404).json({ error: 'Menu item not found' });
      }

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

      const menuItem = await Menu.findByIdAndDelete(itemId);

      if (!menuItem) {
        return res.status(404).json({ error: 'Menu item not found' });
      }

      res.json({ message: 'Menu item deleted successfully' });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
}

module.exports = MenuController;