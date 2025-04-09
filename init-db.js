// init-db.js
const mongoose = require('mongoose');
require('dotenv').config();

// Connect to MongoDB Atlas
mongoose.connect(process.env.MONGODB_ATLAS_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  retryWrites: true,
  w: 'majority'
})
.then(() => {
  console.log('MongoDB Atlas connected successfully');
  // Log connection details (without sensitive info)
  const { host, name } = mongoose.connection;
  console.log(`Connected to database: ${name} at host: ${host}`);
})
.catch(err => {
  console.error('MongoDB Atlas connection error:', err);
  process.exit(1); // Exit if cannot connect to database
});

// mongoose.connect(process.env.MONGODB_LOCAL_URI, {
//   useNewUrlParser: true,
//   useUnifiedTopology: true
// })
//   .then(() => console.log('MongoDB connected successfully \n'))
//   .catch(err => console.error('MongoDB connection error:', err));


// User Schema
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String },
  role: { type: String, enum: ['client', 'admin'], default: 'client' },
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
    menuItemId: { type: mongoose.Schema.Types.ObjectId, ref: 'Menu' },
    quantity: { type: Number, required: true },
    price: { type: Number, required: true },
    name: { type: String, required: true }
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
menuItemSchema.index({ category: 1 });
orderSchema.index({ userId: 1 });
orderSchema.index({ status: 1 });
orderSchema.index({ pickupCode: 1 }, { unique: true });

// Create models
const User = mongoose.model('User', userSchema);
const Menu = mongoose.model('Menu', menuItemSchema);
const Order = mongoose.model('Order', orderSchema);

// Sample test data
const testUsers = [
  {
    name: 'ram',
    email: 'ram@clg.edu',
    phone: '1234567890',
    role: 'client',
    password: '1234', // In real app, use bcrypt
    balance: 500
  },
  {
    name: 'Jane Doe',
    email: 'jane@college.edu',
    phone: '1234567891',
    role: 'client',
    password: 'hashedpassword123',
    balance: 750
  },
  {
    name: 'Admin User',
    email: 'admin@college.edu',
    phone: '9876543210',
    role: 'admin',
    password: 'hashedpassword123',
    balance: 0
  }
];

const testMenuItems = [
  {
    "name": "Veggie Delight",
    "description": "Fresh vegetables with cheese and pesto",
    "price": 90,
    "category": "Sandwiches",
    "imageUrl": "https://s.lightorangebean.com/media/20240914161537/Ultimate-Veggie-Delight-Sandwich_-done.png",
    "available": true,
    "preparationTime": 5
  },
  {
    "name": "Club Sandwich",
    "description": "Chicken, bacon, lettuce, tomato, and mayo",
    "price": 150,
    "category": "Sandwiches",
    "imageUrl": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRYuf5Tsqs6eSmBDJhKuIcqZVqa59g52hQilQ&s",
    "available": true,
    "preparationTime": 15
  },
  {
    "name": "Turkey and Swiss",
    "description": "Sliced turkey, Swiss cheese, lettuce, and mustard",
    "price": 110,
    "category": "Sandwiches",
    "imageUrl": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTa43rnwepU0w0Qmr0RvBYNeW1EkGeEomFMWw&s",
    "available": true,
    "preparationTime": 8
  },
  {
    "name": "Egg and Cheese",
    "description": "Fried egg, cheese, and your choice of bread",
    "price": 80,
    "category": "Sandwiches",
    "imageUrl": "https://marleysmenu.com/wp-content/uploads/2023/11/Epic-Egg-and-Cheese-Sandwich-Hero-Image.jpg",
    "available": true,
    "preparationTime": 7
  },
  {
    "name": "Peanut Butter and Jelly",
    "description": "Peanut butter and your choice of jelly",
    "price": 60,
    "category": "Sandwiches",
    "imageUrl": "https://www.allrecipes.com/thmb/SpLbvOKqRtr6U3iodmNcJ5FgnAw=/1500x0/filters:no_upscale():max_bytes(150000):strip_icc()/49943-grilled-peanut-butter-and-jelly-sandwich-4x3-0309-085648b2dc5f421da0fbef9292a89ff0.jpg",
    "available": true,
    "preparationTime": 5
  },
  {
    name: 'Veg Burger',
    description: 'Mixed vegetable patty with cheese',
    price: 100,
    category: 'Burgers',
    imageUrl: 'https://www.vegrecipesofindia.com/wp-content/uploads/2020/12/burger-recipe-1.jpg',
    available: true,
    preparationTime: 8
  },
  {
    name: 'French Fries',
    description: 'Crispy potato fries with seasoning',
    price: 80,
    category: 'Sides',
    imageUrl: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTFTbeY-mFwWrb7R7ZV3yFBtMKeZB3XzM6Aog&s',
    available: true,
    preparationTime: 5
  },
  {
    name: 'Cold Coffee',
    description: 'Creamy cold coffee with ice cream',
    price: 70,
    category: 'Beverages',
    imageUrl: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS1VElUwmNTMaU-R3990XJMlO0a1yE4SmqYxQ&s',
    available: true,
    preparationTime: 3
  }
];

// Function to initialize database with test data
async function initializeDatabase() {
  try {
    // Clear existing data
    await User.deleteMany({});
    await Menu.deleteMany({});
    await Order.deleteMany({});

    // Insert test data
    const users = await User.insertMany(testUsers);
    const menuItems = await Menu.insertMany(testMenuItems);

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