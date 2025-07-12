// scripts/migrate-college-data.js
const mongoose = require('mongoose');
const Menu = require('./models/Menu');
const Order = require('./models/Order');
const User = require('./models/User');
const College = require('./models/College');

require('dotenv').config();

// Database connection
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_ATLAS_URI);
    console.log('MongoDB connected');
  } catch (error) {
    console.error('Database connection error:', error);
    process.exit(1);
  }
};

const migrateData = async () => {
  try {
    console.log('Starting migration...');
    
    // Get the first college as default (you can modify this logic)
    const defaultCollege = await College.findOne({ isActive: true });
    
    if (!defaultCollege) {
      console.error('No active college found! Please ensure you have at least one college in the database.');
      return;
    }
    
    console.log(`Using default college: ${defaultCollege.name} (${defaultCollege._id})`);
    
    // Update Menu items without collegeId
    const menuUpdateResult = await Menu.updateMany(
      { collegeId: { $exists: false } },
      { $set: { collegeId: defaultCollege._id } }
    );
    console.log(`Updated ${menuUpdateResult.modifiedCount} menu items`);
    
    // Update Orders without collegeId
    const orderUpdateResult = await Order.updateMany(
      { collegeId: { $exists: false } },
      { $set: { collegeId: defaultCollege._id } }
    );
    console.log(`Updated ${orderUpdateResult.modifiedCount} orders`);
    
    // Update Users without selectedCollegeId
    const userUpdateResult = await User.updateMany(
      { selectedCollegeId: { $exists: false } },
      { $set: { selectedCollegeId: defaultCollege._id } }
    );
    console.log(`Updated ${userUpdateResult.modifiedCount} users`);
    
    console.log('Migration completed successfully!');
    
  } catch (error) {
    console.error('Migration error:', error);
  }
};

// Run migration
const runMigration = async () => {
  await connectDB();
  await migrateData();
  await mongoose.disconnect();
  console.log('Database connection closed');
};

// Check if script is run directly
if (require.main === module) {
  runMigration();
}

module.exports = { migrateData };