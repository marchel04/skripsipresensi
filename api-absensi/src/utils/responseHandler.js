const { HttpStatusCode } = require("./httpStatusCode.js");

// Success response with data
exports.sendSuccessResponse = function (
    res,
    data,
    message = "Success",
    status = HttpStatusCode.OK
) {
    return res.status(status).json({ success: true, message, data });
};

// Success response without data (e.g., for delete operations)
exports.sendSuccessNoDataResponse = function (
    res,
    message = "Operation successful",
    status = HttpStatusCode.OK
) {
    return res.status(status).json({ success: true, message });
};

// Error response
exports.sendErrorResponse = function (
    res,
    message,
    status = HttpStatusCode.INTERNAL_SERVER_ERROR
) {
    return res.status(status).json({ success: false, error: { message } });
};

// Not Found response
exports.sendNotFoundResponse = function (
    res,
    message,
    status = HttpStatusCode.NOT_FOUND
) {
    return res.status(status).json({ success: false, error: { message } });
};

// Validation Error response
exports.sendValidationError = function (
    res,
    message,
    errors = [],
    status = HttpStatusCode.BAD_REQUEST
) {
    return res.status(status).json({
        success: false,
        error: {
            message,
            errors,
        },
    });
};

// Unauthorized response
exports.sendUnauthorizedResponse = function (
    res,
    message = "Unauthorized",
    status = HttpStatusCode.UNAUTHORIZED
) {
    return res.status(status).json({ success: false, error: { message } });
};

// Forbidden response
exports.sendForbiddenResponse = function (
    res,
    message = "Forbidden",
    status = HttpStatusCode.FORBIDDEN
) {
    return res.status(status).json({ success: false, error: { message } });
};

// Bad Request response
exports.sendBadRequestResponse = function (
    res,
    message,
    status = HttpStatusCode.BAD_REQUEST
) {
    return res.status(status).json({ success: false, error: { message } });
};
