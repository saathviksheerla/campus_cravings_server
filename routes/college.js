// routes/college.js
const express = require('express');
const router = express.Router();
const CollegeController = require('../controllers/collegeController');
const { authenticateToken, isAdmin } = require('../middleware/auth');

// Public routes
router.get('/all', CollegeController.getColleges);

// Protected routes
router.put('/user/college', authenticateToken, CollegeController.updateUserCollege);
router.get('/user/college', authenticateToken, CollegeController.getUserCollege);

// Admin routes
router.post('/', authenticateToken, isAdmin, CollegeController.createCollege);
router.put('/:id', authenticateToken, isAdmin, CollegeController.updateCollege);
router.delete('/:id', authenticateToken, isAdmin, CollegeController.deleteCollege);

module.exports = router;