const jwt = require("jsonwebtoken");

exports.generateToken = function (payload, expiresIn = "7d") {
    return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn });
};

exports.verifyToken = function (token) {
    return jwt.verify(token, process.env.JWT_SECRET);
};
