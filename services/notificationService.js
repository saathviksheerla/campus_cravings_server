// services/notificationService.js
const admin = require('firebase-admin');
const User = require('../models/User');

// Initialize Firebase Admin with your service account
// You'll need to create a service account in Firebase console and download the JSON file
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    }),
  });
}

class NotificationService {
  static async sendOrderNotification(userId, title, body, data = {}) {
    try {
      // Get user FCM tokens
      const user = await User.findById(userId);
      
      if (!user || !user.fcmTokens || user.fcmTokens.length === 0) {
        console.log('No FCM tokens found for user:', userId);
        return false;
      }
      
      // Convert all data values to strings
      const stringifiedData = {};
      Object.keys(data).forEach(key => {
        stringifiedData[key] = String(data[key]);
      });
      
      const message = {
        notification: {
          title,
          body,
        },
        data: {
          ...stringifiedData,
          click_action: 'FLUTTER_NOTIFICATION_CLICK',
        },
      };
      
      // Send to all user devices
      const sendPromises = user.fcmTokens.map(token => {
        return admin.messaging().send({
          token,
          ...message,
        }).catch(error => {
          // If token is invalid, we should remove it
          if (error.code === 'messaging/invalid-registration-token' ||
              error.code === 'messaging/registration-token-not-registered') {
            this.removeTokenFromUser(userId, token);
          }
          console.error('Error sending notification:', error);
          return null;
        });
      });
      
      await Promise.all(sendPromises);
      return true;
    } catch (error) {
      console.error('Notification error:', error);
      return false;
    }
  }
  
  static async removeTokenFromUser(userId, token) {
    try {
      await User.findByIdAndUpdate(userId, {
        $pull: { fcmTokens: token }
      });
    } catch (error) {
      console.error('Error removing token:', error);
    }
  }
  
  static async saveUserToken(userId, token) {
    try {
      // Add token if it doesn't exist
      console.log("userId: ", userId);
      console.log("token: ", token);
      
      await User.findByIdAndUpdate(userId, {
        $addToSet: { fcmTokens: token } // $addToSet prevents duplicates
      }

    );
      return true;
    } catch (error) {
      console.error('Error saving token:', error);
      return false;
    }
  }
}

module.exports = NotificationService;