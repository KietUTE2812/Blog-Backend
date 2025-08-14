const express = require('express');
const { body, query } = require('express-validator');
const { validate } = require('../middleware/validation');
const { auth, adminAuth, optionalAuth } = require('../middleware/auth');
const {
    getAllPosts,
    getPostBySlug,
    createPost,
    updatePost,
    deletePost,
    getPostsByAuthor,
    getCategories,
    getTags
} = require('../controller/postController');

const router = express.Router();

// Create post validation
const createPostValidation = [
    body('title')
        .isLength({ min: 1, max: 200 })
        .withMessage('Title must be between 1 and 200 characters')
        .trim(),
    body('content')
        .isLength({ min: 10 })
        .withMessage('Content must be at least 10 characters long'),
    body('category')
        .isLength({ min: 1, max: 50 })
        .withMessage('Category must be between 1 and 50 characters')
        .trim(),
    body('tags')
        .optional()
        .isArray()
        .withMessage('Tags must be an array'),
    body('tags.*')
        .optional()
        .isLength({ min: 1, max: 30 })
        .withMessage('Each tag must be between 1 and 30 characters'),
    body('excerpt')
        .optional()
        .isLength({ max: 300 })
        .withMessage('Excerpt cannot exceed 300 characters'),
    body('status')
        .optional()
        .isIn(['draft', 'published', 'archived'])
        .withMessage('Status must be draft, published, or archived'),
    body('isFeatured')
        .optional()
        .isBoolean()
        .withMessage('isFeatured must be a boolean'),
    body('seoTitle')
        .optional()
        .isLength({ max: 60 })
        .withMessage('SEO title cannot exceed 60 characters'),
    body('seoDescription')
        .optional()
        .isLength({ max: 160 })
        .withMessage('SEO description cannot exceed 160 characters')
];

// Update post validation
const updatePostValidation = [
    body('title')
        .optional()
        .isLength({ min: 1, max: 200 })
        .withMessage('Title must be between 1 and 200 characters')
        .trim(),
    body('content')
        .optional()
        .isLength({ min: 10 })
        .withMessage('Content must be at least 10 characters long'),
    body('category')
        .optional()
        .isLength({ min: 1, max: 50 })
        .withMessage('Category must be between 1 and 50 characters')
        .trim(),
    body('tags')
        .optional()
        .isArray()
        .withMessage('Tags must be an array'),
    body('tags.*')
        .optional()
        .isLength({ min: 1, max: 30 })
        .withMessage('Each tag must be between 1 and 30 characters'),
    body('excerpt')
        .optional()
        .isLength({ max: 300 })
        .withMessage('Excerpt cannot exceed 300 characters'),
    body('status')
        .optional()
        .isIn(['draft', 'published', 'archived'])
        .withMessage('Status must be draft, published, or archived'),
    body('isFeatured')
        .optional()
        .isBoolean()
        .withMessage('isFeatured must be a boolean'),
    body('seoTitle')
        .optional()
        .isLength({ max: 60 })
        .withMessage('SEO title cannot exceed 60 characters'),
    body('seoDescription')
        .optional()
        .isLength({ max: 160 })
        .withMessage('SEO description cannot exceed 160 characters')
];

// Get all posts (public)
router.get('/', optionalAuth, [
    query('page')
        .optional()
        .isInt({ min: 1 })
        .withMessage('Page must be a positive integer'),
    query('limit')
        .optional()
        .isInt({ min: 1, max: 50 })
        .withMessage('Limit must be between 1 and 50'),
    query('category')
        .optional()
        .isLength({ min: 1, max: 50 })
        .withMessage('Category must be between 1 and 50 characters'),
    query('tag')
        .optional()
        .isLength({ min: 1, max: 30 })
        .withMessage('Tag must be between 1 and 30 characters'),
    query('search')
        .optional()
        .isLength({ min: 1, max: 100 })
        .withMessage('Search query must be between 1 and 100 characters'),
    query('status')
        .optional()
        .isIn(['draft', 'published', 'archived'])
        .withMessage('Status must be draft, published, or archived'),
    query('featured')
        .optional()
        .isBoolean()
        .withMessage('Featured must be a boolean')
], validate, getAllPosts);

// Get single post by slug
router.get('/:slug', optionalAuth, getPostBySlug);

// Create new post (authenticated users only)
router.post('/', auth, createPostValidation, validate, createPost);

// Update post
router.put('/:id', auth, updatePostValidation, validate, updatePost);

// Delete post
router.delete('/:id', auth, deletePost);

// Get posts by author
router.get('/author/:username', optionalAuth, [
    query('page')
        .optional()
        .isInt({ min: 1 })
        .withMessage('Page must be a positive integer'),
    query('limit')
        .optional()
        .isInt({ min: 1, max: 50 })
        .withMessage('Limit must be between 1 and 50')
], validate, getPostsByAuthor);

// Get categories
router.get('/categories/list', getCategories);

// Get tags
router.get('/tags/list', getTags);

module.exports = router; 