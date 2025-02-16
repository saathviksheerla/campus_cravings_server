const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect('mongodb://localhost:27017/canteen_app', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

// JWT Middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ error: 'Access denied' });

  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    req.user = verified;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

// Auth Routes
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password, collegeId } = req.body;

    // Check if user exists
    const emailExists = await User.findOne({ email });
    if (emailExists) {
      return res.status(400).json({ error: 'Email already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      collegeId,
      role: 'student'
    });

    // Create token
    const token = jwt.sign(
      { _id: user._id, role: user.role },
      process.env.JWT_SECRET
    );

    res.status(201).json({ token, user: { 
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      collegeId: user.collegeId
    }});
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: 'User not found' });
    }

    // Check password
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(400).json({ error: 'Invalid password' });
    }

    // Create token
    const token = jwt.sign(
      { _id: user._id, role: user.role },
      process.env.JWT_SECRET
    );

    res.json({ token, user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      collegeId: user.collegeId
    }});
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Protected Routes
app.get('/api/users/me', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    res.json(user);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Menu Routes
app.get('/api/menu', async (req, res) => {
  try {
    console.log('Fetching menu items...');
    const menuItems = await MenuItem.find({ available: true });
    console.log('Found menu items:', menuItems);
    res.json(menuItems);
  } catch (error) {
    console.error('Error fetching menu:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/menu', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin' && req.user.role !== 'staff') {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    const menuItem = await MenuItem.create(req.body);
    res.status(201).json(menuItem);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Order Routes
app.post('/api/orders', authenticateToken, async (req, res) => {
  try {
    const { items } = req.body;
    let totalAmount = 0;
    const orderItems = await Promise.all(items.map(async (item) => {
      const menuItem = await MenuItem.findById(item.menuItemId);
      if (!menuItem || !menuItem.available) {
        throw new Error(`Item ${menuItem?.name || 'unknown'} is not available`);
      }
      totalAmount += menuItem.price * item.quantity;
      return {
        menuItemId: menuItem._id,
        quantity: item.quantity,
        price: menuItem.price,
        name: menuItem.name
      };
    }));

    const pickupCode = Math.random().toString(36).substr(2, 6).toUpperCase();

    const order = await Order.create({
      userId: req.user._id,
      items: orderItems,
      totalAmount,
      pickupCode,
      status: 'pending'
    });

    res.status(201).json(order);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});