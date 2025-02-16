// init-db.js
const mongoose = require('mongoose');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/canteen_app', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

// User Schema
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String },
  collegeId: { type: String, unique: true },
  role: { type: String, enum: ['student', 'staff', 'admin'], default: 'student' },
  password: { type: String, required: true },
  balance: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

// Menu Item Schema
const menuItemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  price: { type: Number, required: true },
  category: { type: String, required: true },
  imageUrl: { type: String },
  available: { type: Boolean, default: true },
  preparationTime: { type: Number },
  updatedAt: { type: Date, default: Date.now }
});

// Order Schema
const orderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items: [{
    menuItemId: { type: mongoose.Schema.Types.ObjectId, ref: 'MenuItem' },
    quantity: { type: Number, required: true },
    price: { type: Number, required: true },
    name: { type: String, required: true } // Denormalized for order history
  }],
  totalAmount: { type: Number, required: true },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'preparing', 'ready', 'completed', 'cancelled'],
    default: 'pending'
  },
  pickupCode: { type: String, unique: true },
  orderDate: { type: Date, default: Date.now },
  preparationTime: { type: Number },
  completionTime: { type: Date }
});

// Create indexes
userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ collegeId: 1 }, { unique: true });
menuItemSchema.index({ category: 1 });
orderSchema.index({ userId: 1 });
orderSchema.index({ status: 1 });
orderSchema.index({ pickupCode: 1 }, { unique: true });

// Create models
const User = mongoose.model('User', userSchema);
const MenuItem = mongoose.model('MenuItem', menuItemSchema);
const Order = mongoose.model('Order', orderSchema);

// Sample test data
const testUsers = [
  {
    name: 'John Student',
    email: 'john@college.edu',
    phone: '1234567890',
    collegeId: 'STU001',
    role: 'student',
    password: 'hashedpassword123', // In real app, use bcrypt
    balance: 500
  },
  {
    name: 'Jane Student',
    email: 'jane@college.edu',
    phone: '1234567891',
    collegeId: 'STU002',
    role: 'student',
    password: 'hashedpassword123',
    balance: 750
  },
  {
    name: 'Admin User',
    email: 'admin@college.edu',
    phone: '9876543210',
    collegeId: 'ADM001',
    role: 'admin',
    password: 'hashedpassword123',
    balance: 0
  },
  {
    name: 'Staff Member',
    email: 'staff@college.edu',
    phone: '9876543211',
    collegeId: 'STF001',
    role: 'staff',
    password: 'hashedpassword123',
    balance: 0
  }
];

const testMenuItems = [
  {
    name: 'Chicken Sandwich',
    description: 'Grilled chicken with lettuce and mayo',
    price: 120,
    category: 'Sandwiches',
    imageUrl: '/images/chicken-sandwich.jpg',
    available: true,
    preparationTime: 10
  },
  {
    name: 'Veg Burger',
    description: 'Mixed vegetable patty with cheese',
    price: 100,
    category: 'Burgers',
    imageUrl: '/images/veg-burger.jpg',
    available: true,
    preparationTime: 8
  },
  {
    name: 'French Fries',
    description: 'Crispy potato fries with seasoning',
    price: 80,
    category: 'Sides',
    imageUrl: '/images/fries.jpg',
    available: true,
    preparationTime: 5
  },
  {
    name: 'Cold Coffee',
    description: 'Creamy cold coffee with ice cream',
    price: 70,
    category: 'Beverages',
    imageUrl: '/images/cold-coffee.jpg',
    available: true,
    preparationTime: 3
  }
];

// Function to initialize database with test data
async function initializeDatabase() {
  try {
    // Clear existing data
    await User.deleteMany({});
    await MenuItem.deleteMany({});
    await Order.deleteMany({});

    // Insert test data
    const users = await User.insertMany(testUsers);
    const menuItems = await MenuItem.insertMany(testMenuItems);

    // Create a sample order
    const sampleOrder = {
      userId: users[0]._id,
      items: [
        {
          menuItemId: menuItems[0]._id,
          quantity: 1,
          price: menuItems[0].price,
          name: menuItems[0].name
        },
        {
          menuItemId: menuItems[2]._id,
          quantity: 1,
          price: menuItems[2].price,
          name: menuItems[2].name
        }
      ],
      totalAmount: menuItems[0].price + menuItems[2].price,
      pickupCode: 'ABC123',
      status: 'pending'
    };

    await Order.create(sampleOrder);

    console.log('Database initialized with test data');
  } catch (error) {
    console.error('Error initializing database:', error);
  } finally {
    mongoose.disconnect();
  }
}

// Run the initialization
initializeDatabase();