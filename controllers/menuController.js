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
}

module.exports = MenuController;