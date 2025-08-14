const User = require('../models/User');
const Post = require('../models/Post');
const response = require('../config/response');
const { handleAsync } = require('../middleware/validation');

// Get all users (admin only)
const getAllUsers = handleAsync(async (req, res) => {
    const {
        page = 1,
        limit = 10,
        search,
        role,
        isActive,
        sort = '-createdAt'
    } = req.query;

    const skip = (page - 1) * limit;

    // Build query
    const query = {};

    if (search) {
        query.$or = [
            { username: { $regex: search, $options: 'i' } },
            { fullName: { $regex: search, $options: 'i' } },
            { email: { $regex: search, $options: 'i' } }
        ];
    }

    if (role) query.role = role;
    if (isActive !== undefined) query.isActive = isActive === 'true';

    // Execute query
    const users = await User.find(query)
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit))
        .select('-password -__v');

    const total = await User.countDocuments(query);

    return response(res, 200, 'Users retrieved successfully', {
        users,
        pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total,
            pages: Math.ceil(total / limit)
        }
    });
});

// Get user by username (public)
const getUserByUsername = handleAsync(async (req, res) => {
    const { username } = req.params;

    const user = await User.findOne({ username, isActive: true })
        .select('-password -__v');

    if (!user) {
        return response(res, 404, 'User not found');
    }

    // Get user's published posts count
    const postsCount = await Post.countDocuments({
        author: user._id,
        status: 'published'
    });

    // Get user's total posts count
    const totalPostsCount = await Post.countDocuments({
        author: user._id
    });

    return response(res, 200, 'User retrieved successfully', {
        user: {
            ...user.toObject(),
            postsCount,
            totalPostsCount
        }
    });
});

// Get user's posts (public)
const getUserPosts = handleAsync(async (req, res) => {
    const { username } = req.params;
    const { page = 1, limit = 10, status = 'published' } = req.query;
    const skip = (page - 1) * limit;

    const user = await User.findOne({ username, isActive: true });

    if (!user) {
        return response(res, 404, 'User not found');
    }

    const query = { author: user._id };

    // Only show published posts for non-authenticated users
    if (!req.user || (req.user.role !== 'admin' && req.user._id.toString() !== user._id.toString())) {
        query.status = 'published';
    } else if (status) {
        query.status = status;
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

// Update user (admin or self)
const updateUser = handleAsync(async (req, res) => {
    const { id } = req.params;
    const { fullName, bio, avatar, role, isActive, username } = req.body;

    const user = await User.findById(id);

    if (!user) {
        return response(res, 404, 'User not found');
    }

    // Check if user is updating their own profile or is admin
    if (req.user._id.toString() !== id && req.user.role !== 'admin') {
        return response(res, 403, 'Not authorized to update this user');
    }

    // Only admins can update role and isActive
    if (req.user.role !== 'admin') {
        if (role !== undefined || isActive !== undefined) {
            return response(res, 403, 'Not authorized to update role or active status');
        }
    }

    // Update fields
    if (fullName !== undefined) user.fullName = fullName;
    if (bio !== undefined) user.bio = bio;
    if (avatar !== undefined) user.avatar = avatar;
    if (role !== undefined && req.user.role === 'admin') user.role = role;
    if (isActive !== undefined && req.user.role === 'admin') user.isActive = isActive;
    if (username !== undefined) {
        const existingUser = await User.findOne({ username: username });
        if (existingUser) {
            return response(res, 400, 'Username already exists');
        }
        user.username = username;
    }
    await user.save();

    return response(res, 200, 'User updated successfully', {
        user: {
            id: user._id,
            username: user.username,
            email: user.email,
            fullName: user.fullName,
            bio: user.bio,
            avatar: user.avatar,
            role: user.role,
            isActive: user.isActive
        }
    });
});

// Delete user (admin only)
const deleteUser = handleAsync(async (req, res) => {
    const { id } = req.params;

    // Prevent admin from deleting themselves
    if (req.user._id.toString() === id) {
        return response(res, 400, 'Cannot delete your own account');
    }

    const user = await User.findById(id);

    if (!user) {
        return response(res, 404, 'User not found');
    }

    // Delete user's posts
    await Post.deleteMany({ author: user._id });

    // Delete user
    await User.findByIdAndDelete(id);

    return response(res, 200, 'User and all associated posts deleted successfully');
});

// Get user statistics (admin or self)
const getUserStats = handleAsync(async (req, res) => {
    const { id } = req.params;

    // Check if user is viewing their own stats or is admin
    if (req.user._id.toString() !== id && req.user.role !== 'admin') {
        return response(res, 403, 'Not authorized to view this user\'s stats');
    }

    const user = await User.findById(id);

    if (!user) {
        return response(res, 404, 'User not found');
    }

    // Get post statistics
    const totalPosts = await Post.countDocuments({ author: user._id });
    const publishedPosts = await Post.countDocuments({ author: user._id, status: 'published' });
    const draftPosts = await Post.countDocuments({ author: user._id, status: 'draft' });
    const archivedPosts = await Post.countDocuments({ author: user._id, status: 'archived' });

    // Get total views and likes
    const posts = await Post.find({ author: user._id });
    const totalViews = posts.reduce((sum, post) => sum + post.viewCount, 0);
    const totalLikes = posts.reduce((sum, post) => sum + post.likeCount, 0);

    // Get recent activity
    const recentPosts = await Post.find({ author: user._id })
        .sort('-updatedAt')
        .limit(5)
        .select('title status updatedAt');

    return response(res, 200, 'User statistics retrieved successfully', {
        stats: {
            totalPosts,
            publishedPosts,
            draftPosts,
            archivedPosts,
            totalViews,
            totalLikes,
            averageViews: totalPosts > 0 ? Math.round(totalViews / totalPosts) : 0,
            averageLikes: totalPosts > 0 ? Math.round(totalLikes / totalPosts) : 0
        },
        recentActivity: recentPosts
    });
});

module.exports = {
    getAllUsers,
    getUserByUsername,
    getUserPosts,
    updateUser,
    deleteUser,
    getUserStats
}; 