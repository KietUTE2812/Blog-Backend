const Post = require('../models/Post');
const User = require('../models/User');
const response = require('../config/response');
const { handleAsync } = require('../middleware/validation');

// Get all posts
const getAllPosts = handleAsync(async (req, res) => {

    const {
        page = 1,
        limit = 10,
        category,
        tag,
        search,
        status,
        featured,
        sort = '-publishedAt'
    } = req.query;

    const skip = (page - 1) * limit;

    // Build query
    const query = {};

    // Only show published posts for non-authenticated users
    if (!req.user || req.user.role !== 'admin') {
        query.status = 'published';
    } else if (status) {
        query.status = status;
    }
    else {
        delete query.status;
    }

    if (category) query.category = category.toLowerCase();
    if (tag) query.tags = tag.toLowerCase();
    if (featured !== undefined) query.isFeatured = featured === 'true';

    if (search) {
        query.$text = { $search: search };
    }

    // Execute query
    const posts = await Post.find(query)
        .populate('author', 'username fullName avatar')
        .populate('category', 'name slug')
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit))
        .select('-__v');

    const total = await Post.countDocuments(query);

    return response(res, 200, 'Posts retrieved successfully', {
        posts,
        pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total,
            pages: Math.ceil(total / limit)
        }
    });
});

// Get single post by slug
const getPostBySlug = handleAsync(async (req, res) => {
    const { slug } = req.params;

    const query = { slug };

    // Only show published posts for non-authenticated users
    if (!req.user || req.user.role !== 'admin') {
        query.status = 'published';
    }
    else {
        delete query.status;
    }

    const post = await Post.findOne(query)
        .populate('author', 'username fullName avatar bio')
        .populate('category', 'name slug')
        .select('-__v');

    if (!post) {
        return response(res, 404, 'Post not found');
    }

    // Increment view count
    post.viewCount += 1;
    await post.save();

    return response(res, 200, 'Post retrieved successfully', { post });
});

// Create new post
const createPost = handleAsync(async (req, res) => {
    const {
        title,
        content,
        excerpt,
        category,
        slug,
        tags = [],
        status = 'draft',
        isFeatured = false,
        featuredImage,
        seoTitle,
        seoDescription
    } = req.body;

    const post = new Post({
        title,
        content,
        excerpt: excerpt || content.substring(0, 300),
        category: category.toLowerCase(),
        slug: slug.toLowerCase(),
        tags: tags.map(tag => tag.toLowerCase()),
        status,
        isFeatured,
        featuredImage,
        author: req.user._id,
        seoTitle: seoTitle || title,
        seoDescription: seoDescription || excerpt || content.substring(0, 160)
    });

    await post.save();

    const populatedPost = await Post.findOne({ $or: [{ slug: slug }, { _id: post._id }] })
        .populate('author', 'username fullName avatar');

    return response(res, 201, 'Post created successfully', {
        post: populatedPost
    });
});

// Update post
const updatePost = handleAsync(async (req, res) => {
    const { id } = req.params;
    const post = await Post.findOne({ slug: id });
    console.log(post);

    if (!post) {
        return response(res, 404, 'Post not found');
    }

    // Check if user is author or admin
    if (post.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
        return response(res, 403, 'Not authorized to update this post');
    }

    // Update fields
    const updateFields = ['title', 'content', 'excerpt', 'category', 'slug', 'tags', 'status', 'isFeatured', 'featuredImage', 'seoTitle', 'seoDescription'];

    updateFields.forEach(field => {
        if (req.body[field] !== undefined) {
            if (field === 'category') {
                post[field] = req.body[field].toLowerCase();
            } else if (field === 'slug') {
                post[field] = req.body[field].toLowerCase();
            } else if (field === 'tags') {
                post[field] = req.body[field].map(tag => tag.toLowerCase());
            } else {
                post[field] = req.body[field];
            }
        }
    });

    await post.save();

    const updatedPost = await Post.findOne({ slug: id })
        .populate('author', 'username fullName avatar');

    return response(res, 200, 'Post updated successfully', {
        post: updatedPost
    });
});

// Delete post
const deletePost = handleAsync(async (req, res) => {
    const { id } = req.params;
    const post = await Post.findOne({ slug: id });

    if (!post) {
        return response(res, 404, 'Post not found');
    }

    // Check if user is author or admin
    if (post.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
        return response(res, 403, 'Not authorized to delete this post');
    }

    await Post.findOneAndDelete({ slug: id });

    return response(res, 200, 'Post deleted successfully');
});

// Get posts by author
const getPostsByAuthor = handleAsync(async (req, res) => {
    const { username } = req.params;
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const user = await User.findOne({ username });

    if (!user) {
        return response(res, 404, 'User not found');
    }

    const query = { author: user._id };

    // Only show published posts for non-authenticated users
    if (!req.user || req.user.role !== 'admin') {
        query.status = 'published';
    }

    const posts = await Post.find(query)
        .populate('author', 'username fullName avatar')
        .sort('-publishedAt')
        .skip(skip)
        .limit(parseInt(limit))
        .select('-__v');

    const total = await Post.countDocuments(query);

    return response(res, 200, 'Posts retrieved successfully', {
        posts,
        author: {
            username: user.username,
            fullName: user.fullName,
            avatar: user.avatar,
            bio: user.bio
        },
        pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total,
            pages: Math.ceil(total / limit)
        }
    });
});

// Get categories
const getCategories = handleAsync(async (req, res) => {
    const categories = await Post.distinct('category', { status: 'published' });
    return response(res, 200, 'Categories retrieved successfully', { categories });
});

// Get tags
const getTags = handleAsync(async (req, res) => {
    const tags = await Post.distinct('tags', { status: 'published' });
    return response(res, 200, 'Tags retrieved successfully', { tags });
});

module.exports = {
    getAllPosts,
    getPostBySlug,
    createPost,
    updatePost,
    deletePost,
    getPostsByAuthor,
    getCategories,
    getTags
}; 