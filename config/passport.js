// config/passport.js
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');
require('dotenv').config();

// Debug logs to check environment variables
console.log('Environment check:');
console.log('GOOGLE_CLIENT_ID exists:', !!process.env.GOOGLE_CLIENT_ID);
console.log('GOOGLE_CLIENT_SECRET exists:', !!process.env.GOOGLE_CLIENT_SECRET);

// Hard-code strategy config for testing
const googleConfig = {
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: '/api/auth/google/callback',
  scope: ['profile', 'email']
};

passport.use(
  new GoogleStrategy(
    googleConfig,
    async (accessToken, refreshToken, profile, done) => {
      try {
        console.log('Google auth callback received profile:', profile.id);
        
        // Find if user already exists in our database
        let user = await User.findOne({ email: profile.emails[0].value });
        
        if (user) {
          console.log('Existing user found with email:', profile.emails[0].value);
          return done(null, user);
        } else {
          console.log('Creating new user with email:', profile.emails[0].value);
          // If user doesn't exist, create a new user
          user = await User.create({
            name: profile.displayName,
            email: profile.emails[0].value,
            googleId: profile.id,
            role: 'client'
          });
          return done(null, user);
        }
      } catch (error) {
        console.error('Google auth error:', error);
        return done(error, null);
      }
    }
  )
);

module.exports = passport;