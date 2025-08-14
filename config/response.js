const response = (res, statusCode, message, data = null, errors = null) => {
    const responseObj = {
        success: statusCode >= 200 && statusCode < 300,
        message: message,
        timestamp: new Date().toISOString()
    };

    if (data !== null) {
        responseObj.data = data;
    }

    if (errors !== null) {
        responseObj.errors = errors;
    }

    return res.status(statusCode).json(responseObj);
};

module.exports = response;