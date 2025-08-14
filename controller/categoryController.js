    const Category = require('../models/Category');
    const response = require('../config/response');
const { handleAsync } = require('../middleware/validation');

const createCategory = handleAsync(async (req, res) => {
    const { name, slug, description } = req.body;

    if (!name || !description) {
        return response(res, 400, 'Name and description are required', {
            errors: [{ field: 'name', message: 'Name is required' }, { field: 'description', message: 'Description is required' }]
        });
    }

    if (!slug) {
        slug = name.toLowerCase().replace(/ /g, '-');
    }

    const existingCategory = await Category.findOne({ name });
    if (existingCategory) {
        return response(res, 400, 'Category already exists', {
            errors: [{ field: 'name', message: 'Category already exists' }]
        });
    }
    const category = await Category.create({ name, slug, description });
    response(res, 201, 'Category created successfully', category);
});

const getCategories = handleAsync(async (req, res) => {
    const categories = await Category.find().sort({ createdAt: -1 });
    response(res, 200, 'Categories fetched successfully', categories);
});

const updateCategory = handleAsync(async (req, res) => {
    const { id } = req.params;
    const { name, slug, description } = req.body;
    const category = await Category.findByIdAndUpdate(id, { name, slug, description }, { new: true });
    response(res, 200, 'Category updated successfully', category);
});

const deleteCategory = handleAsync(async (req, res) => {
    const { id } = req.params;
    await Category.findByIdAndDelete(id);
    response(res, 200, 'Category deleted successfully');
});


module.exports = { createCategory, getCategories, updateCategory, deleteCategory };