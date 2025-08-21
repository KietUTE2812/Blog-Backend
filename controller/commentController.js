const Comment = require('../models/Comment');
const Post = require('../models/Post');
const response = require('../config/response');
const { handleAsync } = require('../middleware/validation');

// Get comments for a post
const getCommentsForPost = handleAsync(async (req, res) => {
    const { postId } = req.params;
    const { page = 1, limit = 10, sort = 'newest' } = req.query;
    const skip = (page - 1) * limit;

    // Check if post exists and is published
    const post = await Post.findById(postId);
    if (!post) {
        return response(res, 404, 'Post not found');
    }

    if (!req.user || req.user.role !== 'admin') {
        if (post.status !== 'published') {
            return response(res, 404, 'Post not found');
        }
    }

    // Build query
    const query = { post: postId };

    // Only show approved comments for non-authenticated users
    if (!req.user || req.user.role !== 'admin') {
        query.isSpam = false;
    }

    // Build sort
    let sortOption = {};
    switch (sort) {
        case 'oldest':
            sortOption = { createdAt: 1 };
            break;
        case 'mostLiked':
            sortOption = { likeCount: -1, createdAt: -1 };
            break;
        default: // newest
            sortOption = { createdAt: -1 };
    }

    // Get top-level comments (no parent)
    const comments = await Comment.find({ ...query, parentComment: null })
        .populate('author', 'username fullName avatar')
        .populate({
            path: 'replies',
            match: { isApproved: !req.user || req.user.role !== 'admin' ? true : {}, isSpam: !req.user || req.user.role !== 'admin' ? false : {} },
            populate: {
                path: 'author',
                select: 'username fullName avatar'
            }
        })
        .sort(sortOption)
        .skip(skip)
        .limit(parseInt(limit))
        .select('-__v');

    const total = await Comment.countDocuments({ ...query, parentComment: null });

    return response(res, 200, 'Comments retrieved successfully', {
        comments,
        pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total,
            pages: Math.ceil(total / limit)
        }
    });
});

// Create comment
const createComment = handleAsync(async (req, res) => {
    const { content, postId, parentCommentId } = req.body;

    // Check if post exists and is published
    const post = await Post.findById(postId);
    if (!post) {
        return response(res, 404, 'Post not found');
    }

    if (post.status !== 'published') {
        return response(res, 400, 'Cannot comment on unpublished post');
    }

    // Check if parent comment exists (if provided)
    if (parentCommentId) {
        const parentComment = await Comment.findById(parentCommentId);
        if (!parentComment) {
            return response(res, 404, 'Parent comment not found');
        }
        if (parentComment.post.toString() !== postId) {
            return response(res, 400, 'Parent comment does not belong to this post');
        }
    }

    const comment = new Comment({
        content,
        author: req.user._id,
        post: postId,
        parentComment: parentCommentId || null,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
        isApproved: req.user.role === 'admin' // Auto-approve admin comments
    });

    await comment.save();

    // If this is a reply, add it to parent comment's replies
    if (parentCommentId) {
        await Comment.findByIdAndUpdate(parentCommentId, {
            $push: { replies: comment._id }
        });
    }

    // Update post comment count
    await Post.findByIdAndUpdate(postId, {
        $inc: { commentCount: 1 }
    });

    // Populate author info
    await comment.populate('author', 'username fullName avatar');

    return response(res, 201, 'Comment created successfully', { comment });
});

// Update comment
const updateComment = handleAsync(async (req, res) => {
    const { id } = req.params;
    const { content } = req.body;

    const comment = await Comment.findById(id);

    if (!comment) {
        return response(res, 404, 'Comment not found');
    }

    // Check if user is author or admin
    if (comment.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
        return response(res, 403, 'Not authorized to update this comment');
    }

    comment.content = content;
    await comment.save();

    await comment.populate('author', 'username fullName avatar');

    return response(res, 200, 'Comment updated successfully', { comment });
});

// Delete comment
const deleteComment = handleAsync(async (req, res) => {
    const { id } = req.params;

    const comment = await Comment.findById(id);

    if (!comment) {
        return response(res, 404, 'Comment not found');
    }

    // Check if user is author or admin
    if (comment.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
        return response(res, 403, 'Not authorized to delete this comment');
    }

    // Remove from parent comment's replies if it's a reply
    if (comment.parentComment) {
        await Comment.findByIdAndUpdate(comment.parentComment, {
            $pull: { replies: comment._id }
        });
    }

    // Delete all replies to this comment
    await Comment.deleteMany({ parentComment: comment._id });

    // Delete the comment
    await Comment.findByIdAndDelete(comment._id);

    // Update post comment count
    await Post.findByIdAndUpdate(comment.post, {
        $inc: { commentCount: -1 }
    });

    return response(res, 200, 'Comment deleted successfully');
});

// Like/Unlike comment
const likeComment = handleAsync(async (req, res) => {
    const { id } = req.params;

    const comment = await Comment.findById(id);

    if (!comment) {
        return response(res, 404, 'Comment not found');
    }

    const userId = req.user._id;
    const isLiked = comment.likes.includes(userId);

    if (isLiked) {
        // Unlike
        comment.likes = comment.likes.filter(id => id.toString() !== userId.toString());
    } else {
        // Like
        comment.likes.push(userId);
    }

    await comment.save();

    return response(res, 200, isLiked ? 'Comment unliked' : 'Comment liked', {
        likeCount: comment.likeCount,
        isLiked: !isLiked
    });
});

// Approve/Reject comment (admin only)
const approveComment = handleAsync(async (req, res) => {
    const { id } = req.params;
    const { isApproved, isSpam = false } = req.body;

    const comment = await Comment.findById(id);

    if (!comment) {
        return response(res, 404, 'Comment not found');
    }

    comment.isApproved = isApproved;
    comment.isSpam = isSpam;
    await comment.save();

    return response(res, 200, `Comment ${isApproved ? 'approved' : 'rejected'}`, {
        comment: {
            id: comment._id,
            isApproved: comment.isApproved,
            isSpam: comment.isSpam
        }
    });
});

// Get user's comments
const getUserComments = handleAsync(async (req, res) => {
    const { userId } = req.params;
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    // Check if user is viewing their own comments or is admin
    if (req.user._id.toString() !== userId && req.user.role !== 'admin') {
        return response(res, 403, 'Not authorized to view this user\'s comments');
    }

    const comments = await Comment.find({ author: userId })
        .populate('author', 'username fullName avatar')
        .populate('post', 'title slug')
        .sort('-createdAt')
        .skip(skip)
        .limit(parseInt(limit))
        .select('-__v');

    const total = await Comment.countDocuments({ author: userId });

    return response(res, 200, 'Comments retrieved successfully', {
        comments,
        pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total,
            pages: Math.ceil(total / limit)
        }
    });
});

// Get pending comments (admin only)
const getPendingComments = handleAsync(async (req, res) => {
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const comments = await Comment.find({ isApproved: false, isSpam: false })
        .populate('author', 'username fullName avatar')
        .populate('post', 'title slug')
        .sort('-createdAt')
        .skip(skip)
        .limit(parseInt(limit))
        .select('-__v');

    const total = await Comment.countDocuments({ isApproved: false, isSpam: false });

    return response(res, 200, 'Pending comments retrieved successfully', {
        comments,
        pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total,
            pages: Math.ceil(total / limit)
        }
    });
});

module.exports = {
    getCommentsForPost,
    createComment,
    updateComment,
    deleteComment,
    likeComment,
    approveComment,
    getUserComments,
    getPendingComments
}; 