// app.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const passport = require('./config/passport');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const menuRoutes = require('./routes/menu');
const orderRoutes = require('./routes/orders');

const app = express();

// Middleware
const allowedOrigins = [
  'http://localhost:3000',  // Local development
  'http://localhost:3002',
  'https://campuscravings.vercel.app' // Frontend domain
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true // Allows cookies and authentication headers
}));

app.use(express.json());

// Initialize Passport
app.use(passport.initialize());

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

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/menu', menuRoutes);
app.use('/api/orders', orderRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Something went wrong!' });
});

module.exports = app;
