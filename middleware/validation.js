const { validationResult } = require('express-validator');
const response = require('../config/response');

const validate = (req, res, next) => {
    /**
     * @description: Xác thực dữ liệu đầu vào (Nếu có lỗi sẽ trả về lỗi)
     * @param {Object} req - Request object
     * @param {Object} res - Response object
     * @param {Function} next - Next function
     * @returns {Object} - Response object
     * @throws {Object} - Response object
     */
    const errors = validationResult(req); // Lấy lỗi từ express-validator
    if (!errors.isEmpty()) {
        console.log(errors.array());
        return response(res, 400, 'Validation failed: ' + errors.array()[0].msg, null, errors.array().map(error => ({
            field: error.path,
            message: error.msg,
            value: error.value
        })));
    }
    next();
};

const handleAsync = (fn) => {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};

module.exports = { validate, handleAsync }; 