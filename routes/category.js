const express = require('express');
const router = express.Router();
const { auth, adminAuth } = require('../middleware/auth');
const { createCategory, getCategories, updateCategory, deleteCategory } = require('../controller/categoryController');
const { body } = require('express-validator');
const { validate } = require('../middleware/validation');

router.post('/', auth, adminAuth, [
    body('name')
        .notEmpty()
        .withMessage('Name is required')
], validate, createCategory);
router.get('/', auth, getCategories);
router.put('/:id', auth, adminAuth, updateCategory);
router.delete('/:id', auth, adminAuth, deleteCategory);

module.exports = router;