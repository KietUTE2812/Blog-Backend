const express = require('express');
const { body } = require('express-validator');
const { validate } = require('../middleware/validation');
const { auth } = require('../middleware/auth');
const passport = require('../service/googleAuth');
const { register, login, getMe, updateProfile, changePassword, googleLogin, googleCallback, logout } = require('../controller/authController');

const router = express.Router();

// Register validation
const registerValidation = [
    body('username')
        .isLength({ min: 3, max: 30 })
        .withMessage('Username must be between 3 and 30 characters')
        .matches(/^[a-zA-Z0-9_]+$/)
        .withMessage('Username can only contain letters, numbers, and underscores'),
    body('email')
        .isEmail()
        .withMessage('Please provide a valid email')
        .normalizeEmail(),
    body('password')
        .isLength({ min: 6 })
        .withMessage('Password must be at least 6 characters long'),
    body('fullName')
        .isLength({ min: 2, max: 100 })
        .withMessage('Full name must be between 2 and 100 characters')
        .trim()
];

// Login validation
const loginValidation = [
    body('email')
        .isEmail()
        .withMessage('Please provide a valid email')
        .normalizeEmail(),
    body('password')
        .notEmpty()
        .withMessage('Password is required')
];

// Register
router.post('/register', registerValidation, validate, register);

// Login
router.post('/login', loginValidation, validate, login);

// Google callback
router.get('/google/callback', passport.authenticate('google', { failureRedirect: '/login' }), googleCallback);

// Google login
router.get('/google', googleLogin);

// Get current user
router.get('/me', auth, getMe);

// Update profile
router.put('/profile', auth, [
    body('fullName')
        .optional()
        .isLength({ min: 2, max: 100 })
        .withMessage('Full name must be between 2 and 100 characters')
        .trim(),
    body('bio')
        .optional()
        .isLength({ max: 500 })
        .withMessage('Bio cannot exceed 500 characters')
        .trim()
], validate, updateProfile);

// Change password
router.put('/change-password', auth, [
    body('currentPassword')
        .notEmpty()
        .withMessage('Current password is required'),
    body('newPassword')
        .isLength({ min: 6 })
        .withMessage('New password must be at least 6 characters long')
], validate, changePassword);

// Logout
router.post('/logout', auth, logout);

module.exports = router; 