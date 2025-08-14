const express = require('express');
const { query } = require('express-validator');
const { validate } = require('../middleware/validation');
const { auth, adminAuth } = require('../middleware/auth');
const {
    getAllUsers,
    getUserByUsername,
    getUserPosts,
    updateUser,
    deleteUser,
    getUserStats
} = require('../controller/userController');

const router = express.Router();

// Get all users (admin only)
router.get('/', adminAuth, [
    query('page')
        .optional()
        .isInt({ min: 1 })
        .withMessage('Page must be a positive integer'),
    query('limit')
        .optional()
        .isInt({ min: 1, max: 50 })
        .withMessage('Limit must be between 1 and 50'),
    query('search')
        .optional()
        .isLength({ min: 1, max: 100 })
        .withMessage('Search query must be between 1 and 100 characters'),
    query('role')
        .optional()
        .isIn(['user', 'admin'])
        .withMessage('Role must be user or admin'),
    query('isActive')
        .optional()
        .isBoolean()
        .withMessage('isActive must be a boolean')
], validate, getAllUsers);

// Get user by username (public)
router.get('/:username', getUserByUsername);

// Get user's posts (public)
router.get('/:username/posts', [
    query('page')
        .optional()
        .isInt({ min: 1 })
        .withMessage('Page must be a positive integer'),
    query('limit')
        .optional()
        .isInt({ min: 1, max: 50 })
        .withMessage('Limit must be between 1 and 50'),
    query('status')
        .optional()
        .isIn(['draft', 'published', 'archived'])
        .withMessage('Status must be draft, published, or archived')
], validate, getUserPosts);

// Update user (admin or self)
router.put('/:id', auth, updateUser);

// Delete user (admin only)
router.delete('/:id', adminAuth, deleteUser);

// Get user statistics (admin or self)
router.get('/:id/stats', auth, getUserStats);

module.exports = router; 