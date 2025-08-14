const jwt = require('jsonwebtoken');
const User = require('../models/User');
const InvalidToken = require('../models/InvalidToken');
const response = require('../config/response');

const auth = async (req, res, next) => {
    /**
     * @description: Xác thực token
     * @param {Object} req - Request object
     * @param {Object} res - Response object
     * @param {Function} next - Next function
     * @returns {Object} - Response object
     * @throws {Object} - Response object
     */
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');

        if (!token) {
            return response(res, 401, 'Access denied. No token provided.');
        }

        const invalidToken = await InvalidToken.findOne({ token });
        if (invalidToken) {
            return response(res, 401, 'Token is invalid.');
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.userId).select('-password');

        if (!user) {
            return response(res, 401, 'Invalid token. User not found.');
        }

        if (!user.isActive) {
            return response(res, 401, 'Account is deactivated.');
        }

        req.user = user;
        next();
    } catch (error) {
        if (error.name === 'JsonWebTokenError') {
            return response(res, 401, 'Invalid token.');
        }
        if (error.name === 'TokenExpiredError') {
            return response(res, 401, 'Token expired.');
        }
        console.log(error);
        return response(res, 500, 'Server error.');
    }
};

const adminAuth = async (req, res, next) => {
    /**
     * @description: Xác thực token và kiểm tra quyền admin
     * @param {Object} req - Request object
     * @param {Object} res - Response object
     * @param {Function} next - Next function
     * @returns {Object} - Response object
     * @throws {Object} - Response object
     */
    try {
        await auth(req, res, () => {
            if (req.user.role !== 'admin') {
                return response(res, 403, 'Access denied. Admin privileges required.');
            }
            next();
        });
    } catch (error) {
        return response(res, 500, 'Server error.');
    }
};

const optionalAuth = async (req, res, next) => {
    /**
     * @description: Xác thực token tùy chọn (không bắt buộc)
     * @param {Object} req - Request object
     * @param {Object} res - Response object
     * @param {Function} next - Next function
     * @returns {Object} - Response object
     * @throws {Object} - Response object
     */
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');

        if (token) {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const user = await User.findById(decoded.userId).select('-password');

            if (user && user.isActive) {
                req.user = user;
            }
        }

        next();
    } catch (error) {
        // Continue without authentication if token is invalid
        next();
    }
};

module.exports = { auth, adminAuth, optionalAuth }; 