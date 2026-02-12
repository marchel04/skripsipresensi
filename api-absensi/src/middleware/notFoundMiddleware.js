const { sendNotFoundResponse } = require("../utils/responseHandler");

const notFoundHandler = function notFoundHandler(req, res, next) {
    const notFoundMessage = {
        Requested_URL: req.originalUrl,
        success: false,
        error: "Error 404 - Not Found",
    };

    return sendNotFoundResponse(res, notFoundMessage);
};

module.exports = notFoundHandler;
