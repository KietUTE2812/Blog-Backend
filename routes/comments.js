const express = require('express');
const { body, query } = require('express-validator');
const { validate } = require('../middleware/validation');
const { auth, adminAuth, optionalAuth } = require('../middleware/auth');
const {
    getCommentsForPost,
    createComment,
    updateComment,
    deleteComment,
    likeComment,
    approveComment,
    getUserComments,
    getPendingComments
} = require('../controller/commentController');

const router = express.Router();

// Create comment validation
const createCommentValidation = [
    body('content')
        .isLength({ min: 1, max: 1000 })
        .withMessage('Comment must be between 1 and 1000 characters')
        .trim(),
    body('postId')
        .isMongoId()
        .withMessage('Valid post ID is required')
];

// Update comment validation
const updateCommentValidation = [
    body('content')
        .isLength({ min: 1, max: 1000 })
        .withMessage('Comment must be between 1 and 1000 characters')
        .trim()
];

// Get comments for a post
router.get('/post/:postId', optionalAuth, [
    query('page')
        .optional()
        .isInt({ min: 1 })
        .withMessage('Page must be a positive integer'),
    query('limit')
        .optional()
        .isInt({ min: 1, max: 50 })
        .withMessage('Limit must be between 1 and 50'),
    query('sort')
        .optional()
        .isIn(['newest', 'oldest', 'mostLiked'])
        .withMessage('Sort must be newest, oldest, or mostLiked')
], validate, getCommentsForPost);

// Create comment
router.post('/', auth, createCommentValidation, validate, createComment);

// Update comment
router.put('/:id', auth, updateCommentValidation, validate, updateComment);

// Delete comment
router.delete('/:id', auth, deleteComment);

// Like/Unlike comment
router.post('/:id/like', auth, likeComment);

// Approve/Reject comment (admin only)
router.put('/:id/approve', adminAuth, [
    body('isApproved')
        .isBoolean()
        .withMessage('isApproved must be a boolean'),
    body('isSpam')
        .optional()
        .isBoolean()
        .withMessage('isSpam must be a boolean')
], validate, approveComment);

// Get user's comments
router.get('/user/:userId', auth, [
    query('page')
        .optional()
        .isInt({ min: 1 })
        .withMessage('Page must be a positive integer'),
    query('limit')
        .optional()
        .isInt({ min: 1, max: 50 })
        .withMessage('Limit must be between 1 and 50')
], validate, getUserComments);

// Get pending comments (admin only)
router.get('/admin/pending', adminAuth, [
    query('page')
        .optional()
        .isInt({ min: 1 })
        .withMessage('Page must be a positive integer'),
    query('limit')
        .optional()
        .isInt({ min: 1, max: 50 })
        .withMessage('Limit must be between 1 and 50')
], validate, getPendingComments);

module.exports = router; 